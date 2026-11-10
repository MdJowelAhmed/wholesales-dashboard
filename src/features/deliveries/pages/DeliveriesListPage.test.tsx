import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { DeliveriesListPage } from './DeliveriesListPage'

describe('DeliveriesListPage', () => {
  it('renders wholesale deliveries, challans and consignment stock cards', async () => {
    render(<DeliveriesListPage />)

    expect(screen.getByText(/Shopkeeper Deliveries & Challans/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Total Dispatched Value/i)).toBeInTheDocument()
      expect(screen.getByText(/Total Garments Dispatched/i)).toBeInTheDocument()
      expect(screen.getByText(/Consignment Stock Held/i)).toBeInTheDocument()
    })
  })

  it('filters deliveries when search query is entered', async () => {
    render(<DeliveriesListPage />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by challan #/i)).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Search by challan #/i)
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_CHALLAN_XYZ' } })

    expect(screen.getByText(/No wholesale deliveries found/i)).toBeInTheDocument()
  })

  it('opens Dispatch Delivery dialog on button click', async () => {
    render(<DeliveriesListPage />)

    const dispatchBtn = screen.getByRole('button', { name: /Dispatch Delivery/i })
    fireEvent.click(dispatchBtn)

    await waitFor(() => {
      expect(screen.getByText(/Dispatch Wholesale Delivery \(Challan\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Wholesale Shopkeeper \*/i)).toBeInTheDocument()
    })
  })
})
