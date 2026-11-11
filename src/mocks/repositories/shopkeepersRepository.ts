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
import { generateId } from '@/lib/ids'
import { mockStorage } from '../storage/localStorageAdapter'
import { ledgerEngine } from './ledgerEngine'
import { stockEngine } from './stockEngine'

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

export interface SettleConsignmentItemInput {
  variantId: string
  soldPieces: number
}

export interface SettleConsignmentInput {
  shopkeeperId: string
  deliveryId: string
  items: SettleConsignmentItemInput[]
  date?: string
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
    const entries = ledgerEngine.getPartyLedger(db, 'shopkeeper', shopkeeperId)
    if (entries.length > 0) {
      return entries.map((e) => {
        let type: ShopkeeperLedgerEntry['type'] = 'adjustment'
        if (e.type === 'sale') type = 'delivery_credit'
        else if (e.type === 'payment') type = 'payment_received'
        else if (e.type === 'return') type = 'return_credit'

        return {
          id: e.id,
          date: e.date,
          type,
          reference: e.refId,
          description: e.note || `${e.type.toUpperCase()}: ${e.refId}`,
          debit: e.debit,
          credit: e.credit,
          balance: e.balanceAfter ?? e.balance ?? 0,
        }
      })
    }
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
      id: generateId('sk'),
      totalDeliveredValue: 0,
      totalPaymentsReceived: 0,
      totalReturnAdjustments: 0,
      outstandingBalance: 0,
      consignmentPiecesHeld: 0,
      lastTransactionDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    }
    db.shopkeepers = [newShopkeeper, ...db.shopkeepers]
    db.shopkeeperDeliveries[newShopkeeper.id] = []
    db.shopkeeperPayments[newShopkeeper.id] = []
    db.shopkeeperReturns[newShopkeeper.id] = []
    db.shopkeeperLedger[newShopkeeper.id] = []
    mockStorage.saveDatabase(db)
    return newShopkeeper
  }

  public async recordDelivery(input: RecordDeliveryInput): Promise<ShopkeeperDelivery> {
    let db = mockStorage.getDatabase()
    const shopkeeper = db.shopkeepers.find((s) => s.id === input.shopkeeperId)
    if (!shopkeeper) throw new Error(`Shopkeeper not found: ${input.shopkeeperId}`)

    let totalPieces = 0
    let totalAmount = 0
    const deliveryNumber = `DLV-${new Date().getFullYear()}-${generateId().slice(0, 4).toUpperCase()}`

    const deliveryItems = input.items.map((item) => {
      const lineTotal = calculateLineTotal(item.quantityPieces, item.pricePerPiece)
      totalPieces += item.quantityPieces
      totalAmount += lineTotal

      return {
        id: generateId('ditem'),
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
        soldPieces: 0,
      }
    })

    // Record stock movement for each item via stockEngine
    for (const item of input.items) {
      const res = stockEngine.recordMovement(db, {
        itemType: 'finished_goods',
        itemId: item.variantId,
        movementType: input.transactionType === 'consignment' ? 'consignment_out' : 'sale',
        quantityPieces: item.quantityPieces,
        unitPrice: item.pricePerPiece,
        referenceId: deliveryNumber,
        referenceType: 'delivery',
        date: input.date,
        notes: `${input.transactionType === 'consignment' ? 'Consignment' : 'Credit sale'} delivery to ${shopkeeper.shopName}`,
      })
      db = res.db
    }

    const initialPaid = input.paidAmount || 0
    const deliveryId = generateId('deliv')

    const delivery: ShopkeeperDelivery = {
      id: deliveryId,
      deliveryNumber,
      date: input.date,
      transactionType: input.transactionType,
      items: deliveryItems,
      totalPieces,
      totalAmount: roundCurrency(totalAmount),
      paidAmount: initialPaid,
      outstandingAmount:
        input.transactionType === 'credit_sale'
          ? roundCurrency(totalAmount - initialPaid)
          : 0,
      settledAmount: 0,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    }

    db.shopkeeperDeliveries[shopkeeper.id] = [delivery, ...(db.shopkeeperDeliveries[shopkeeper.id] || [])]
    shopkeeper.totalDeliveredValue = roundCurrency(shopkeeper.totalDeliveredValue + totalAmount)
    shopkeeper.lastTransactionDate = input.date

    if (input.transactionType === 'consignment') {
      shopkeeper.consignmentPiecesHeld += totalPieces
      mockStorage.saveDatabase(db)
    } else {
      const { db: updatedDb } = ledgerEngine.appendLedgerEntry(db, {
        partyType: 'shopkeeper',
        partyId: shopkeeper.id,
        date: input.date,
        type: 'sale',
        refType: 'delivery',
        refId: deliveryNumber,
        debit: totalAmount,
        credit: 0,
        note: `Credit Delivery: ${totalPieces} pcs garments`,
      })
      mockStorage.saveDatabase(updatedDb)
    }

    if (initialPaid > 0) {
      await this.recordPayment({
        shopkeeperId: shopkeeper.id,
        date: input.date,
        amount: initialPaid,
        paymentMethod: 'cash',
        notes: `Initial payment on ${deliveryNumber}`,
      })
    }

    return delivery
  }

  public async settleConsignment(input: SettleConsignmentInput): Promise<{
    delivery: ShopkeeperDelivery
    settledAmount: number
    settledPieces: number
  }> {
    const db = mockStorage.getDatabase()
    const shopkeeper = db.shopkeepers.find((s) => s.id === input.shopkeeperId)
    if (!shopkeeper) throw new Error(`Shopkeeper not found: ${input.shopkeeperId}`)

    const deliveries = db.shopkeeperDeliveries[shopkeeper.id] || []
    const delivery = deliveries.find((d) => d.id === input.deliveryId)
    if (!delivery) throw new Error(`Delivery not found: ${input.deliveryId}`)
    if (delivery.transactionType !== 'consignment') {
      throw new Error(`Delivery ${delivery.deliveryNumber} is not a consignment delivery`)
    }

    let settledAmount = 0
    let settledPieces = 0
    const settleDate = input.date || new Date().toISOString().split('T')[0]

    for (const itemInput of input.items) {
      if (itemInput.soldPieces <= 0) continue
      const dItem = delivery.items.find((i) => i.variantId === itemInput.variantId)
      if (!dItem) throw new Error(`Variant ${itemInput.variantId} not found in delivery`)

      const unsoldPieces = dItem.quantityPieces - dItem.returnedPieces - (dItem.soldPieces || 0)
      if (itemInput.soldPieces > unsoldPieces) {
        throw new Error(
          `Cannot settle ${itemInput.soldPieces} pcs for ${dItem.productName}. Only ${unsoldPieces} unsold pcs remain.`
        )
      }

      dItem.soldPieces = (dItem.soldPieces || 0) + itemInput.soldPieces
      const lineSettled = calculateLineTotal(itemInput.soldPieces, dItem.pricePerPiece)
      settledAmount += lineSettled
      settledPieces += itemInput.soldPieces
    }

    if (settledPieces === 0) {
      throw new Error('No pieces to settle')
    }

    settledAmount = roundCurrency(settledAmount)
    delivery.settledAmount = roundCurrency((delivery.settledAmount || 0) + settledAmount)
    delivery.outstandingAmount = roundCurrency(delivery.outstandingAmount + settledAmount)

    shopkeeper.consignmentPiecesHeld = Math.max(0, shopkeeper.consignmentPiecesHeld - settledPieces)
    shopkeeper.lastTransactionDate = settleDate

    const { db: updatedDb } = ledgerEngine.appendLedgerEntry(db, {
      partyType: 'shopkeeper',
      partyId: shopkeeper.id,
      date: settleDate,
      type: 'sale',
      refType: 'consignment_settlement',
      refId: delivery.deliveryNumber,
      debit: settledAmount,
      credit: 0,
      note: input.notes || `Consignment settlement: ${settledPieces} pcs from ${delivery.deliveryNumber}`,
    })

    mockStorage.saveDatabase(updatedDb)
    return { delivery, settledAmount, settledPieces }
  }

  public async recordPayment(input: RecordShopkeeperPaymentInput): Promise<ShopkeeperPayment> {
    const db = mockStorage.getDatabase()
    const shopkeeper = db.shopkeepers.find((s) => s.id === input.shopkeeperId)
    if (!shopkeeper) throw new Error(`Shopkeeper not found: ${input.shopkeeperId}`)

    const receiptNumber = `RCP-SK-${generateId().slice(0, 4).toUpperCase()}`
    const payment: ShopkeeperPayment = {
      id: generateId('skpay'),
      receiptNumber,
      date: input.date,
      amount: roundCurrency(input.amount),
      paymentMethod: input.paymentMethod,
      reference: input.reference,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    }

    db.shopkeeperPayments[shopkeeper.id] = [payment, ...(db.shopkeeperPayments[shopkeeper.id] || [])]
    shopkeeper.totalPaymentsReceived = roundCurrency(shopkeeper.totalPaymentsReceived + input.amount)
    shopkeeper.lastTransactionDate = input.date

    const { db: updatedDb } = ledgerEngine.appendLedgerEntry(db, {
      partyType: 'shopkeeper',
      partyId: shopkeeper.id,
      date: input.date,
      type: 'payment',
      refType: 'receipt',
      refId: receiptNumber,
      debit: 0,
      credit: input.amount,
      note: `Payment received (${input.paymentMethod}): ${input.reference || 'N/A'}`,
    })

    mockStorage.saveDatabase(updatedDb)
    return payment
  }

  public async recordReturn(input: RecordShopkeeperReturnInput): Promise<ShopkeeperReturnRecord> {
    let db = mockStorage.getDatabase()
    const shopkeeper = db.shopkeepers.find((s) => s.id === input.shopkeeperId)
    if (!shopkeeper) throw new Error(`Shopkeeper not found: ${input.shopkeeperId}`)

    const deliveries = db.shopkeeperDeliveries[shopkeeper.id] || []
    const delivery = deliveries.find((d) => d.id === input.deliveryId)
    if (!delivery) throw new Error(`Delivery not found: ${input.deliveryId}`)

    const item = delivery.items.find((i) => i.variantId === input.variantId)
    if (!item) throw new Error(`Product variant not found in delivery: ${input.variantId}`)

    const remainingEligible = item.quantityPieces - item.returnedPieces - (item.soldPieces || 0)
    if (input.returnQuantityPieces <= 0) {
      throw new Error('Return quantity must be greater than zero')
    }
    if (input.returnQuantityPieces > remainingEligible) {
      throw new Error(
        `Cannot return ${input.returnQuantityPieces} pcs. Only ${remainingEligible} pcs eligible for return.`
      )
    }

    const creditAmount = calculateReturnCredit(input.returnQuantityPieces, item.pricePerPiece)

    item.returnedPieces += input.returnQuantityPieces
    if (input.condition === 'sellable') {
      item.sellableReturnedPieces += input.returnQuantityPieces
    } else {
      item.damagedReturnedPieces += input.returnQuantityPieces
    }

    const returnNumber = `RET-${generateId().slice(0, 4).toUpperCase()}`
    const returnRecord: ShopkeeperReturnRecord = {
      id: generateId('skret'),
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

    db.shopkeeperReturns[shopkeeper.id] = [returnRecord, ...(db.shopkeeperReturns[shopkeeper.id] || [])]

    if (delivery.transactionType === 'consignment') {
      shopkeeper.consignmentPiecesHeld = Math.max(
        0,
        shopkeeper.consignmentPiecesHeld - input.returnQuantityPieces
      )
      const res = stockEngine.recordMovement(db, {
        itemType: 'finished_goods',
        itemId: input.variantId,
        movementType: 'consignment_return',
        quantityPieces: input.returnQuantityPieces,
        unitPrice: item.pricePerPiece,
        referenceId: returnNumber,
        referenceType: 'sales_return',
        date: returnRecord.date,
        notes: `Consignment return (${input.condition}): ${input.reason}`,
      })
      db = res.db
    } else {
      delivery.outstandingAmount = roundCurrency(delivery.outstandingAmount - creditAmount)
      shopkeeper.totalReturnAdjustments = roundCurrency(shopkeeper.totalReturnAdjustments + creditAmount)

      const res = stockEngine.recordMovement(db, {
        itemType: 'finished_goods',
        itemId: input.variantId,
        movementType: 'sales_return',
        quantityPieces: input.returnQuantityPieces,
        unitPrice: item.pricePerPiece,
        referenceId: returnNumber,
        referenceType: 'sales_return',
        date: returnRecord.date,
        notes: `Sales return (${input.condition}): ${input.reason}`,
      })
      db = res.db

      const { db: updatedDb } = ledgerEngine.appendLedgerEntry(db, {
        partyType: 'shopkeeper',
        partyId: shopkeeper.id,
        date: returnRecord.date,
        type: 'return',
        refType: 'return',
        refId: returnNumber,
        debit: 0,
        credit: creditAmount,
        note: `Return credit (${input.condition}): ${input.returnQuantityPieces} pcs @ ৳${item.pricePerPiece}/pc`,
      })
      db = updatedDb
    }

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
