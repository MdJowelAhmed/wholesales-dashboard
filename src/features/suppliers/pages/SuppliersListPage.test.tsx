import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers/test-utils'
import { SuppliersListPage } from './SuppliersListPage'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'

describe('SuppliersListPage', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('renders suppliers list and payable metrics', async () => {
    renderWithProviders(<SuppliersListPage />, { initialEntries: ['/suppliers'] })

    expect(await screen.findByText('Suppliers & Fabric Mills')).toBeInTheDocument()
    expect(screen.getByText('Total Outstanding Payables')).toBeInTheDocument()
    expect(screen.getByText(/Square Textiles Ltd/i)).toBeInTheDocument()
    expect(screen.getByText(/100% Combed Cotton Single Jersey/i)).toBeInTheDocument()
  })

  it('opens Add Supplier dialog when clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SuppliersListPage />, { initialEntries: ['/suppliers'] })

    const addBtn = await screen.findByRole('button', { name: /Add Supplier/i })
    await user.click(addBtn)

    expect(screen.getByText('Add Fabric / Trim Supplier')).toBeInTheDocument()
  })
})
