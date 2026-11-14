import { ShopkeeperPayment } from '@/types/shopkeepers'
import { PaymentRecord } from '@/types/finance'
import { SeedDatabase } from '../seed'
import { roundCurrency } from '@/lib/calculations/financialCalculations'

export interface RecordPaymentPayload {
  date: string
  partyType: 'shopkeeper' | 'customer' | 'supplier' | 'employee'
  partyId: string
  partyName: string
  amount: number
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'bkash' | 'nagad'
  reference?: string
  notes?: string
}

export function buildPaymentLedgerNote(
  partyType: RecordPaymentPayload['partyType'],
  paymentMethod: RecordPaymentPayload['paymentMethod'],
  reference?: string,
  notes?: string
): string {
  const detail = reference || notes || 'N/A'
  const isDisbursement = partyType === 'supplier' || partyType === 'employee'
  if (isDisbursement) {
    return `Payment disbursed (${paymentMethod}): ${detail}`
  }
  return `Payment received (${paymentMethod}): ${detail}`
}

export function applyPartyPaymentSideEffects(
  db: SeedDatabase,
  input: RecordPaymentPayload,
  payment: PaymentRecord
): SeedDatabase {
  let nextDb = db
  const amount = roundCurrency(input.amount)

  if (input.partyType === 'shopkeeper') {
    const skPayment: ShopkeeperPayment = {
      id: payment.id,
      receiptNumber: payment.receiptNumber,
      date: payment.date,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      reference: input.reference,
      notes: input.notes,
      createdAt: payment.createdAt,
    }
    const prior = nextDb.shopkeeperPayments[input.partyId] || []
    nextDb = {
      ...nextDb,
      shopkeepers: nextDb.shopkeepers.map((sk) =>
        sk.id === input.partyId
          ? {
              ...sk,
              totalPaymentsReceived: roundCurrency(sk.totalPaymentsReceived + amount),
              lastTransactionDate: input.date,
            }
          : sk
      ),
      shopkeeperPayments: {
        ...nextDb.shopkeeperPayments,
        [input.partyId]: [skPayment, ...prior],
      },
    }
  } else if (input.partyType === 'customer') {
    nextDb = {
      ...nextDb,
      customers: nextDb.customers.map((c) =>
        c.id === input.partyId ? { ...c, totalPayments: roundCurrency(c.totalPayments + amount) } : c
      ),
    }
  } else if (input.partyType === 'supplier') {
    nextDb = {
      ...nextDb,
      suppliers: nextDb.suppliers.map((s) =>
        s.id === input.partyId ? { ...s, totalPayments: roundCurrency(s.totalPayments + amount) } : s
      ),
    }
  } else if (input.partyType === 'employee') {
    nextDb = {
      ...nextDb,
      employees: nextDb.employees.map((e) =>
        e.id === input.partyId
          ? { ...e, totalPaymentsMade: roundCurrency(e.totalPaymentsMade + amount) }
          : e
      ),
    }
  }

  return nextDb
}