import { describe, it, expect } from 'vitest'
import {
  parseDateSafe,
  formatDate,
  formatDateTime,
  getRelativeTimeString,
  getTodayDateString,
} from './date'

describe('Date Utilities', () => {
  it('parses valid ISO date strings and Date objects', () => {
    expect(parseDateSafe('2026-05-15')).toBeInstanceOf(Date)
    expect(parseDateSafe(new Date())).toBeInstanceOf(Date)
    expect(parseDateSafe('invalid-date')).toBeNull()
    expect(parseDateSafe(null)).toBeNull()
    expect(parseDateSafe(undefined)).toBeNull()
  })

  it('formats dates with custom or default pattern', () => {
    expect(formatDate('2026-05-15')).toBe('15 May 2026')
    expect(formatDate('2026-05-15', 'yyyy/MM/dd')).toBe('2026/05/15')
    expect(formatDate(null)).toBe('—')
    expect(formatDate('invalid')).toBe('—')
  })

  it('formats date and time accurately', () => {
    const formatted = formatDateTime('2026-05-15T14:30:00')
    expect(formatted).toMatch(/15 May 2026/)
    expect(formatDateTime(null)).toBe('—')
  })

  it('generates relative time string', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    expect(getRelativeTimeString(yesterday)).toContain('ago')
    expect(getRelativeTimeString(null)).toBe('—')
  })

  it('returns today date in YYYY-MM-DD format', () => {
    const today = getTodayDateString()
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

