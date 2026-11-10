import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers/test-utils'
import { ProductionDashboardPage } from './ProductionDashboardPage'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'

describe('ProductionDashboardPage', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('renders production orders, target quantities and daily outputs', async () => {
    renderWithProviders(<ProductionDashboardPage />, { initialEntries: ['/production'] })

    expect(await screen.findByText('Garments Production Floor')).toBeInTheDocument()
    expect(screen.getByText('Total Output Completed')).toBeInTheDocument()
    expect(screen.getAllByText('PO-2026-BPS')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Sultana Begum')[0]).toBeInTheDocument()
    expect(screen.getByText('118 passed')).toBeInTheDocument()
  })

  it('opens New Production Order dialog when clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductionDashboardPage />, { initialEntries: ['/production'] })

    const orderBtn = await screen.findByRole('button', { name: /New Production Order/i })
    await user.click(orderBtn)

    expect(screen.getByText('New Cutting & Production Order')).toBeInTheDocument()
  })

  it('opens Log Daily Output dialog when clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductionDashboardPage />, { initialEntries: ['/production'] })

    const logBtn = await screen.findByRole('button', { name: /Log Daily Output/i })
    await user.click(logBtn)

    expect(screen.getByText(/Log Daily Output & Tailor Wages/i)).toBeInTheDocument()
  })
})
