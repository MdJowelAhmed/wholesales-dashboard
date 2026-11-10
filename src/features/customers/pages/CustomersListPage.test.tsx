import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers/test-utils'
import { CustomersListPage } from './CustomersListPage'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'

describe('CustomersListPage', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('renders retail customers and outlet balances', async () => {
    renderWithProviders(<CustomersListPage />, { initialEntries: ['/customers'] })

    expect(await screen.findByText('Retail & Boutique Customers')).toBeInTheDocument()
    expect(screen.getByText('Customer Receivables')).toBeInTheDocument()
    expect(screen.getByText(/Kids Club Boutique/i)).toBeInTheDocument()
    expect(screen.getByText(/Sector 3, Uttara/i)).toBeInTheDocument()
  })

  it('opens Add Customer dialog when clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomersListPage />, { initialEntries: ['/customers'] })

    const addBtn = await screen.findByRole('button', { name: /Add Customer/i })
    await user.click(addBtn)

    expect(screen.getByText('Add Customer / Boutique')).toBeInTheDocument()
  })
})
