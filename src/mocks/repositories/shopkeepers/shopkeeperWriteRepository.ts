import {
  Shopkeeper,
  ShopkeeperDelivery,
  ShopkeeperPayment,
  ShopkeeperReturnRecord,
} from '@/types/shopkeepers'
import {
  calculateLineTotal,
  calculateReturnCredit,
  roundCurrency,
} from '@/lib/calculations/financialCalculations'
import { generateId } from '@/lib/ids'
import { mockStorage } from '../../storage/localStorageAdapter'
import { STORAGE_SCOPES } from '../../storage/storageScopes'
import { ledgerEngine } from '../ledgerEngine'
import { stockEngine } from '../stockEngine'
import { financeRepository } from '../financeRepository'
import type {
  RecordDeliveryInput,
  RecordShopkeeperPaymentInput,
  RecordShopkeeperReturnInput,
  SettleConsignmentInput,
} from './shopkeeperInputTypes'

const SK_WRITE = [STORAGE_SCOPES.SHOPKEEPERS] as const
const SK_INVENTORY_WRITE = [STORAGE_SCOPES.SHOPKEEPERS, STORAGE_SCOPES.INVENTORY] as const
const SK_LEDGER_WRITE = [STORAGE_SCOPES.SHOPKEEPERS, STORAGE_SCOPES.FINANCE] as const
const SK_RETURN_WRITE = [STORAGE_SCOPES.SHOPKEEPERS, STORAGE_SCOPES.INVENTORY, STORAGE_SCOPES.FINANCE] as const

export class ShopkeeperWriteRepository {
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
    mockStorage.saveDatabase(db, [...SK_WRITE])
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
      mockStorage.saveDatabase(db, [...SK_INVENTORY_WRITE])
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
      mockStorage.saveDatabase(updatedDb, [...SK_INVENTORY_WRITE, ...SK_LEDGER_WRITE])
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

    mockStorage.saveDatabase(updatedDb, [...SK_LEDGER_WRITE])
    return { delivery, settledAmount, settledPieces }
  }

  public async recordPayment(input: RecordShopkeeperPaymentInput): Promise<ShopkeeperPayment> {
    const db = mockStorage.getDatabase()
    const shopkeeper = db.shopkeepers.find((s) => s.id === input.shopkeeperId)
    if (!shopkeeper) throw new Error(`Shopkeeper not found: ${input.shopkeeperId}`)

    const record = await financeRepository.recordPayment({
      date: input.date,
      partyType: 'shopkeeper',
      partyId: shopkeeper.id,
      partyName: shopkeeper.shopName,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      reference: input.reference,
      notes: input.notes,
    })

    return {
      id: record.id,
      receiptNumber: record.receiptNumber,
      date: record.date,
      amount: record.amount,
      paymentMethod: record.paymentMethod,
      reference: input.reference,
      notes: input.notes,
      createdAt: record.createdAt ?? new Date().toISOString(),
    }
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

    mockStorage.saveDatabase(db, [...SK_RETURN_WRITE])
    return returnRecord
  }
}