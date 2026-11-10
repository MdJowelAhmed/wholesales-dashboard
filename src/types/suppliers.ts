import { BaseEntity, PaymentMethod } from './common'

export interface SupplierPurchase {
  id: string
  invoiceNumber: string
  date: string
  materialsSummary: string
  totalAmount: number
  paidAmount: number
  outstandingBalance: number
}

export interface SupplierPayment {
  id: string
  date: string
  amount: number
  paymentMethod: PaymentMethod
  reference: string
  notes?: string
}

export interface SupplierLedgerEntry {
  id: string
  date: string
  type: 'purchase' | 'payment' | 'adjustment'
  description: string
  debit: number // payment decreases what we owe
  credit: number // purchase increases what we owe
  balance: number
}

export interface Supplier extends BaseEntity {
  name: string
  contactPerson: string
  phone: string
  address: string
  materialsSupplied: string[]
  totalPurchases: number
  totalPayments: number
  outstandingPayable: number
  status: 'active' | 'inactive'
}
