import { describe, it, expect, beforeEach } from 'vitest'
import { mockStorage } from '../storage/localStorageAdapter'
import { financeRepository } from './financeRepository'
import { shopkeepersRepository } from './shopkeepersRepository'

describe('unified payment recording', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('writes shopkeeper payments to central payments and shopkeeper payment history', async () => {
    const skList = await shopkeepersRepository.listShopkeepers()
    const sk = skList[0]
    expect(sk).toBeDefined()

    await financeRepository.recordPayment({
      date: '2026-03-01',
      partyType: 'shopkeeper',
      partyId: sk.id,
      partyName: sk.shopName,
      amount: 1500,
      paymentMethod: 'cash',
      notes: 'Unified gateway test',
    })

    const central = await financeRepository.listPayments()
    const skPayments = await shopkeepersRepository.getPayments(sk.id)

    expect(central.some((p) => p.partyId === sk.id && p.amount === 1500)).toBe(true)
    expect(skPayments.some((p) => p.amount === 1500)).toBe(true)
  })

  it('routes delivery inline payments through the same gateway', async () => {
    const skList = await shopkeepersRepository.listShopkeepers()
    const sk = skList[0]
    const products = mockStorage.getDatabase().products
    const variant = products[0]?.variants?.[0]
    expect(variant).toBeDefined()

    await shopkeepersRepository.recordDelivery({
      shopkeeperId: sk.id,
      date: '2026-03-02',
      transactionType: 'credit_sale',
      items: [
        {
          productId: products[0].id,
          productName: products[0].name,
          variantId: variant!.id,
          sku: variant!.sku,
          size: variant!.size,
          quantityPieces: 10,
          pricePerPiece: variant!.pricePerPiece,
        },
      ],
      paidAmount: 2000,
      notes: 'Delivery with upfront payment',
    })

    const central = await financeRepository.listPayments()
    const skPayments = await shopkeepersRepository.getPayments(sk.id)

    expect(central.some((p) => p.amount === 2000 && p.partyId === sk.id)).toBe(true)
    expect(skPayments.some((p) => p.amount === 2000)).toBe(true)
  })
})