import { describe, it, expect, beforeEach } from 'vitest'
import { mockStorage } from '../storage/localStorageAdapter'
import { variantsRepository } from './variantsRepository'

describe('variantsRepository', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('lists product categories', async () => {
    const categories = await variantsRepository.listCategories()
    expect(categories.length).toBeGreaterThan(0)
  })

  it('creates a unique category immutably', async () => {
    const created = await variantsRepository.createCategory('Audit Category', 'QA seed')
    expect(created.name).toBe('Audit Category')

    const names = await variantsRepository.listCategoryNames()
    expect(names).toContain('Audit Category')
  })
})