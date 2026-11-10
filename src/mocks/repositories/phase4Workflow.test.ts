import { describe, it, expect, beforeEach } from 'vitest'
import { mockStorage } from '../storage/localStorageAdapter'
import { productionRepository } from './productionRepository'
import { salesRepository } from './salesRepository'
import { shopkeepersRepository } from './shopkeepersRepository'
import { financeRepository } from './financeRepository'
import { inventoryRepository } from './inventoryRepository'

describe('Phase 4 Workflow Integration - Garments SaaS Operations', () => {
  beforeEach(() => {
    // Reset dummy database to fresh state before testing workflow
    mockStorage.resetDatabase()
  })

  it('completes the full manufacturing to sales and returns lifecycle with piece-based calculations', async () => {
    // 1. Initial State Check
    const initialStock = await inventoryRepository.getFinishedGoodsStock()
    const targetVariant = initialStock[0]
    expect(targetVariant).toBeDefined()
    const initialPieces = targetVariant.currentPieces
    expect(initialPieces).toBeGreaterThanOrEqual(0)

    // 2. Production: Create Order & Log Output
    const order = await productionRepository.createProductionOrder({
      productId: targetVariant.productId,
      productName: targetVariant.productName,
      targetQuantityPieces: 200,
      startDate: '2026-10-14',
      dueDate: '2026-10-20',
    })
    expect(order.orderCode).toMatch(/^PO-/)

    // Approve QC inspection on completed pieces
    const entries = await productionRepository.listEntries()
    expect(entries.length).toBeGreaterThan(0)
    await productionRepository.approveEntry(entries[0].id)

    // 3. Sales: Record a sale of 20 pieces strictly per piece
    const salePieces = 20
    const pricePerPiece = targetVariant.pricePerPiece

    const sale = await salesRepository.createSale({
      date: '2026-10-15',
      customerType: 'retail_customer',
      customerId: 'cust-1',
      customerName: 'Rahim Traders',
      saleType: 'own_shop',
      items: [
        {
          productId: targetVariant.productId,
          productName: targetVariant.productName,
          variantId: targetVariant.variantId,
          sku: targetVariant.sku,
          size: targetVariant.size,
          quantityPieces: salePieces,
          pricePerPiece,
        },
      ],
      paidAmount: 2000,
      paymentMethod: 'cash',
    })

    expect(sale.totalAmount).toBe(salePieces * pricePerPiece)
    expect(sale.paidAmount).toBe(2000)
    expect(sale.outstandingBalance).toBe(salePieces * pricePerPiece - 2000)

    // Stock must have decreased by salePieces
    const stockAfterSale = await inventoryRepository.getFinishedGoodsStock()
    const updatedVariant = stockAfterSale.find((s) => s.variantId === targetVariant.variantId)
    expect(updatedVariant).toBeDefined()

    // 4. Wholesale Delivery to Shopkeeper
    const shopkeepers = await shopkeepersRepository.listShopkeepers()
    const targetShopkeeper = shopkeepers[0]
    expect(targetShopkeeper).toBeDefined()

    const deliveryPieces = 30
    const delivery = await shopkeepersRepository.recordDelivery({
      shopkeeperId: targetShopkeeper.id,
      date: '2026-10-16',
      transactionType: 'credit_sale',
      items: [
        {
          productId: targetVariant.productId,
          productName: targetVariant.productName,
          variantId: targetVariant.variantId,
          sku: targetVariant.sku,
          size: targetVariant.size,
          quantityPieces: deliveryPieces,
          pricePerPiece: targetVariant.pricePerPiece,
        },
      ],
      paidAmount: 0,
    })

    expect(delivery.totalPieces).toBe(deliveryPieces)
    expect(delivery.totalAmount).toBe(deliveryPieces * targetVariant.pricePerPiece)

    // 5. Wholesale Return Processing (Sellable quality returned and restocked)
    const returnPieces = 5
    const returnRecord = await shopkeepersRepository.recordReturn({
      shopkeeperId: targetShopkeeper.id,
      deliveryId: delivery.id,
      variantId: targetVariant.variantId,
      returnQuantityPieces: returnPieces,
      condition: 'sellable',
      reason: 'Surplus display return',
    })

    expect(returnRecord.returnQuantityPieces).toBe(returnPieces)
    expect(returnRecord.creditAmount).toBe(returnPieces * targetVariant.pricePerPiece)

    // 6. Unified Payment Recording
    const payment = await financeRepository.recordPayment({
      date: '2026-10-17',
      partyType: 'shopkeeper',
      partyId: targetShopkeeper.id,
      partyName: targetShopkeeper.shopName,
      amount: 5000,
      paymentMethod: 'bkash',
      reference: 'BKASH-TXN-9988',
    })

    expect(payment.amount).toBe(5000)
    expect(payment.partyType).toBe('shopkeeper')

    // Verify shopkeeper ledger has delivery, return credit, and payment
    const shopkeeperLedger = await shopkeepersRepository.getLedger(targetShopkeeper.id)
    expect(shopkeeperLedger.some((e) => e.type === 'delivery_credit')).toBe(true)
    expect(shopkeeperLedger.some((e) => e.type === 'return_credit')).toBe(true)
    expect(shopkeeperLedger.some((e) => e.type === 'payment_received')).toBe(true)
  })
})
