import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { SalesListPage } from './SalesListPage'

describe('SalesListPage', () => {
  it('renders sales invoices, summary metrics and piece counts', async () => {
    render(
      <BrowserRouter>
        <SalesListPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/Sales & Invoicing/i)).toBeInTheDocument()

    // Wait for data load
    await waitFor(() => {
      expect(screen.getByText(/Total Invoiced/i)).toBeInTheDocument()
      expect(screen.getByText(/Total Garments Sold/i)).toBeInTheDocument()
    })
  })

  it('filters invoices when search term is entered', async () => {
    render(
      <BrowserRouter>
        <SalesListPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by invoice #/i)).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Search by invoice #/i)
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT-99999' } })

    expect(
      screen.getByText(/No sales invoices found matching your criteria/i)
    ).toBeInTheDocument()
  })

  it('opens New Sales Invoice dialog when button is clicked', async () => {
    render(
      <BrowserRouter>
        <SalesListPage />
      </BrowserRouter>
    )

    const newBtn = screen.getByRole('button', { name: /New Sales Invoice/i })
    fireEvent.click(newBtn)

    await waitFor(() => {
      expect(screen.getByText(/Create Sales Invoice/i)).toBeInTheDocument()
      expect(screen.getByText(/Finished Garments \(Strictly Per-Piece\)/i)).toBeInTheDocument()
    })
  })
})
