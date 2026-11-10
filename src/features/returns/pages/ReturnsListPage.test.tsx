import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ReturnsListPage } from './ReturnsListPage'

describe('ReturnsListPage', () => {
  it('renders returns list, credit value metrics and condition quarantine indicators', async () => {
    render(<ReturnsListPage />)

    expect(screen.getByText(/Returns & Quality Claims/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Total Return Credit/i)).toBeInTheDocument()
      expect(screen.getByText(/Restocked to Inventory/i)).toBeInTheDocument()
      expect(screen.getByText(/Damaged \/ Quarantine/i)).toBeInTheDocument()
    })
  })

  it('filters returns by search keyword', async () => {
    render(<ReturnsListPage />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by return #/i)).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Search by return #/i)
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_RETURN_XYZ' } })

    expect(
      screen.getByText(/No returns found matching your criteria/i)
    ).toBeInTheDocument()
  })

  it('opens Process Return dialog on button click', async () => {
    render(<ReturnsListPage />)

    const returnBtn = screen.getByRole('button', { name: /Process Return/i })
    fireEvent.click(returnBtn)

    await waitFor(() => {
      expect(screen.getByText(/Process Wholesale Return/i)).toBeInTheDocument()
      expect(screen.getByText(/Shopkeeper \/ Partner \*/i)).toBeInTheDocument()
    })
  })
})
