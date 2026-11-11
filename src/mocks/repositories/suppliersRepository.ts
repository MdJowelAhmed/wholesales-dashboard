import { Supplier, SupplierLedgerEntry, SupplierPayment } from '@/types/suppliers'
import { roundCurrency } from '@/lib/calculations/financialCalculations'
import { generateId } from '@/lib/ids'
import { mockStorage } from '../storage/localStorageAdapter'
import { ledgerEngine } from './ledgerEngine'

export class SuppliersRepository {
  public async listSuppliers(): Promise<Supplier[]> {
    const db = mockStorage.getDatabase()
    return db.suppliers
  }

  public async getSupplierById(id: string): Promise<Supplier | null> {
    const db = mockStorage.getDatabase()
    return db.suppliers.find((s) => s.id === id) || null
  }

  public async getSupplierLedger(supplierId: string): Promise<SupplierLedgerEntry[]> {
    const db = mockStorage.getDatabase()
    const entries = ledgerEngine.getPartyLedger(db, 'supplier', supplierId)
    if (entries.length > 0) {
      return entries.map((e) => ({
        id: e.id,
        date: e.date,
        type: e.type === 'purchase' ? 'purchase' : 'payment',
        description: e.note || `${e.type.toUpperCase()}: ${e.refId}`,
        debit: e.debit,
        credit: e.credit,
        balance: e.balanceAfter ?? e.balance ?? 0,
      }))
    }
    return db.supplierLedger[supplierId] || []
  }

  public async recordPayment(input: {
    supplierId: string
    date: string
    amount: number
    paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'bkash' | 'nagad'
    reference: string
    notes?: string
  }): Promise<SupplierPayment> {
    const db = mockStorage.getDatabase()
    const supplier = db.suppliers.find((s) => s.id === input.supplierId)
    if (!supplier) throw new Error(`Supplier not found: ${input.supplierId}`)

    const paymentId = generateId('spay')
    const payment: SupplierPayment = {
      id: paymentId,
      date: input.date,
      amount: roundCurrency(input.amount),
      paymentMethod: input.paymentMethod,
      reference: input.reference,
      notes: input.notes,
    }

    supplier.totalPayments = roundCurrency(supplier.totalPayments + input.amount)

    const { db: updatedDb } = ledgerEngine.appendLedgerEntry(db, {
      partyType: 'supplier',
      partyId: supplier.id,
      date: input.date,
      type: 'payment',
      refType: 'payment',
      refId: input.reference,
      debit: input.amount,
      credit: 0,
      note: `Payment made (${input.paymentMethod}): ${input.reference}`,
    })

    mockStorage.saveDatabase(updatedDb)
    return payment
  }

  public async createSupplier(
    input: Omit<
      Supplier,
      | 'id'
      | 'createdAt'
      | 'totalPurchases'
      | 'totalPayments'
      | 'outstandingPayable'
    >
  ): Promise<Supplier> {
    const db = mockStorage.getDatabase()
    const newSupplier: Supplier = {
      ...input,
      id: generateId('sup'),
      totalPurchases: 0,
      totalPayments: 0,
      outstandingPayable: 0,
      createdAt: new Date().toISOString(),
    }
    const updatedDb = {
      ...db,
      suppliers: [newSupplier, ...db.suppliers],
    }
    mockStorage.saveDatabase(updatedDb)
    return newSupplier
  }
}

export const suppliersRepository = new SuppliersRepository()
