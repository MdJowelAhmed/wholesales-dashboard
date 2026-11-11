import { describe, it, expect, beforeEach } from 'vitest'
import { shopkeepersRepository } from './shopkeepersRepository'
import { mockStorage } from '../storage/localStorageAdapter'

describe('shopkeepersRepository', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('lists existing shopkeepers correctly', async () => {
    const list = await shopkeepersRepository.listShopkeepers()
    expect(list.length).toBeGreaterThan(0)
    expect(list.some((s) => s.shopName.includes('Haji Garments'))).toBe(true)
  })

  it('records a new product delivery and increases outstanding balance on credit sale', async () => {
    const shopkeeper = (await shopkeepersRepository.listShopkeepers())[0]
    const initialBalance = shopkeeper.outstandingBalance

    const delivery = await shopkeepersRepository.recordDelivery({
      shopkeeperId: shopkeeper.id,
      date: '2026-10-01',
      transactionType: 'credit_sale',
      items: [
        {
          productId: 'prod-001',
          productName: "Boys' Pique Polo Shirt",
          variantId: 'var-101-18',
          sku: 'BPS-101-18-NAVY',
          size: '18',
          quantityPieces: 50, // 50 pieces
          pricePerPiece: 280, // BDT 280 / piece -> 14,000
        },
      ],
      notes: 'Test credit delivery',
    })

    expect(delivery.totalPieces).toBe(50)
    expect(delivery.totalAmount).toBe(14000)

    const updated = await shopkeepersRepository.getShopkeeperById(shopkeeper.id)
    expect(updated?.outstandingBalance).toBe(initialBalance + 14000)
  })

  it('records a payment and reduces outstanding balance', async () => {
    const shopkeeper = (await shopkeepersRepository.listShopkeepers())[0]
    const initialBalance = shopkeeper.outstandingBalance

    const payment = await shopkeepersRepository.recordPayment({
      shopkeeperId: shopkeeper.id,
      date: '2026-10-02',
      amount: 10000,
      paymentMethod: 'cash',
      reference: 'CR-TEST-99',
    })

    expect(payment.amount).toBe(10000)

    const updated = await shopkeepersRepository.getShopkeeperById(shopkeeper.id)
    expect(updated?.outstandingBalance).toBe(initialBalance - 10000)
  })

  it('prevents returning more pieces than delivered', async () => {
    const shopkeeper = (await shopkeepersRepository.listShopkeepers())[0]
    const deliveries = await shopkeepersRepository.getDeliveries(shopkeeper.id)
    const delivery = deliveries[0]
    const item = delivery.items[0]

    // Attempt returning 9999 pieces
    await expect(
      shopkeepersRepository.recordReturn({
        shopkeeperId: shopkeeper.id,
        deliveryId: delivery.id,
        variantId: item.variantId,
        returnQuantityPieces: 9999,
        condition: 'sellable',
        reason: 'Over-return test',
      })
    ).rejects.toThrow(/Cannot return/)
  })

  it('records an eligible return and updates ledger and balance', async () => {
    const shopkeeper = (await shopkeepersRepository.listShopkeepers())[0]
    const deliveries = await shopkeepersRepository.getDeliveries(shopkeeper.id)
    const delivery = deliveries[0]
    const item = delivery.items[0]
    const initialBalance = shopkeeper.outstandingBalance

    const returnRecord = await shopkeepersRepository.recordReturn({
      shopkeeperId: shopkeeper.id,
      deliveryId: delivery.id,
      variantId: item.variantId,
      returnQuantityPieces: 5,
      condition: 'sellable',
      reason: 'Valid exchange',
    })

    const expectedCredit = 5 * item.pricePerPiece
    expect(returnRecord.creditAmount).toBe(expectedCredit)

    const updated = await shopkeepersRepository.getShopkeeperById(shopkeeper.id)
    expect(updated?.outstandingBalance).toBe(initialBalance - expectedCredit)
  })

  it('handles consignment delivery without creating receivables until settled', async () => {
    const shopkeeper = (await shopkeepersRepository.listShopkeepers())[0]
    const initialBalance = shopkeeper.outstandingBalance
    const initialHeld = shopkeeper.consignmentPiecesHeld

    // 1. Consignment delivery (50 pcs @ 300)
    const delivery = await shopkeepersRepository.recordDelivery({
      shopkeeperId: shopkeeper.id,
      date: '2026-10-05',
      transactionType: 'consignment',
      items: [
        {
          productId: 'prod-001',
          productName: "Boys' Pique Polo Shirt",
          variantId: 'var-101-18',
          sku: 'BPS-101-18-NAVY',
          size: '18',
          quantityPieces: 50,
          pricePerPiece: 300,
        },
      ],
      notes: 'Consignment shipment',
    })

    expect(delivery.outstandingAmount).toBe(0)
    const skAfterDelivery = await shopkeepersRepository.getShopkeeperById(shopkeeper.id)
    // Outstanding balance should NOT change on consignment delivery
    expect(skAfterDelivery?.outstandingBalance).toBe(initialBalance)
    expect(skAfterDelivery?.consignmentPiecesHeld).toBe(initialHeld + 50)

    // 2. Settle 30 pcs sold by the shopkeeper
    const settlement = await shopkeepersRepository.settleConsignment({
      shopkeeperId: shopkeeper.id,
      deliveryId: delivery.id,
      items: [{ variantId: 'var-101-18', soldPieces: 30 }],
      notes: 'Weekly consignment sold report',
    })

    expect(settlement.settledPieces).toBe(30)
    expect(settlement.settledAmount).toBe(9000)

    const skAfterSettle = await shopkeepersRepository.getShopkeeperById(shopkeeper.id)
    // 30 pcs settled = 9,000 receivable added to balance
    expect(skAfterSettle?.outstandingBalance).toBe(initialBalance + 9000)
    expect(skAfterSettle?.consignmentPiecesHeld).toBe(initialHeld + 20)

    // 3. Return remaining 20 unsold consignment pieces
    const ret = await shopkeepersRepository.recordReturn({
      shopkeeperId: shopkeeper.id,
      deliveryId: delivery.id,
      variantId: 'var-101-18',
      returnQuantityPieces: 20,
      condition: 'sellable',
      reason: 'Unsold consignment return',
    })

    expect(ret.returnQuantityPieces).toBe(20)
    const skAfterReturn = await shopkeepersRepository.getShopkeeperById(shopkeeper.id)
    // Outstanding balance unchanged because consignment return has no ledger entry
    expect(skAfterReturn?.outstandingBalance).toBe(initialBalance + 9000)
    expect(skAfterReturn?.consignmentPiecesHeld).toBe(initialHeld)
  })

  it('allows balance to go negative when customer/shopkeeper overpays (advance payment)', async () => {
    const shopkeeper = (await shopkeepersRepository.listShopkeepers())[0]
    const initialBalance = shopkeeper.outstandingBalance

    // Pay more than current balance (e.g. current balance + 15,000 advance)
    const overpaymentAmount = initialBalance + 15000
    await shopkeepersRepository.recordPayment({
      shopkeeperId: shopkeeper.id,
      date: '2026-10-06',
      amount: overpaymentAmount,
      paymentMethod: 'bank_transfer',
      reference: 'ADV-PAY-001',
    })

    const updated = await shopkeepersRepository.getShopkeeperById(shopkeeper.id)
    expect(updated?.outstandingBalance).toBe(-15000)
  })
})
