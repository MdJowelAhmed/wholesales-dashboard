import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CurrencyDisplay } from './CurrencyDisplay'

describe('CurrencyDisplay', () => {
  it('formats positive currency with BDT symbol', () => {
    render(<CurrencyDisplay amount={25000} />)
    const element = screen.getByText(/25,000.00/)
    expect(element).toBeInTheDocument()
    expect(element.textContent).toContain('৳')
  })

  it('formats negative currency with negative indicator and destructive color', () => {
    render(<CurrencyDisplay amount={-4500} />)
    const element = screen.getByText(/-.*4,500.00/)
    expect(element).toBeInTheDocument()
    expect(element).toHaveClass('text-destructive')
  })
})
