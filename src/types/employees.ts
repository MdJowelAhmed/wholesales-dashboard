import { BaseEntity } from './common'
import { WageRateType } from '../lib/calculations/financialCalculations'

export interface EmployeeLedgerEntry {
  id: string
  date: string
  type: 'wage_earned' | 'salary_credited' | 'payment_issued' | 'advance_given' | 'advance_recovery'
  description: string
  debit: number // payment/advance to employee decreases liability
  credit: number // wage/salary increases liability
  balance: number
}

export interface EmployeeAdvance {
  id: string
  date: string
  amount: number
  repaidAmount: number
  notes?: string
}

export interface Employee extends BaseEntity {
  name: string
  employeeCode: string
  phone: string
  address: string
  designation: string // e.g. "Master Tailor", "Sewing Machine Operator", "Finishing Assistant"
  joiningDate: string
  compensationMethod: WageRateType
  ratePerPiece?: number
  ratePerDozen?: number
  monthlySalary?: number
  totalEarnedWages: number
  totalPaymentsMade: number
  totalAdvancesOutstanding: number
  currentPayableBalance: number
  status: 'active' | 'inactive'
}
