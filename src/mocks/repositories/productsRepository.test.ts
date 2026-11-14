import { describe, it, expect, beforeEach } from 'vitest'
import { mockStorage } from '../storage/localStorageAdapter'
import { productsRepository } from './productsRepository'

describe('productsRepository', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('lists products from seed data', async () => {
    const products = await productsRepository.listProducts()
    expect(products.length).toBeGreaterThan(0)
  })

  it('creates a product with variants immutably', async () => {
    const created = await productsRepository.createProduct({
      name: 'Audit Test Tee',
      code: 'AUD-001',
      category: "Boys' Wear",
      status: 'active',
      variants: [
        {
          id: 'v-temp',
          sku: 'AUD-001-20',
          size: '20',
          pricePerPiece: 220,
          stockPieces: 50,
          isActive: true,
        },
      ],
    })

    expect(created.id).toBeTruthy()
    expect(created.variants[0].stockPieces).toBe(50)

    const again = await productsRepository.listProducts()
    expect(again.some((p) => p.id === created.id)).toBe(true)
  })
})