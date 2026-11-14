import { describe, it, expect, beforeEach } from 'vitest'
import { mockStorage } from '../storage/localStorageAdapter'
import { salesRepository } from './salesRepository'

describe('salesRepository', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('lists sales from seed', async () => {
    const sales = await salesRepository.listSales()
    expect(sales.length).toBeGreaterThan(0)
    expect(sales[0].invoiceNumber).toBeTruthy()
  })

  it('resolves customer by id', async () => {
    const customers = await salesRepository.listCustomers()
    const first = customers[0]
    expect(first).toBeDefined()
    const found = await salesRepository.getCustomerById(first.id)
    expect(found?.id).toBe(first.id)
  })
})