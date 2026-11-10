import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers/test-utils'
import { InventoryManagementPage } from './InventoryManagementPage'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'

describe('InventoryManagementPage', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('renders finished goods stocks, valuations, and size variants', async () => {
    renderWithProviders(<InventoryManagementPage />, { initialEntries: ['/inventory'] })

    expect(
      await screen.findByText('Warehouse & Finished Goods Inventory')
    ).toBeInTheDocument()
    expect(screen.getByText('Finished Garments Stock')).toBeInTheDocument()
    expect(screen.getByText('Finished Goods Valuation')).toBeInTheDocument()
    expect(screen.getByText('BPS-101-18-NAVY')).toBeInTheDocument()
    expect(screen.getAllByText(/Size 18/i)[0]).toBeInTheDocument()
  })

  it('switches between Finished Goods, Raw Materials, and Movements tabs', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InventoryManagementPage />, { initialEntries: ['/inventory'] })

    await screen.findByText('Warehouse & Finished Goods Inventory')

    // Switch to Raw Materials
    const rmTab = screen.getByRole('button', { name: /Raw Materials & Fabric Store/i })
    await user.click(rmTab)
    expect(screen.getByText(/100% Combed Cotton Single Jersey/i)).toBeInTheDocument()

    // Switch to Movements
    const movTab = screen.getByRole('button', { name: /Stock Movements Audit Log/i })
    await user.click(movTab)
    expect(screen.getByText(/PRODUCTION RECEIPT/i)).toBeInTheDocument()
  })

  it('opens Adjust Stock dialog when clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InventoryManagementPage />, { initialEntries: ['/inventory'] })

    const adjustBtn = await screen.findByRole('button', { name: /Adjust Stock/i })
    await user.click(adjustBtn)

    expect(screen.getByText('Manual Stock Adjustment')).toBeInTheDocument()
  })
})
