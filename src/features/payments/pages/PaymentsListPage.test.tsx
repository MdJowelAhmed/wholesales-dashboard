import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { PaymentsListPage } from './PaymentsListPage'

describe('PaymentsListPage', () => {
  it('renders payment records, inflow/outflow metrics, and receipt ledger', async () => {
    render(<PaymentsListPage />)

    expect(screen.getByText(/Payments & Collections/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Total Inflows \(Collections\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Total Outflows \(Disbursed\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Net Operations Cashflow/i)).toBeInTheDocument()
    })
  })

  it('filters payments when search term is entered', async () => {
    render(<PaymentsListPage />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by receipt #/i)).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Search by receipt #/i)
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_RECEIPT_XYZ' } })

    expect(screen.getByText(/No payment records found/i)).toBeInTheDocument()
  })

  it('opens Record Payment dialog when button is clicked', async () => {
    render(<PaymentsListPage />)

    const recordBtn = screen.getByRole('button', { name: /Record Payment/i })
    fireEvent.click(recordBtn)

    await waitFor(() => {
      expect(screen.getByText(/Record Transaction Payment/i)).toBeInTheDocument()
      expect(screen.getByText(/Transaction Party Type \*/i)).toBeInTheDocument()
    })
  })
})
