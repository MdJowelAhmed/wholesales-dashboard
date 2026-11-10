import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ReportsPage } from './ReportsPage'
import { exportToCsv } from '@/lib/utils/csvExport'

vi.mock('@/lib/utils/csvExport', () => ({
  exportToCsv: vi.fn(),
}))

describe('ReportsPage', () => {
  it('renders report navigation tabs and sales summary', async () => {
    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Executive Reports & Analytics/i)).toBeInTheDocument()
      expect(screen.getByText(/Sales & Realization/i)).toBeInTheDocument()
      expect(screen.getByText(/Stock Valuation & Assets/i)).toBeInTheDocument()
      expect(screen.getByText(/Wholesale Receivables Aging/i)).toBeInTheDocument()
      expect(screen.getByText(/Profit & Loss Statement \(P&L\)/i)).toBeInTheDocument()
    })
  })

  it('switches between reports when tab buttons are clicked', async () => {
    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Sales & Collections Realization/i)).toBeInTheDocument()
    })

    // Switch to Stock Valuation
    const stockTab = screen.getByRole('button', { name: /Stock Valuation & Assets/i })
    fireEvent.click(stockTab)
    expect(
      screen.getByText(/Warehouse Finished Goods Valuation/i)
    ).toBeInTheDocument()

    // Switch to P&L
    const pnlTab = screen.getByRole('button', { name: /Profit & Loss Statement \(P&L\)/i })
    fireEvent.click(pnlTab)
    expect(
      screen.getByText(/Factory Profit & Loss Statement \(EBITDA\)/i)
    ).toBeInTheDocument()
  })

  it('triggers CSV download without error', async () => {
    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Download Sales CSV/i })).toBeInTheDocument()
    })

    const downloadBtn = screen.getByRole('button', { name: /Download Sales CSV/i })
    fireEvent.click(downloadBtn)

    expect(exportToCsv).toHaveBeenCalled()
  })
})
