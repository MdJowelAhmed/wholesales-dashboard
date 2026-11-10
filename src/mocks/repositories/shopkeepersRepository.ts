import {
  Shopkeeper,
  ShopkeeperDelivery,
  ShopkeeperLedgerEntry,
  ShopkeeperPayment,
  ShopkeeperReturnRecord,
  ShopkeeperTransactionType,
} from '@/types/shopkeepers'
import {
  calculateLineTotal,
  calculateReturnCredit,
  roundCurrency,
} from '@/lib/calculations/financialCalculations'
import { mockStorage } from '../storage/localStorageAdapter'

export interface RecordDeliveryInput {
  shopkeeperId: string
  date: string
  transactionType: ShopkeeperTransactionType
  items: Array<{
    productId: string
    productName: string
    variantId: string
    sku: string
    size: string
    quantityPieces: number
    pricePerPiece: number
  }>
  paidAmount?: number
  notes?: string
}

export interface RecordShopkeeperPaymentInput {
  shopkeeperId: string
  date: string
  amount: number
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'bkash' | 'nagad'
  reference?: string
  notes?: string
}

export interface RecordShopkeeperReturnInput {
  shopkeeperId: string
  deliveryId: string
  variantId: string
  returnQuantityPieces: number
  condition: 'sellable' | 'damaged'
  reason: string
}

export class ShopkeepersRepository {
  public async listShopkeepers(search?: string): Promise<Shopkeeper[]> {
    const db = mockStorage.getDatabase()
    let list = [...db.shopkeepers]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.shopName.toLowerCase().includes(q) ||
          s.ownerName.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q) ||
          s.marketName.toLowerCase().includes(q)
      )
    }
    return list
  }

  public async getShopkeeperById(id: string): Promise<Shopkeeper | null> {
    const db = mockStorage.getDatabase()
    return db.shopkeepers.find((s) => s.id === id) || null
  }

  public async getDeliveries(shopkeeperId: string): Promise<ShopkeeperDelivery[]> {
    const db = mockStorage.getDatabase()
    return db.shopkeeperDeliveries[shopkeeperId] || []
  }

  public async getPayments(shopkeeperId: string): Promise<ShopkeeperPayment[]> {
    const db = mockStorage.getDatabase()
    return db.shopkeeperPayments[shopkeeperId] || []
  }

  public async getReturns(shopkeeperId: string): Promise<ShopkeeperReturnRecord[]> {
    const db = mockStorage.getDatabase()
    return db.shopkeeperReturns[shopkeeperId] || []
  }

  public async getLedger(shopkeeperId: string): Promise<ShopkeeperLedgerEntry[]> {
    const db = mockStorage.getDatabase()
    return db.shopkeeperLedger[shopkeeperId] || []
  }

  public async createShopkeeper(
    data: Omit<
      Shopkeeper,
      | 'id'
      | 'createdAt'
      | 'totalDeliveredValue'
      | 'totalPaymentsReceived'
      | 'totalReturnAdjustments'
      | 'outstandingBalance'
      | 'consignmentPiecesHeld'
      | 'lastTransactionDate'
    >
  ): Promise<Shopkeeper> {
    const db = mockStorage.getDatabase()
    const newShopkeeper: Shopkeeper = {
      ...data,
      id: `sk-${Date.now()}`,
      totalDeliveredValue: 0,
      totalPaymentsReceived: 0,
      totalReturnAdjustments: 0,
      outstandingBalance: 0,
      consignmentPiecesHeld: 0,
      lastTransactionDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    }
    db.shopkeepers.unshift(newShopkeeper)
    db.shopkeeperDeliveries[newShopkeeper.id] = []
    db.shopkeeperPayments[newShopkeeper.id] = []
    db.shopkeeperReturns[newShopkeeper.id] = []
    db.shopkeeperLedger[newShopkeeper.id] = []
    mockStorage.saveDatabase(db)
    return newShopkeeper
  }

  public async recordDelivery(input: RecordDeliveryInput): Promise<ShopkeeperDelivery> {
    const db = mockStorage.getDatabase()
    const shopkeeper = db.shopkeepers.find((s) => s.id === input.shopkeeperId)
    if (!shopkeeper) throw new Error(`Shopkeeper not found: ${input.shopkeeperId}`)

    let totalPieces = 0
    let totalAmount = 0

    const deliveryItems = input.items.map((item) => {
      const lineTotal = calculateLineTotal(item.quantityPieces, item.pricePerPiece)
      totalPieces += item.quantityPieces
      totalAmount += lineTotal

      // Deduct from finished goods inventory stock
      const stockItem = db.finishedGoodsStock.find((st) => st.variantId === item.variantId)
      if (stockItem) {
        stockItem.currentPieces = Math.max(0, stockItem.currentPieces - item.quantityPieces)
        stockItem.valuation = roundCurrency(stockItem.currentPieces * stockItem.pricePerPiece)
      }

      return {
        id: `ditem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: item.productId,
        productName: item.productName,
        variantId: item.variantId,
        sku: item.sku,
        size: item.size,
        quantityPieces: item.quantityPieces,
        pricePerPiece: item.pricePerPiece,
        lineTotal,
        returnedPieces: 0,
        sellableReturnedPieces: 0,
        damagedReturnedPieces: 0,
      }
    })

    const initialPaid = input.paidAmount || 0
    const deliveryId = `deliv-${Date.now()}`
    const deliveryNumber = `DLV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`

    const delivery: ShopkeeperDelivery = {
      id: deliveryId,
      deliveryNumber,
      date: input.date,
      transactionType: input.transactionType,
      items: deliveryItems,
      totalPieces,
      totalAmount: roundCurrency(totalAmount),
      paidAmount: initialPaid,
      outstandingAmount: roundCurrency(totalAmount - initialPaid),
      notes: input.notes,
      createdAt: new Date().toISOString(),
    }

    if (!db.shopkeeperDeliveries[shopkeeper.id]) {
      db.shopkeeperDeliveries[shopkeeper.id] = []
    }
    db.shopkeeperDeliveries[shopkeeper.id].unshift(delivery)

    // Update shopkeeper balances
    shopkeeper.totalDeliveredValue = roundCurrency(shopkeeper.totalDeliveredValue + totalAmount)
    shopkeeper.lastTransactionDate = input.date

    if (input.transactionType === 'consignment') {
      shopkeeper.consignmentPiecesHeld += totalPieces
    } else {
      shopkeeper.outstandingBalance = roundCurrency(shopkeeper.outstandingBalance + totalAmount)
    }

    // Ledger entry for delivery
    const ledger = db.shopkeeperLedger[shopkeeper.id] || []
    const previousBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0
    const newBalance = roundCurrency(
      input.transactionType === 'credit_sale' ? previousBalance + totalAmount : previousBalance
    )

    const ledgerEntry: ShopkeeperLedgerEntry = {
      id: `skledg-${Date.now()}`,
      date: input.date,
      type: input.transactionType === 'consignment' ? 'consignment_issue' : 'delivery_credit',
      reference: deliveryNumber,
      description: `${
        input.transactionType === 'consignment' ? 'Consignment Delivery' : 'Credit Delivery'
      }: ${totalPieces} pcs garments`,
      debit: input.transactionType === 'credit_sale' ? totalAmount : 0,
      credit: 0,
      balance: newBalance,
    }
    ledger.push(ledgerEntry)
    db.shopkeeperLedger[shopkeeper.id] = ledger

    // If an initial payment was made at delivery
    if (initialPaid > 0) {
      await this.recordPayment({
        shopkeeperId: shopkeeper.id,
        date: input.date,
        amount: initialPaid,
        paymentMethod: 'cash',
        notes: `Initial payment on ${deliveryNumber}`,
      })
    } else {
      mockStorage.saveDatabase(db)
    }

    return delivery
  }

  public async recordPayment(input: RecordShopkeeperPaymentInput): Promise<ShopkeeperPayment> {
    const db = mockStorage.getDatabase()
    const shopkeeper = db.shopkeepers.find((s) => s.id === input.shopkeeperId)
    if (!shopkeeper) throw new Error(`Shopkeeper not found: ${input.shopkeeperId}`)

    const receiptNumber = `RCP-SK-${Date.now().toString().slice(-4)}`
    const payment: ShopkeeperPayment = {
      id: `skpay-${Date.now()}`,
      receiptNumber,
      date: input.date,
      amount: roundCurrency(input.amount),
      paymentMethod: input.paymentMethod,
      reference: input.reference,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    }

    if (!db.shopkeeperPayments[shopkeeper.id]) {
      db.shopkeeperPayments[shopkeeper.id] = []
    }
    db.shopkeeperPayments[shopkeeper.id].unshift(payment)

    shopkeeper.totalPaymentsReceived = roundCurrency(shopkeeper.totalPaymentsReceived + input.amount)
    shopkeeper.outstandingBalance = roundCurrency(
      Math.max(0, shopkeeper.outstandingBalance - input.amount)
    )
    shopkeeper.lastTransactionDate = input.date

    // Ledger update
    const ledger = db.shopkeeperLedger[shopkeeper.id] || []
    const previousBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0
    const newBalance = roundCurrency(Math.max(0, previousBalance - input.amount))

    ledger.push({
      id: `skledg-${Date.now()}`,
      date: input.date,
      type: 'payment_received',
      reference: receiptNumber,
      description: `Payment received (${input.paymentMethod}): ${input.reference || 'N/A'}`,
      debit: 0,
      credit: input.amount,
      balance: newBalance,
    })
    db.shopkeeperLedger[shopkeeper.id] = ledger

    mockStorage.saveDatabase(db)
    return payment
  }

  public async recordReturn(input: RecordShopkeeperReturnInput): Promise<ShopkeeperReturnRecord> {
    const db = mockStorage.getDatabase()
    const shopkeeper = db.shopkeepers.find((s) => s.id === input.shopkeeperId)
    if (!shopkeeper) throw new Error(`Shopkeeper not found: ${input.shopkeeperId}`)

    const deliveries = db.shopkeeperDeliveries[shopkeeper.id] || []
    const delivery = deliveries.find((d) => d.id === input.deliveryId)
    if (!delivery) throw new Error(`Delivery not found: ${input.deliveryId}`)

    const item = delivery.items.find((i) => i.variantId === input.variantId)
    if (!item) throw new Error(`Product variant not found in delivery: ${input.variantId}`)

    // Validate that return quantity does not exceed eligible quantity!
    const remainingEligible = item.quantityPieces - item.returnedPieces
    if (input.returnQuantityPieces <= 0) {
      throw new Error('Return quantity must be greater than zero')
    }
    if (input.returnQuantityPieces > remainingEligible) {
      throw new Error(
        `Cannot return ${input.returnQuantityPieces} pcs. Only ${remainingEligible} pcs eligible for return.`
      )
    }

    const creditAmount = calculateReturnCredit(input.returnQuantityPieces, item.pricePerPiece)

    // Update delivery item
    item.returnedPieces += input.returnQuantityPieces
    if (input.condition === 'sellable') {
      item.sellableReturnedPieces += input.returnQuantityPieces

      // Return to sellable finished goods inventory!
      const stockItem = db.finishedGoodsStock.find((st) => st.variantId === input.variantId)
      if (stockItem) {
        stockItem.currentPieces += input.returnQuantityPieces
        stockItem.valuation = roundCurrency(stockItem.currentPieces * stockItem.pricePerPiece)
      }
    } else {
      item.damagedReturnedPieces += input.returnQuantityPieces
    }

    // Update delivery outstanding
    delivery.outstandingAmount = roundCurrency(
      Math.max(0, delivery.outstandingAmount - creditAmount)
    )

    // Create return record
    const returnNumber = `RET-${Date.now().toString().slice(-4)}`
    const returnRecord: ShopkeeperReturnRecord = {
      id: `skret-${Date.now()}`,
      returnNumber,
      date: new Date().toISOString().split('T')[0],
      deliveryId: delivery.id,
      deliveryNumber: delivery.deliveryNumber,
      variantId: input.variantId,
      productName: item.productName,
      size: item.size,
      returnQuantityPieces: input.returnQuantityPieces,
      pricePerPiece: item.pricePerPiece,
      creditAmount,
      condition: input.condition,
      reason: input.reason,
      createdAt: new Date().toISOString(),
    }

    if (!db.shopkeeperReturns[shopkeeper.id]) {
      db.shopkeeperReturns[shopkeeper.id] = []
    }
    db.shopkeeperReturns[shopkeeper.id].unshift(returnRecord)

    // Update shopkeeper balances
    shopkeeper.totalReturnAdjustments = roundCurrency(shopkeeper.totalReturnAdjustments + creditAmount)
    shopkeeper.outstandingBalance = roundCurrency(
      Math.max(0, shopkeeper.outstandingBalance - creditAmount)
    )
    if (delivery.transactionType === 'consignment') {
      shopkeeper.consignmentPiecesHeld = Math.max(
        0,
        shopkeeper.consignmentPiecesHeld - input.returnQuantityPieces
      )
    }

    // Ledger update
    const ledger = db.shopkeeperLedger[shopkeeper.id] || []
    const previousBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0
    const newBalance = roundCurrency(Math.max(0, previousBalance - creditAmount))

    ledger.push({
      id: `skledg-${Date.now()}`,
      date: returnRecord.date,
      type: 'return_credit',
      reference: returnNumber,
      description: `Return credit (${input.condition}): ${input.returnQuantityPieces} pcs @ ৳${item.pricePerPiece}/pc`,
      debit: 0,
      credit: creditAmount,
      balance: newBalance,
    })
    db.shopkeeperLedger[shopkeeper.id] = ledger

    mockStorage.saveDatabase(db)
    return returnRecord
  }

  public async listAllDeliveries(): Promise<
    Array<ShopkeeperDelivery & { shopkeeperId: string; shopkeeperName: string; marketName: string }>
  > {
    const db = mockStorage.getDatabase()
    const all: Array<
      ShopkeeperDelivery & { shopkeeperId: string; shopkeeperName: string; marketName: string }
    > = []

    for (const sk of db.shopkeepers) {
      const deliveries = db.shopkeeperDeliveries[sk.id] || []
      for (const d of deliveries) {
        all.push({
          ...d,
          shopkeeperId: sk.id,
          shopkeeperName: sk.shopName,
          marketName: sk.marketName,
        })
      }
    }

    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return all
  }

  public async getDeliveryById(
    deliveryId: string
  ): Promise<(ShopkeeperDelivery & { shopkeeperId: string; shopkeeperName: string; marketName: string; phone: string; address: string }) | null> {
    const db = mockStorage.getDatabase()
    for (const sk of db.shopkeepers) {
      const deliveries = db.shopkeeperDeliveries[sk.id] || []
      const found = deliveries.find((d) => d.id === deliveryId)
      if (found) {
        return {
          ...found,
          shopkeeperId: sk.id,
          shopkeeperName: sk.shopName,
          marketName: sk.marketName,
          phone: sk.phone,
          address: sk.address,
        }
      }
    }
    return null
  }

  public async listAllReturns(): Promise<
    Array<ShopkeeperReturnRecord & { shopkeeperId: string; shopkeeperName: string; marketName: string }>
  > {
    const db = mockStorage.getDatabase()
    const all: Array<
      ShopkeeperReturnRecord & { shopkeeperId: string; shopkeeperName: string; marketName: string }
    > = []

    for (const sk of db.shopkeepers) {
      const returns = db.shopkeeperReturns[sk.id] || []
      for (const r of returns) {
        all.push({
          ...r,
          shopkeeperId: sk.id,
          shopkeeperName: sk.shopName,
          marketName: sk.marketName,
        })
      }
    }

    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return all
  }
}

export const shopkeepersRepository = new ShopkeepersRepository()
