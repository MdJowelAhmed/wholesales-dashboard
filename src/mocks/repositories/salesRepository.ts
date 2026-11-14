import { Customer, CustomerLedgerEntry, Sale, SaleItem } from '@/types/sales'
import {
  calculateLineTotal,
  calculateOutstandingBalance,
  roundCurrency,
} from '@/lib/calculations/financialCalculations'
import { generateId } from '@/lib/ids'
import { mockStorage } from '../storage/localStorageAdapter'
import { STORAGE_SCOPES } from '../storage/storageScopes'

const SALES_WRITE_SCOPES = [
  STORAGE_SCOPES.SALES,
  STORAGE_SCOPES.FINANCE,
  STORAGE_SCOPES.INVENTORY,
  STORAGE_SCOPES.CUSTOMERS,
  STORAGE_SCOPES.SHOPKEEPERS,
] as const
import { ledgerEngine } from './ledgerEngine'
import { stockEngine } from './stockEngine'

export class SalesRepository {
  public async listSales(): Promise<Sale[]> {
    const db = mockStorage.getDatabase()
    return db.sales
  }

  public async getSaleById(id: string): Promise<Sale | null> {
    const db = mockStorage.getDatabase()
    return db.sales.find((s) => s.id === id) || null
  }

  public async listCustomers(): Promise<Customer[]> {
    const db = mockStorage.getDatabase()
    return db.customers
  }

  public async getCustomerById(id: string): Promise<Customer | null> {
    const db = mockStorage.getDatabase()
    return db.customers.find((c) => c.id === id) || null
  }

  public async getCustomerLedger(customerId: string): Promise<CustomerLedgerEntry[]> {
    const db = mockStorage.getDatabase()
    const entries = ledgerEngine.getPartyLedger(db, 'customer', customerId)
    if (entries.length > 0) {
      return entries.map((e) => ({
        id: e.id,
        date: e.date,
        type: e.type === 'payment' ? 'payment' : 'sale',
        reference: e.refId,
        description: e.note || `${e.type.toUpperCase()}: ${e.refId}`,
        debit: e.debit,
        credit: e.credit,
        balance: e.balanceAfter ?? e.balance ?? 0,
      }))
    }
    return db.customerLedger[customerId] || []
  }

  public async createSale(input: {
    date: string
    customerType: 'retail_customer' | 'wholesale_shopkeeper'
    customerId?: string
    customerName: string
    customerPhone?: string
    saleType: 'own_shop' | 'wholesale_credit'
    items: Array<{
      productId: string
      productName: string
      variantId: string
      sku: string
      size: string
      quantityPieces: number
      pricePerPiece: number
      discount?: number
    }>
    orderDiscount?: number
    paidAmount?: number
    paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'bkash' | 'nagad'
    notes?: string
  }): Promise<Sale> {
    let db = mockStorage.getDatabase()

    let subtotal = 0
    const invoiceNumber = `INV-${new Date().getFullYear()}-${generateId().slice(0, 4).toUpperCase()}`

    const saleItems: SaleItem[] = input.items.map((item) => {
      const lineTotal = calculateLineTotal(
        item.quantityPieces,
        item.pricePerPiece,
        item.discount || 0
      )
      subtotal += lineTotal

      return {
        id: generateId('sitem'),
        productId: item.productId,
        productName: item.productName,
        variantId: item.variantId,
        sku: item.sku,
        size: item.size,
        quantityPieces: item.quantityPieces,
        pricePerPiece: item.pricePerPiece,
        discount: item.discount || 0,
        lineTotal,
      }
    })

    // Deduct stock immutably via stockEngine
    for (const item of input.items) {
      const res = stockEngine.recordMovement(db, {
        itemType: 'finished_goods',
        itemId: item.variantId,
        movementType: 'sale',
        quantityPieces: item.quantityPieces,
        unitPrice: item.pricePerPiece,
        referenceId: invoiceNumber,
        referenceType: 'sales_invoice',
        date: input.date,
        notes: `Sale invoice to ${input.customerName}`,
      })
      db = res.db
    }

    const totalDiscount = input.orderDiscount || 0
    const totalAmount = Math.max(0, subtotal - totalDiscount)
    const paidAmount = input.paidAmount || 0
    const balance = calculateOutstandingBalance(totalAmount, paidAmount)

    const sale: Sale = {
      id: generateId('sale'),
      invoiceNumber,
      date: input.date,
      customerType: input.customerType,
      customerId: input.customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      saleType: input.saleType,
      items: saleItems,
      subtotal: roundCurrency(subtotal),
      discount: roundCurrency(totalDiscount),
      totalAmount: roundCurrency(totalAmount),
      paidAmount: roundCurrency(paidAmount),
      outstandingBalance: roundCurrency(balance),
      paymentMethod: input.paymentMethod,
      status: balance === 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'pending',
      notes: input.notes,
      createdAt: new Date().toISOString(),
    }

    db.sales = [sale, ...db.sales]

    // Update ledger via ledgerEngine if customer or shopkeeper is linked
    if (input.customerId) {
      const partyType =
        input.customerType === 'wholesale_shopkeeper' ? 'shopkeeper' : 'customer'

      // Record invoice sale debit
      const res1 = ledgerEngine.appendLedgerEntry(db, {
        partyType,
        partyId: input.customerId,
        date: input.date,
        type: 'sale',
        refType: 'sales_invoice',
        refId: invoiceNumber,
        debit: totalAmount,
        credit: 0,
        note: `Sales Invoice (${saleItems.length} items)`,
      })
      db = res1.db

      // Record payment credit if partially or fully paid
      if (paidAmount > 0) {
        const res2 = ledgerEngine.appendLedgerEntry(db, {
          partyType,
          partyId: input.customerId,
          date: input.date,
          type: 'payment',
          refType: 'receipt',
          refId: invoiceNumber,
          debit: 0,
          credit: paidAmount,
          note: `Payment at invoice (${input.paymentMethod})`,
        })
        db = res2.db
      }
    }

    mockStorage.saveDatabase(db, [...SALES_WRITE_SCOPES])
    return sale
  }

  public async createCustomer(input: {
    name: string
    phone: string
    address?: string
  }): Promise<Customer> {
    const db = mockStorage.getDatabase()
    const newCustomer: Customer = {
      id: generateId('cust'),
      name: input.name,
      phone: input.phone,
      address: input.address || 'Dhaka, Bangladesh',
      totalPurchases: 0,
      totalPayments: 0,
      outstandingBalance: 0,
      lastPurchaseDate: new Date().toISOString().split('T')[0],
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    const updatedDb = {
      ...db,
      customers: [newCustomer, ...db.customers],
    }
    mockStorage.saveDatabase(updatedDb, [...SALES_WRITE_SCOPES])
    return newCustomer
  }

  public async recordCustomerPayment(input: {
    customerId: string
    amount: number
    paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'bkash' | 'nagad'
    reference?: string
    notes?: string
    date?: string
  }): Promise<void> {
    const db = mockStorage.getDatabase()
    const customer = db.customers.find((c) => c.id === input.customerId)
    if (!customer) throw new Error('Customer not found')

    const date = input.date || new Date().toISOString().split('T')[0]
    const receiptRef = input.reference || `PAY-${generateId().slice(0, 4).toUpperCase()}`

    customer.totalPayments = roundCurrency(customer.totalPayments + input.amount)

    const { db: updatedDb } = ledgerEngine.appendLedgerEntry(db, {
      partyType: 'customer',
      partyId: customer.id,
      date,
      type: 'payment',
      refType: 'receipt',
      refId: receiptRef,
      debit: 0,
      credit: input.amount,
      note: input.notes || `Payment received (${input.paymentMethod})`,
    })

    mockStorage.saveDatabase(updatedDb, [...SALES_WRITE_SCOPES])
  }
}

export const salesRepository = new SalesRepository()
