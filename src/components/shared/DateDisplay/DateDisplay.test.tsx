import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DateDisplay } from './DateDisplay'

describe('DateDisplay', () => {
  it('formats valid ISO dates cleanly', () => {
    render(<DateDisplay date="2026-09-15T10:00:00Z" />)
    expect(screen.getByText('15 Sep 2026')).toBeInTheDocument()
  })

  it('renders invalid date message when date string is corrupted', () => {
    render(<DateDisplay date="not-a-valid-date" />)
    expect(screen.getByText('Invalid date')).toBeInTheDocument()
  })
})
