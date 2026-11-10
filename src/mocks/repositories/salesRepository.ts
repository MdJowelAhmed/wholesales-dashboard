import { Customer, CustomerLedgerEntry, Sale, SaleItem } from '@/types/sales'
import {
  calculateLineTotal,
  calculateOutstandingBalance,
  roundCurrency,
} from '@/lib/calculations/financialCalculations'
import { mockStorage } from '../storage/localStorageAdapter'

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
    const db = mockStorage.getDatabase()

    let subtotal = 0
    const saleItems: SaleItem[] = input.items.map((item) => {
      const lineTotal = calculateLineTotal(
        item.quantityPieces,
        item.pricePerPiece,
        item.discount || 0
      )
      subtotal += lineTotal

      // Deduct pieces from inventory
      const stockItem = db.finishedGoodsStock.find((st) => st.variantId === item.variantId)
      if (stockItem) {
        stockItem.currentPieces = Math.max(0, stockItem.currentPieces - item.quantityPieces)
        stockItem.valuation = roundCurrency(stockItem.currentPieces * stockItem.pricePerPiece)
      }

      return {
        id: `sitem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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

    const totalDiscount = input.orderDiscount || 0
    const totalAmount = Math.max(0, subtotal - totalDiscount)
    const paidAmount = input.paidAmount || 0
    const balance = calculateOutstandingBalance(totalAmount, paidAmount)

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
    const sale: Sale = {
      id: `sale-${Date.now()}`,
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

    db.sales.unshift(sale)

    // Update customer balances if linked to customer or shopkeeper
    if (input.customerId) {
      if (input.customerType === 'wholesale_shopkeeper') {
        const sk = db.shopkeepers.find((s) => s.id === input.customerId)
        if (sk) {
          sk.totalDeliveredValue = roundCurrency(sk.totalDeliveredValue + totalAmount)
          sk.totalPaymentsReceived = roundCurrency(sk.totalPaymentsReceived + paidAmount)
          sk.outstandingBalance = roundCurrency(sk.outstandingBalance + balance)
          sk.lastTransactionDate = input.date

          const ledger = db.shopkeeperLedger[sk.id] || []
          const prevBal = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0
          ledger.push({
            id: `skledg-${Date.now()}`,
            date: input.date,
            type: 'delivery_credit',
            reference: invoiceNumber,
            description: `Sales Invoice (${saleItems.length} items)`,
            debit: totalAmount,
            credit: paidAmount,
            balance: roundCurrency(prevBal + balance),
          })
          db.shopkeeperLedger[sk.id] = ledger
        }
      } else {
        const customer = db.customers.find((c) => c.id === input.customerId)
        if (customer) {
          customer.totalPurchases = roundCurrency(customer.totalPurchases + totalAmount)
          customer.totalPayments = roundCurrency(customer.totalPayments + paidAmount)
          customer.outstandingBalance = roundCurrency(customer.outstandingBalance + balance)
          customer.lastPurchaseDate = input.date

          const ledger = db.customerLedger[customer.id] || []
          const prevBal = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0
          ledger.push({
            id: `cstledg-${Date.now()}`,
            date: input.date,
            type: 'sale',
            reference: invoiceNumber,
            description: `Sale Invoice (${saleItems.length} items)`,
            debit: totalAmount,
            credit: paidAmount,
            balance: roundCurrency(prevBal + balance),
          })
          db.customerLedger[customer.id] = ledger
        }
      }
    }

    mockStorage.saveDatabase(db)
    return sale
  }

  public async createCustomer(input: {
    name: string
    phone: string
    address?: string
  }): Promise<Customer> {
    const db = mockStorage.getDatabase()
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
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
      customers: [...db.customers, newCustomer],
    }
    mockStorage.saveDatabase(updatedDb)
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
    customer.totalPayments = roundCurrency(customer.totalPayments + input.amount)
    customer.outstandingBalance = roundCurrency(customer.outstandingBalance - input.amount)

    const ledger = db.customerLedger[customer.id] || []
    const lastEntry = ledger[ledger.length - 1]
    const prevBal = lastEntry ? lastEntry.balance : 0
    ledger.push({
      id: `cstledg-${Date.now()}`,
      date,
      type: 'payment',
      reference: input.reference || `PAY-${Date.now().toString().slice(-4)}`,
      description: input.notes || `Payment received (${input.paymentMethod})`,
      debit: 0,
      credit: input.amount,
      balance: roundCurrency(prevBal - input.amount),
    })
    db.customerLedger[customer.id] = ledger

    mockStorage.saveDatabase(db)
  }
}

export const salesRepository = new SalesRepository()
