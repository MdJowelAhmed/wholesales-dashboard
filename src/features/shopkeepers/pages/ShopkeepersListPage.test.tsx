import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers/test-utils'
import { ShopkeepersListPage } from './ShopkeepersListPage'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'

describe('ShopkeepersListPage', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('renders wholesale shopkeepers and outstanding balances', async () => {
    renderWithProviders(<ShopkeepersListPage />, { initialEntries: ['/shopkeepers'] })

    expect(await screen.findByText('Wholesale Shopkeepers')).toBeInTheDocument()
    expect(await screen.findByText('Total Receivables')).toBeInTheDocument()
    expect(await screen.findByText('Haji Garments Wholesale')).toBeInTheDocument()
    expect(await screen.findByText(/Alhaj Mokhlesur Rahman/i)).toBeInTheDocument()
  })

  it('filters shopkeepers list on market search', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ShopkeepersListPage />, { initialEntries: ['/shopkeepers'] })

    await screen.findByText('Haji Garments Wholesale')

    const searchInput = screen.getByPlaceholderText(/Search shop name, owner, market, or phone/i)
    await user.type(searchInput, 'Keraniganj')

    await waitFor(
      () => {
        expect(screen.getByText(/Bhai Bhai Cloth Store/i)).toBeInTheDocument()
        expect(screen.queryByText('Haji Garments Wholesale')).not.toBeInTheDocument()
      },
      { timeout: 1500 }
    )
  })
})
