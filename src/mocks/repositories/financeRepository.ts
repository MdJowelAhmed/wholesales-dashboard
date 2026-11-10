import { ExpenseRecord, PaymentRecord, PayrollRecord } from '@/types/finance'
import { roundCurrency } from '@/lib/calculations/financialCalculations'
import { mockStorage } from '../storage/localStorageAdapter'

export interface DashboardMetrics {
  todaySales: number
  monthlySales: number
  totalFinishedGoodsPieces: number
  finishedGoodsStockValue: number
  rawMaterialStockValue: number
  outstandingShopkeeperBalances: number
  customerReceivables: number
  supplierPayables: number
  employeeWageLiabilities: number
}

export class FinanceRepository {
  public async getDashboardMetrics(): Promise<DashboardMetrics> {
    const db = mockStorage.getDatabase()

    // Monthly sales calculation (September/October 2026 dummy transactions)
    const monthlySales = roundCurrency(
      db.sales.reduce((sum, s) => sum + s.totalAmount, 0) +
        Object.values(db.shopkeeperDeliveries)
          .flat()
          .reduce((sum, d) => sum + d.totalAmount, 0)
    )

    // Today sales estimate (most recent sales)
    const todaySales = roundCurrency(
      db.sales.slice(0, 1).reduce((sum, s) => sum + s.totalAmount, 0)
    )

    // Finished goods stock & valuation
    const totalFinishedGoodsPieces = db.finishedGoodsStock.reduce(
      (sum, s) => sum + s.currentPieces,
      0
    )
    const finishedGoodsStockValue = roundCurrency(
      db.finishedGoodsStock.reduce((sum, s) => sum + s.valuation, 0)
    )

    // Raw material value
    const rawMaterialStockValue = roundCurrency(
      db.materials.reduce((sum, m) => sum + m.availableQuantity * m.averageCost, 0)
    )

    // Outstanding shopkeeper balances
    const outstandingShopkeeperBalances = roundCurrency(
      db.shopkeepers.reduce((sum, sk) => sum + sk.outstandingBalance, 0)
    )

    // Customer receivables
    const customerReceivables = roundCurrency(
      db.customers.reduce((sum, c) => sum + c.outstandingBalance, 0)
    )

    // Supplier payables
    const supplierPayables = roundCurrency(
      db.suppliers.reduce((sum, sup) => sum + sup.outstandingPayable, 0)
    )

    // Employee wage liabilities
    const employeeWageLiabilities = roundCurrency(
      db.employees.reduce((sum, emp) => sum + emp.currentPayableBalance, 0)
    )

    return {
      todaySales,
      monthlySales,
      totalFinishedGoodsPieces,
      finishedGoodsStockValue,
      rawMaterialStockValue,
      outstandingShopkeeperBalances,
      customerReceivables,
      supplierPayables,
      employeeWageLiabilities,
    }
  }

  public async listExpenses(): Promise<ExpenseRecord[]> {
    const db = mockStorage.getDatabase()
    return db.expenses
  }

  public async createExpense(
    input: Omit<ExpenseRecord, 'id' | 'expenseNumber' | 'createdAt'>
  ): Promise<ExpenseRecord> {
    const db = mockStorage.getDatabase()
    const expenseNumber = `EXP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
    const expense: ExpenseRecord = {
      ...input,
      id: `exp-${Date.now()}`,
      expenseNumber,
      amount: roundCurrency(input.amount),
      createdAt: new Date().toISOString(),
    }
    db.expenses.unshift(expense)
    mockStorage.saveDatabase(db)
    return expense
  }

  public async listPayments(): Promise<PaymentRecord[]> {
    const db = mockStorage.getDatabase()
    return db.payments
  }

  public async recordPayment(input: {
    date: string
    partyType: 'shopkeeper' | 'customer' | 'supplier' | 'employee'
    partyId: string
    partyName: string
    amount: number
    paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'bkash' | 'nagad'
    reference?: string
    notes?: string
  }): Promise<PaymentRecord> {
    const db = mockStorage.getDatabase()
    const receiptNumber = `RCP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
    const payment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      receiptNumber,
      date: input.date,
      partyType: input.partyType,
      partyId: input.partyId,
      partyName: input.partyName,
      amount: roundCurrency(input.amount),
      paymentMethod: input.paymentMethod,
      referenceTransactionCode: input.reference,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    }
    db.payments.unshift(payment)

    // Synchronize balance with party
    if (input.partyType === 'shopkeeper') {
      const sk = db.shopkeepers.find((s) => s.id === input.partyId)
      if (sk) {
        sk.totalPaymentsReceived = roundCurrency(sk.totalPaymentsReceived + input.amount)
        sk.outstandingBalance = roundCurrency(Math.max(0, sk.outstandingBalance - input.amount))
        sk.lastTransactionDate = input.date

        const ledger = db.shopkeeperLedger[sk.id] || []
        const prevBal = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0
        ledger.push({
          id: `skledg-${Date.now()}`,
          date: input.date,
          type: 'payment_received',
          reference: receiptNumber,
          description: `Payment received (${input.paymentMethod}): ${input.reference || 'N/A'}`,
          debit: 0,
          credit: input.amount,
          balance: roundCurrency(Math.max(0, prevBal - input.amount)),
        })
        db.shopkeeperLedger[sk.id] = ledger
      }
    } else if (input.partyType === 'customer') {
      const c = db.customers.find((cust) => cust.id === input.partyId)
      if (c) {
        c.totalPayments = roundCurrency(c.totalPayments + input.amount)
        c.outstandingBalance = roundCurrency(Math.max(0, c.outstandingBalance - input.amount))

        const ledger = db.customerLedger[c.id] || []
        const prevBal = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0
        ledger.push({
          id: `cstledg-${Date.now()}`,
          date: input.date,
          type: 'payment',
          reference: receiptNumber,
          description: `Customer payment (${input.paymentMethod}): ${input.notes || ''}`,
          debit: 0,
          credit: input.amount,
          balance: roundCurrency(Math.max(0, prevBal - input.amount)),
        })
        db.customerLedger[c.id] = ledger
      }
    } else if (input.partyType === 'supplier') {
      const sup = db.suppliers.find((s) => s.id === input.partyId)
      if (sup) {
        sup.totalPayments = roundCurrency(sup.totalPayments + input.amount)
        sup.outstandingPayable = roundCurrency(Math.max(0, sup.outstandingPayable - input.amount))

        const ledger = db.supplierLedger[sup.id] || []
        const prevBal = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0
        ledger.push({
          id: `sledg-${Date.now()}`,
          date: input.date,
          type: 'payment',
          description: `Supplier payment (${input.paymentMethod}): ${input.reference || ''}`,
          debit: input.amount,
          credit: 0,
          balance: roundCurrency(Math.max(0, prevBal - input.amount)),
        })
        db.supplierLedger[sup.id] = ledger
      }
    } else if (input.partyType === 'employee') {
      const emp = db.employees.find((e) => e.id === input.partyId)
      if (emp) {
        emp.totalPaymentsMade = roundCurrency(emp.totalPaymentsMade + input.amount)
        emp.currentPayableBalance = roundCurrency(
          Math.max(0, emp.currentPayableBalance - input.amount)
        )

        const ledger = db.employeeLedger[emp.id] || []
        const prevBal = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0
        ledger.push({
          id: `eledg-${Date.now()}`,
          date: input.date,
          type: 'payment_issued',
          description: `Wage/salary disbursement (${input.paymentMethod})`,
          debit: input.amount,
          credit: 0,
          balance: roundCurrency(Math.max(0, prevBal - input.amount)),
        })
        db.employeeLedger[emp.id] = ledger
      }
    }

    mockStorage.saveDatabase(db)
    return payment
  }

  public async listPayroll(): Promise<PayrollRecord[]> {
    const db = mockStorage.getDatabase()
    return db.payroll
  }

  public async generatePayroll(period: string): Promise<PayrollRecord[]> {
    const db = mockStorage.getDatabase()
    const created: PayrollRecord[] = []

    for (const emp of db.employees) {
      // Check if payroll already exists for this period and employee
      const existing = db.payroll.find(
        (p) => p.period === period && p.employeeId === emp.id
      )
      if (existing) continue

      const isMonthly = emp.compensationMethod === 'monthly_fixed' || emp.compensationMethod === 'monthly_plus_incentive'
      const monthlySalary = isMonthly ? emp.monthlySalary || 15000 : 0
      const pieceRateEarnings = !isMonthly
        ? roundCurrency(emp.totalEarnedWages > 0 ? emp.totalEarnedWages : 16500)
        : 0
      const incentives = isMonthly ? 1000 : 500
      const advancesDeducted = Math.min(2000, emp.totalAdvancesOutstanding)
      const adjustments = 0
      const netPayable = roundCurrency(monthlySalary + pieceRateEarnings + incentives - advancesDeducted)

      const pyr: PayrollRecord = {
        id: `pyr-${Date.now()}-${emp.id}`,
        period,
        employeeId: emp.id,
        employeeName: emp.name,
        designation: emp.designation,
        compensationMethod: emp.compensationMethod.replace('_', ' '),
        monthlySalary,
        pieceRateEarnings,
        incentives,
        advancesDeducted,
        adjustments,
        netPayable,
        paidAmount: 0,
        remainingPayable: netPayable,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }

      db.payroll.unshift(pyr)
      created.push(pyr)

      // Add wage credit to employee ledger
      const ledger = db.employeeLedger[emp.id] || []
      const prevBal = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0
      ledger.push({
        id: `eledg-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: isMonthly ? 'salary_credited' : 'wage_earned',
        description: `Payroll Generated: ${period}`,
        debit: 0,
        credit: netPayable,
        balance: roundCurrency(prevBal + netPayable),
      })
      db.employeeLedger[emp.id] = ledger
      emp.currentPayableBalance = roundCurrency(emp.currentPayableBalance + netPayable)
    }

    mockStorage.saveDatabase(db)
    return db.payroll
  }

  public async disbursePayroll(
    payrollId: string,
    paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'bkash' | 'nagad',
    disburseAmount?: number
  ): Promise<PayrollRecord> {
    const db = mockStorage.getDatabase()
    const item = db.payroll.find((p) => p.id === payrollId)
    if (!item) throw new Error(`Payroll record not found: ${payrollId}`)

    const amount = disburseAmount || item.remainingPayable
    const newPaid = roundCurrency(item.paidAmount + amount)
    const newRemaining = roundCurrency(Math.max(0, item.netPayable - newPaid))

    item.paidAmount = newPaid
    item.remainingPayable = newRemaining
    item.status = newRemaining === 0 ? 'paid' : 'partial'

    // Synchronize payment via unified payment recording
    await this.recordPayment({
      date: new Date().toISOString().split('T')[0],
      partyType: 'employee',
      partyId: item.employeeId,
      partyName: item.employeeName,
      amount,
      paymentMethod,
      reference: `PR-DISB-${item.period.replace(/\s+/g, '-')}`,
      notes: `Payroll disbursement for ${item.period}`,
    })

    return item
  }
}

export const financeRepository = new FinanceRepository()
