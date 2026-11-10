import { BaseEntity, PaymentMethod } from './common'

export interface PaymentRecord extends BaseEntity {
  receiptNumber: string
  date: string
  partyType: 'shopkeeper' | 'customer' | 'supplier' | 'employee'
  partyId: string
  partyName: string
  amount: number
  paymentMethod: PaymentMethod
  referenceTransactionId?: string
  referenceTransactionCode?: string
  notes?: string
}

export interface ExpenseRecord extends BaseEntity {
  expenseNumber: string
  date: string
  title: string
  category: 'rent' | 'electricity' | 'transport' | 'packaging' | 'maintenance' | 'food_entertainment' | 'other'
  amount: number
  paymentMethod: PaymentMethod
  reference?: string
  notes?: string
}

export interface PayrollRecord extends BaseEntity {
  period: string // e.g. "October 2026"
  employeeId: string
  employeeName: string
  designation: string
  compensationMethod: string
  monthlySalary: number
  pieceRateEarnings: number
  incentives: number
  advancesDeducted: number
  adjustments: number
  netPayable: number
  paidAmount: number
  remainingPayable: number
  status: 'paid' | 'partial' | 'pending'
}
