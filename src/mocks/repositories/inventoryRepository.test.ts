import { describe, it, expect, beforeEach } from 'vitest'
import { mockStorage } from '../storage/localStorageAdapter'
import { inventoryRepository } from './inventoryRepository'

describe('inventoryRepository', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('returns finished goods stock snapshot', async () => {
    const stock = await inventoryRepository.getFinishedGoodsStock()
    expect(stock.length).toBeGreaterThan(0)
    expect(stock[0].currentPieces).toBeGreaterThanOrEqual(0)
  })

  it('returns raw materials aligned with materials collection', async () => {
    const materials = await inventoryRepository.getRawMaterialsStock()
    expect(materials.length).toBeGreaterThan(0)
    expect(materials[0].averageCost).toBeGreaterThanOrEqual(0)
  })
})