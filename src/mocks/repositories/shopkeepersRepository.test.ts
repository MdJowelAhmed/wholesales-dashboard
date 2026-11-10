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
})
