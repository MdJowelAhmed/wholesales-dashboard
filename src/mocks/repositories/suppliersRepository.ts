import { Supplier, SupplierLedgerEntry, SupplierPayment } from '@/types/suppliers'
import { roundCurrency } from '@/lib/calculations/financialCalculations'
import { mockStorage } from '../storage/localStorageAdapter'

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

    const payment: SupplierPayment = {
      id: `spay-${Date.now()}`,
      date: input.date,
      amount: roundCurrency(input.amount),
      paymentMethod: input.paymentMethod,
      reference: input.reference,
      notes: input.notes,
    }

    supplier.totalPayments = roundCurrency(supplier.totalPayments + input.amount)
    supplier.outstandingPayable = roundCurrency(
      Math.max(0, supplier.outstandingPayable - input.amount)
    )

    const ledger = db.supplierLedger[supplier.id] || []
    const previousBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0
    const newBalance = roundCurrency(Math.max(0, previousBalance - input.amount))

    ledger.push({
      id: `sledg-${Date.now()}`,
      date: input.date,
      type: 'payment',
      description: `Payment made (${input.paymentMethod}): ${input.reference}`,
      debit: input.amount,
      credit: 0,
      balance: newBalance,
    })
    db.supplierLedger[supplier.id] = ledger

    mockStorage.saveDatabase(db)
    return payment
  }

  public async createSupplier(
    input: Omit<Supplier, 'id' | 'createdAt' | 'totalPurchases' | 'totalPayments' | 'outstandingPayable'>
  ): Promise<Supplier> {
    const db = mockStorage.getDatabase()
    const newSupplier: Supplier = {
      ...input,
      id: `sup-${Date.now()}`,
      totalPurchases: 0,
      totalPayments: 0,
      outstandingPayable: 0,
      createdAt: new Date().toISOString(),
    }
    const updatedDb = {
      ...db,
      suppliers: [...db.suppliers, newSupplier],
    }
    mockStorage.saveDatabase(updatedDb)
    return newSupplier
  }
}

export const suppliersRepository = new SuppliersRepository()
