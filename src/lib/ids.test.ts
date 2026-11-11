import { describe, it, expect } from 'vitest'
import { generateId } from './ids'

describe('generateId', () => {
  it('generates unique IDs with given prefix', () => {
    const id1 = generateId('prod')
    const id2 = generateId('prod')

    expect(id1.startsWith('prod-')).toBe(true)
    expect(id2.startsWith('prod-')).toBe(true)
    expect(id1).not.toBe(id2)
  })

  it('generates unique IDs without prefix', () => {
    const id = generateId()
    expect(id).toBeDefined()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThanOrEqual(10)
  })
})

