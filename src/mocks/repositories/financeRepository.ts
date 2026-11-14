import { ExpenseRecord, PaymentRecord, PayrollRecord } from '@/types/finance'
import { LedgerEntry } from '@/types/ledger'
import { roundCurrency } from '@/lib/calculations/financialCalculations'
import { generateId } from '@/lib/ids'
import { mockStorage } from '../storage/localStorageAdapter'
import { STORAGE_SCOPES } from '../storage/storageScopes'

const FINANCE_WRITE_SCOPES = [STORAGE_SCOPES.FINANCE] as const
import { ledgerEngine } from './ledgerEngine'

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

    const today = new Date().toISOString().split('T')[0]
    const currentMonth = today.slice(0, 7)

    // Direct retail/own-shop sales
    const directSalesToday = db.sales
      .filter((s) => s.date === today)
      .reduce((sum, s) => sum + s.totalAmount, 0)
    const directSalesMonth = db.sales
      .filter((s) => s.date.startsWith(currentMonth))
      .reduce((sum, s) => sum + s.totalAmount, 0)

    // Wholesale deliveries: credit sales only (consignment only counts when settled)
    const allDeliveries = Object.values(db.shopkeeperDeliveries || {}).flat()
    const creditDeliveriesToday = allDeliveries
      .filter((d) => d.transactionType === 'credit_sale' && d.date === today)
      .reduce((sum, d) => sum + d.totalAmount, 0)
    const creditDeliveriesMonth = allDeliveries
      .filter((d) => d.transactionType === 'credit_sale' && d.date.startsWith(currentMonth))
      .reduce((sum, d) => sum + d.totalAmount, 0)

    // Settled consignment sales from unified ledger
    const ledgerEntries: LedgerEntry[] = db.ledgerEntries || []
    const settledToday = ledgerEntries
      .filter(
        (l: LedgerEntry) =>
          l.partyType === 'shopkeeper' &&
          l.type === 'sale' &&
          l.refType === 'consignment_settlement' &&
          l.date === today
      )
      .reduce((sum: number, l: LedgerEntry) => sum + l.debit, 0)
    const settledMonth = ledgerEntries
      .filter(
        (l: LedgerEntry) =>
          l.partyType === 'shopkeeper' &&
          l.type === 'sale' &&
          l.refType === 'consignment_settlement' &&
          l.date.startsWith(currentMonth)
      )
      .reduce((sum: number, l: LedgerEntry) => sum + l.debit, 0)

    const todaySales = roundCurrency(directSalesToday + creditDeliveriesToday + settledToday)
    const monthlySales = roundCurrency(directSalesMonth + creditDeliveriesMonth + settledMonth)

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
    const expenseNumber = `EXP-${new Date().getFullYear()}-${generateId().slice(0, 4).toUpperCase()}`
    const expense: ExpenseRecord = {
      ...input,
      id: generateId('exp'),
      expenseNumber,
      amount: roundCurrency(input.amount),
      createdAt: new Date().toISOString(),
    }
    db.expenses = [expense, ...db.expenses]
    mockStorage.saveDatabase(db, [...FINANCE_WRITE_SCOPES])
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
    const receiptNumber = `RCP-${new Date().getFullYear()}-${generateId().slice(0, 4).toUpperCase()}`
    const payment: PaymentRecord = {
      id: generateId('pay'),
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
    db.payments = [payment, ...db.payments]

    // Synchronize balance and ledger using unified ledgerEngine
    const isPayableParty = input.partyType === 'supplier' || input.partyType === 'employee'
    const { db: updatedDb } = ledgerEngine.appendLedgerEntry(db, {
      partyType: input.partyType,
      partyId: input.partyId,
      date: input.date,
      type: 'payment',
      refType: 'receipt',
      refId: receiptNumber,
      debit: isPayableParty ? input.amount : 0,
      credit: !isPayableParty ? input.amount : 0,
      note: `Payment received (${input.paymentMethod}): ${input.reference || input.notes || 'N/A'}`,
    })

    // Synchronize historical stats on party
    if (input.partyType === 'shopkeeper') {
      const sk = updatedDb.shopkeepers.find((s) => s.id === input.partyId)
      if (sk) {
        sk.totalPaymentsReceived = roundCurrency(sk.totalPaymentsReceived + input.amount)
        sk.lastTransactionDate = input.date
      }
    } else if (input.partyType === 'customer') {
      const c = updatedDb.customers.find((cust) => cust.id === input.partyId)
      if (c) {
        c.totalPayments = roundCurrency(c.totalPayments + input.amount)
      }
    } else if (input.partyType === 'supplier') {
      const sup = updatedDb.suppliers.find((s) => s.id === input.partyId)
      if (sup) {
        sup.totalPayments = roundCurrency(sup.totalPayments + input.amount)
      }
    } else if (input.partyType === 'employee') {
      const emp = updatedDb.employees.find((e) => e.id === input.partyId)
      if (emp) {
        emp.totalPaymentsMade = roundCurrency(emp.totalPaymentsMade + input.amount)
      }
    }

    mockStorage.saveDatabase(updatedDb, [...FINANCE_WRITE_SCOPES])
    return payment
  }

  public async listPayroll(): Promise<PayrollRecord[]> {
    const db = mockStorage.getDatabase()
    return db.payroll
  }

  public async generatePayroll(period: string): Promise<PayrollRecord[]> {
    let db = mockStorage.getDatabase()
    const created: PayrollRecord[] = []

    for (const emp of db.employees) {
      // Check if payroll already exists for this period and employee
      const existing = db.payroll.find(
        (p) => p.period === period && p.employeeId === emp.id
      )
      if (existing) continue

      const isMonthly = emp.compensationMethod === 'monthly_fixed'
      const monthlySalary = isMonthly ? emp.monthlySalary || 15000 : 0
      const pieceRateEarnings = !isMonthly
        ? roundCurrency(emp.totalEarnedWages > 0 ? emp.totalEarnedWages : 16500)
        : 0
      const incentives = isMonthly ? 1000 : 500
      const advancesDeducted = Math.min(2000, emp.totalAdvancesOutstanding)
      const adjustments = 0
      const netPayable = roundCurrency(monthlySalary + pieceRateEarnings + incentives - advancesDeducted)

      const pyr: PayrollRecord = {
        id: generateId('pyr'),
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

      db.payroll = [pyr, ...db.payroll]
      created.push(pyr)

      // Add wage credit to employee ledger via ledgerEngine
      if (netPayable > 0) {
        const { db: updatedDb } = ledgerEngine.appendLedgerEntry(db, {
          partyType: 'employee',
          partyId: emp.id,
          date: new Date().toISOString().split('T')[0],
          type: isMonthly ? 'salary' : 'work',
          refType: 'payroll',
          refId: pyr.id,
          debit: 0,
          credit: netPayable,
          note: `Payroll Generated: ${period}`,
        })
        db = updatedDb
      }
    }

    mockStorage.saveDatabase(db, [...FINANCE_WRITE_SCOPES])
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
