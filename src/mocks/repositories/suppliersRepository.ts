import { Supplier, SupplierLedgerEntry, SupplierPayment } from '@/types/suppliers'
import { generateId } from '@/lib/ids'
import { mockStorage } from '../storage/localStorageAdapter'
import { STORAGE_SCOPES } from '../storage/storageScopes'

const SUPPLIER_WRITE_SCOPES = [STORAGE_SCOPES.SUPPLIERS, STORAGE_SCOPES.FINANCE, STORAGE_SCOPES.MATERIALS] as const
import { ledgerEngine } from './ledgerEngine'
import { financeRepository } from './financeRepository'

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

    const record = await financeRepository.recordPayment({
      date: input.date,
      partyType: 'supplier',
      partyId: supplier.id,
      partyName: supplier.name,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      reference: input.reference,
      notes: input.notes,
    })

    return {
      id: record.id,
      date: record.date,
      amount: record.amount,
      paymentMethod: record.paymentMethod,
      reference: input.reference,
      notes: input.notes,
    }
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
    mockStorage.saveDatabase(updatedDb, [...SUPPLIER_WRITE_SCOPES])
    return newSupplier
  }
}

export const suppliersRepository = new SuppliersRepository()
