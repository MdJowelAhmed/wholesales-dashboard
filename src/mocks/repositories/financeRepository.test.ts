import { describe, it, expect, beforeEach } from 'vitest'
import { financeRepository } from './financeRepository'
import { productsRepository } from './productsRepository'
import { mockStorage } from '../storage/localStorageAdapter'

describe('financeRepository & productsRepository', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('calculates consistent dashboard metrics from seed data', async () => {
    const metrics = await financeRepository.getDashboardMetrics()
    expect(metrics.monthlySales).toBeGreaterThan(0)
    expect(metrics.totalFinishedGoodsPieces).toBeGreaterThan(0)
    expect(metrics.outstandingShopkeeperBalances).toBeGreaterThan(0)
    expect(metrics.supplierPayables).toBeGreaterThan(0)
  })

  it('creates and lists products with variants', async () => {
    const created = await productsRepository.createProduct({
      name: "Men's Oxford Formal Shirt",
      code: 'MOS-501',
      category: "Men's Wear",
      description: '100% fine cotton oxford weave.',
      status: 'active',
      variants: [
        {
          id: 'var-501-40',
          sku: 'MOS-501-40-WHT',
          size: '40',
          pricePerPiece: 550,
          stockPieces: 100,
          isActive: true,
        },
      ],
    })

    expect(created.id).toBeDefined()
    const all = await productsRepository.listProducts({ search: 'Oxford' })
    expect(all.length).toBe(1)
    expect(all[0].name).toBe("Men's Oxford Formal Shirt")
  })
})
