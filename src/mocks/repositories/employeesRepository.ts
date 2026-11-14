import { Employee, EmployeeAdvance, EmployeeLedgerEntry, EmployeePaymentItem } from '@/types/employees'
import { ProductionEntry } from '@/types/production'
import { roundCurrency } from '@/lib/calculations/financialCalculations'
import { generateId } from '@/lib/ids'
import { mockStorage } from '../storage/localStorageAdapter'
import { STORAGE_SCOPES } from '../storage/storageScopes'

const EMPLOYEE_WRITE_SCOPES = [STORAGE_SCOPES.EMPLOYEES, STORAGE_SCOPES.FINANCE, STORAGE_SCOPES.PRODUCTION] as const
import { ledgerEngine } from './ledgerEngine'
import { financeRepository } from './financeRepository'

export class EmployeesRepository {
  public async listEmployees(): Promise<Employee[]> {
    const db = mockStorage.getDatabase()
    return db.employees
  }

  public async getEmployeeById(id: string): Promise<Employee | null> {
    const db = mockStorage.getDatabase()
    return db.employees.find((e) => e.id === id) || null
  }

  public async getEmployeeWorkHistory(employeeId: string): Promise<ProductionEntry[]> {
    const db = mockStorage.getDatabase()
    const entries = (db.productionEntries || []).filter((e) => e.employeeId === employeeId)
    return [...entries].sort(
      (a, b) => new Date(b.productionDate).getTime() - new Date(a.productionDate).getTime()
    )
  }

  public async getEmployeePaymentHistory(employeeId: string): Promise<EmployeePaymentItem[]> {
    const ledger = await this.getEmployeeLedger(employeeId)
    const paymentEntries = ledger.filter(
      (e) => e.type === 'payment_issued' || e.type === 'advance_given' || e.debit > 0
    )

    return paymentEntries.map((e) => ({
      id: e.id,
      date: e.date,
      type: e.type === 'advance_given' ? 'cash_advance' : 'salary_payment',
      reference: e.description.split(':')[0] || 'VOUCHER',
      amount: e.debit,
      notes: e.description,
      runningBalance: e.balance,
    }))
  }

  public async getEmployeeLedger(employeeId: string): Promise<EmployeeLedgerEntry[]> {
    const db = mockStorage.getDatabase()
    const entries = ledgerEngine.getPartyLedger(db, 'employee', employeeId)
    if (entries.length > 0) {
      return entries.map((e) => {
        let type: EmployeeLedgerEntry['type'] = 'advance_recovery'
        if (e.type === 'work' || e.type === 'salary') {
          type = e.debit > 0 ? 'payment_issued' : 'wage_earned'
        } else if (e.type === 'advance') {
          type = 'advance_given'
        } else if (e.type === 'payment') {
          type = 'payment_issued'
        }

        return {
          id: e.id,
          date: e.date,
          type,
          description: e.note || `${e.type.toUpperCase()}: ${e.refId}`,
          debit: e.debit,
          credit: e.credit,
          balance: e.balanceAfter ?? e.balance ?? 0,
        }
      })
    }
    return db.employeeLedger[employeeId] || []
  }

  public async recordAdvance(input: {
    employeeId: string
    date: string
    amount: number
    notes?: string
  }): Promise<EmployeeAdvance> {
    const db = mockStorage.getDatabase()
    const employee = db.employees.find((e) => e.id === input.employeeId)
    if (!employee) throw new Error(`Employee not found: ${input.employeeId}`)

    const advanceId = generateId('eadv')
    const advance: EmployeeAdvance = {
      id: advanceId,
      date: input.date,
      amount: roundCurrency(input.amount),
      repaidAmount: 0,
      notes: input.notes,
    }

    employee.totalAdvancesOutstanding = roundCurrency(
      employee.totalAdvancesOutstanding + input.amount
    )

    const { db: updatedDb } = ledgerEngine.appendLedgerEntry(db, {
      partyType: 'employee',
      partyId: employee.id,
      date: input.date,
      type: 'advance',
      refType: 'advance',
      refId: advanceId,
      debit: input.amount,
      credit: 0,
      note: `Advance given: ${input.notes || 'Cash Advance'}`,
    })

    mockStorage.saveDatabase(updatedDb, [...EMPLOYEE_WRITE_SCOPES])
    return advance
  }

  public async recordSalaryPayment(input: {
    employeeId: string
    date: string
    amount: number
    notes?: string
    paymentMethod?: 'cash' | 'bank_transfer' | 'cheque' | 'bkash' | 'nagad'
  }): Promise<void> {
    const db = mockStorage.getDatabase()
    const employee = db.employees.find((e) => e.id === input.employeeId)
    if (!employee) throw new Error(`Employee not found: ${input.employeeId}`)

    await financeRepository.recordPayment({
      date: input.date,
      partyType: 'employee',
      partyId: employee.id,
      partyName: employee.name,
      amount: input.amount,
      paymentMethod: input.paymentMethod ?? 'cash',
      notes: input.notes ?? 'Salary/Wage payment issued',
    })
  }

  public async recoverAdvance(input: {
    employeeId: string
    amount: number
    date?: string
    notes?: string
  }): Promise<void> {
    const db = mockStorage.getDatabase()
    const employee = db.employees.find((e) => e.id === input.employeeId)
    if (!employee) throw new Error(`Employee not found: ${input.employeeId}`)

    const recovered = Math.min(employee.totalAdvancesOutstanding, input.amount)
    employee.totalAdvancesOutstanding = roundCurrency(
      Math.max(0, employee.totalAdvancesOutstanding - recovered)
    )

    mockStorage.saveDatabase(db, [...EMPLOYEE_WRITE_SCOPES])
  }

  public async createEmployee(
    input: Omit<
      Employee,
      | 'id'
      | 'createdAt'
      | 'totalEarnedWages'
      | 'totalAdvancesOutstanding'
      | 'totalPaymentsMade'
      | 'currentPayableBalance'
    >
  ): Promise<Employee> {
    const db = mockStorage.getDatabase()
    const newEmployee: Employee = {
      ...input,
      id: generateId('emp'),
      totalEarnedWages: 0,
      totalAdvancesOutstanding: 0,
      totalPaymentsMade: 0,
      currentPayableBalance: 0,
      createdAt: new Date().toISOString(),
    }
    const updatedDb = {
      ...db,
      employees: [...db.employees, newEmployee],
    }
    mockStorage.saveDatabase(updatedDb, [...EMPLOYEE_WRITE_SCOPES])
    return newEmployee
  }
}

export const employeesRepository = new EmployeesRepository()
