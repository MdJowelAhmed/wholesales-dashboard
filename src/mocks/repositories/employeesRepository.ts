import { Employee, EmployeeAdvance, EmployeeLedgerEntry } from '@/types/employees'
import { roundCurrency } from '@/lib/calculations/financialCalculations'
import { mockStorage } from '../storage/localStorageAdapter'

export class EmployeesRepository {
  public async listEmployees(): Promise<Employee[]> {
    const db = mockStorage.getDatabase()
    return db.employees
  }

  public async getEmployeeById(id: string): Promise<Employee | null> {
    const db = mockStorage.getDatabase()
    return db.employees.find((e) => e.id === id) || null
  }

  public async getEmployeeLedger(employeeId: string): Promise<EmployeeLedgerEntry[]> {
    const db = mockStorage.getDatabase()
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

    const advance: EmployeeAdvance = {
      id: `eadv-${Date.now()}`,
      date: input.date,
      amount: roundCurrency(input.amount),
      repaidAmount: 0,
      notes: input.notes,
    }

    employee.totalAdvancesOutstanding = roundCurrency(
      employee.totalAdvancesOutstanding + input.amount
    )
    employee.currentPayableBalance = roundCurrency(
      employee.currentPayableBalance - input.amount
    )

    const ledger = db.employeeLedger[employee.id] || []
    const previousBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0
    const newBalance = roundCurrency(previousBalance - input.amount)

    ledger.push({
      id: `eledg-${Date.now()}`,
      date: input.date,
      type: 'advance_given',
      description: `Advance given: ${input.notes || 'Cash Advance'}`,
      debit: input.amount,
      credit: 0,
      balance: newBalance,
    })
    db.employeeLedger[employee.id] = ledger

    mockStorage.saveDatabase(db)
    return advance
  }

  public async recordSalaryPayment(input: {
    employeeId: string
    date: string
    amount: number
    notes?: string
  }): Promise<void> {
    const db = mockStorage.getDatabase()
    const employee = db.employees.find((e) => e.id === input.employeeId)
    if (!employee) throw new Error(`Employee not found: ${input.employeeId}`)

    employee.totalPaymentsMade = roundCurrency(employee.totalPaymentsMade + input.amount)
    employee.currentPayableBalance = roundCurrency(
      Math.max(0, employee.currentPayableBalance - input.amount)
    )

    const ledger = db.employeeLedger[employee.id] || []
    const previousBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0
    const newBalance = roundCurrency(Math.max(0, previousBalance - input.amount))

    ledger.push({
      id: `eledg-${Date.now()}`,
      date: input.date,
      type: 'payment_issued',
      description: `Salary/Wage payment issued: ${input.notes || 'Settlement'}`,
      debit: input.amount,
      credit: 0,
      balance: newBalance,
    })
    db.employeeLedger[employee.id] = ledger

    mockStorage.saveDatabase(db)
  }

  public async createEmployee(
    input: Omit<Employee, 'id' | 'createdAt' | 'totalEarnedWages' | 'totalAdvancesOutstanding' | 'totalPaymentsMade' | 'currentPayableBalance'>
  ): Promise<Employee> {
    const db = mockStorage.getDatabase()
    const newEmployee: Employee = {
      ...input,
      id: `emp-${Date.now()}`,
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
    mockStorage.saveDatabase(updatedDb)
    return newEmployee
  }
}

export const employeesRepository = new EmployeesRepository()
