import { SeedDatabase } from '../seed'
import { LedgerEntry, AppendLedgerEntryInput, LedgerPartyType } from '@/types/ledger'
import { roundCurrency } from '@/lib/calculations/financialCalculations'
import { generateId } from '@/lib/ids'

export class LedgerEngine {
  /**
   * Retrieves all ledger entries for a given party in chronological order.
   */
  public getPartyLedger(
    db: SeedDatabase,
    partyType: LedgerPartyType,
    partyId: string
  ): LedgerEntry[] {
    const entries: LedgerEntry[] = db.ledgerEntries || []
    return entries
      .filter((e: LedgerEntry) => e.partyType === partyType && e.partyId === partyId)
      .sort((a: LedgerEntry, b: LedgerEntry) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  /**
   * Gets the current signed running balance for a party.
   * Customers/Shopkeepers: positive = owes us, negative = overpaid/advance.
   * Suppliers/Employees: positive = we owe them, negative = advance given.
   */
  public getPartyBalance(
    db: SeedDatabase,
    partyType: LedgerPartyType,
    partyId: string
  ): number {
    const ledger = this.getPartyLedger(db, partyType, partyId)
    if (ledger.length > 0) {
      return ledger[ledger.length - 1].balanceAfter
    }

    if (partyType === 'shopkeeper') {
      const sk = (db.shopkeepers || []).find((s) => s.id === partyId)
      return sk?.outstandingBalance || 0
    }
    if (partyType === 'customer') {
      const cust = (db.customers || []).find((c) => c.id === partyId)
      return cust?.outstandingBalance || 0
    }
    if (partyType === 'supplier') {
      const sup = (db.suppliers || []).find((s) => s.id === partyId)
      return sup?.outstandingPayable || 0
    }
    if (partyType === 'employee') {
      const emp = (db.employees || []).find((e) => e.id === partyId)
      return emp?.currentPayableBalance || 0
    }

    return 0
  }

  /**
   * Appends an entry to the shared ledger and calculates the signed balanceAfter.
   * Returns a clone of db with the entry appended (immutable).
   */
  public appendLedgerEntry(
    db: SeedDatabase,
    input: AppendLedgerEntryInput
  ): { db: SeedDatabase; entry: LedgerEntry } {
    const currentBalance = this.getPartyBalance(db, input.partyType, input.partyId)

    const debit = roundCurrency(input.debit || 0)
    const credit = roundCurrency(input.credit || 0)

    let newBalance = currentBalance
    if (input.partyType === 'customer' || input.partyType === 'shopkeeper') {
      // Receivables: debit increases due, credit decreases due
      newBalance = roundCurrency(currentBalance + debit - credit)
    } else {
      // Payables (supplier / employee): credit increases payable, debit decreases payable
      newBalance = roundCurrency(currentBalance + credit - debit)
    }

    const newEntry: LedgerEntry = {
      id: generateId('led'),
      partyType: input.partyType,
      partyId: input.partyId,
      date: input.date,
      type: input.type,
      refType: input.refType,
      refId: input.refId,
      debit,
      credit,
      balanceAfter: newBalance,
      balance: newBalance,
      note: input.note,
      reversalOf: input.reversalOf,
      createdAt: new Date().toISOString(),
    }

    const nextEntries: LedgerEntry[] = [...(db.ledgerEntries || []), newEntry]

    // Also update cached balance on the party record immutably
    const updatedDb = this.syncCachedPartyBalance({ ...db, ledgerEntries: nextEntries }, input.partyType, input.partyId, newBalance)

    return {
      db: updatedDb,
      entry: newEntry,
    }
  }

  /**
   * Reverses an existing ledger entry by appending an opposite entry.
   * Ledger entries are NEVER deleted or edited directly.
   */
  public reverseLedgerEntry(
    db: SeedDatabase,
    entryId: string,
    reason: string
  ): { db: SeedDatabase; reversalEntry: LedgerEntry } {
    const entries: LedgerEntry[] = db.ledgerEntries || []
    const original = entries.find((e: LedgerEntry) => e.id === entryId)
    if (!original) {
      throw new Error(`Ledger entry not found for reversal: ${entryId}`)
    }

    // Check if already reversed
    const alreadyReversed = entries.some((e: LedgerEntry) => e.reversalOf === entryId)
    if (alreadyReversed) {
      throw new Error(`Ledger entry ${entryId} has already been reversed`)
    }

    const res = this.appendLedgerEntry(db, {
      partyType: original.partyType,
      partyId: original.partyId,
      date: new Date().toISOString().split('T')[0],
      type: 'reversal',
      refType: original.refType,
      refId: original.refId,
      debit: original.credit, // swap debit and credit to exactly counteract
      credit: original.debit,
      note: `Reversal of ${original.id}: ${reason}`,
      reversalOf: original.id,
    })

    return {
      db: res.db,
      reversalEntry: res.entry,
    }
  }

  /**
   * Updates cached party balances on parent entity (shopkeeper, supplier, employee, customer)
   */
  private syncCachedPartyBalance(
    db: SeedDatabase,
    partyType: LedgerPartyType,
    partyId: string,
    newBalance: number
  ): SeedDatabase {
    if (partyType === 'shopkeeper') {
      const idx = (db.shopkeepers || []).findIndex((s) => s.id === partyId)
      if (idx !== -1) {
        const nextShopkeepers = [...db.shopkeepers]
        nextShopkeepers[idx] = {
          ...nextShopkeepers[idx],
          outstandingBalance: newBalance,
        }
        return { ...db, shopkeepers: nextShopkeepers }
      }
    } else if (partyType === 'customer') {
      const idx = (db.customers || []).findIndex((c) => c.id === partyId)
      if (idx !== -1) {
        const nextCustomers = [...db.customers]
        nextCustomers[idx] = {
          ...nextCustomers[idx],
          outstandingBalance: newBalance,
        }
        return { ...db, customers: nextCustomers }
      }
    } else if (partyType === 'supplier') {
      const idx = (db.suppliers || []).findIndex((s) => s.id === partyId)
      if (idx !== -1) {
        const nextSuppliers = [...db.suppliers]
        nextSuppliers[idx] = {
          ...nextSuppliers[idx],
          outstandingPayable: newBalance,
        }
        return { ...db, suppliers: nextSuppliers }
      }
    } else if (partyType === 'employee') {
      const idx = (db.employees || []).findIndex((e) => e.id === partyId)
      if (idx !== -1) {
        const nextEmployees = [...db.employees]
        nextEmployees[idx] = {
          ...nextEmployees[idx],
          currentPayableBalance: newBalance,
        }
        return { ...db, employees: nextEmployees }
      }
    }
    return db
  }
}

export const ledgerEngine = new LedgerEngine()
