import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers/test-utils'
import { ProductsListPage } from './ProductsListPage'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'

describe('ProductsListPage', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('renders products list header, summary cards and table', async () => {
    renderWithProviders(<ProductsListPage />, { initialEntries: ['/products'] })

    expect(await screen.findByText('Products & Garment Models')).toBeInTheDocument()
    expect(screen.getByText('Total Garment Designs')).toBeInTheDocument()
    expect(screen.getByText('Finished Stock on Hand')).toBeInTheDocument()

    // Products from seed data
    expect(screen.getByText("Boys' Pique Polo Shirt")).toBeInTheDocument()
    expect(screen.getByText('BPS-101')).toBeInTheDocument()
  })

  it('filters products when search term is entered', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductsListPage />, { initialEntries: ['/products'] })

    await screen.findByText("Boys' Pique Polo Shirt")

    const searchInput = screen.getByPlaceholderText(/Search by product name/i)
    await user.type(searchInput, 'Frock')

    expect(screen.getByText("Girls' Embroidered Party Frock")).toBeInTheDocument()
    expect(screen.queryByText("Boys' Pique Polo Shirt")).not.toBeInTheDocument()
  })

  it('opens Add Product dialog when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductsListPage />, { initialEntries: ['/products'] })

    await screen.findByText("Boys' Pique Polo Shirt")

    const addBtn = screen.getByRole('button', { name: /Add Product/i })
    await user.click(addBtn)

    expect(screen.getByText('Add Garment Product')).toBeInTheDocument()
    expect(screen.getByText(/Initial Variant & Piece Pricing/i)).toBeInTheDocument()
  })
})
