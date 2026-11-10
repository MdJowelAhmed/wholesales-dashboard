import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '@/test/helpers/test-utils'
import { ShopkeeperDetailsPage } from './ShopkeeperDetailsPage'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'

describe('ShopkeeperDetailsPage', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('renders shopkeeper profile and tabs', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/shopkeepers/:id" element={<ShopkeeperDetailsPage />} />
      </Routes>,
      { initialEntries: ['/shopkeepers/sk-001'] }
    )

    expect(await screen.findByText('Haji Garments Wholesale')).toBeInTheDocument()
    expect(screen.getAllByText(/Islampur Wholesale Market/i)[0]).toBeInTheDocument()
    expect(screen.getByText('Outstanding Balance')).toBeInTheDocument()
    expect(screen.getByText('Chronological Ledger', { exact: false })).toBeInTheDocument()
  })

  it('switches between deliveries, payments, and returns tabs', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path="/shopkeepers/:id" element={<ShopkeeperDetailsPage />} />
      </Routes>,
      { initialEntries: ['/shopkeepers/sk-001'] }
    )

    await screen.findByText('Haji Garments Wholesale')

    // Switch to deliveries tab
    const deliveriesTab = screen.getByRole('button', { name: /Product Deliveries/i })
    await user.click(deliveriesTab)
    expect(screen.getByText('DLV-2026-001')).toBeInTheDocument()
    expect(screen.getAllByText('Credit Sale')[0]).toBeInTheDocument()

    // Switch to returns tab
    const returnsTab = screen.getByRole('button', { name: /Returns Adjusted/i })
    await user.click(returnsTab)
    expect(screen.getByText('RET-2026-004')).toBeInTheDocument()
    expect(screen.getByText(/10 pcs/i)).toBeInTheDocument()
  })
})
