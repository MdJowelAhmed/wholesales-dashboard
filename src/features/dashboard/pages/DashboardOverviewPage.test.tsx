import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers/test-utils'
import { DashboardOverviewPage } from './DashboardOverviewPage'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'

describe('DashboardOverviewPage', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('renders dashboard overview KPIs and header', async () => {
    renderWithProviders(<DashboardOverviewPage />, { initialEntries: ['/'] })

    // Check header
    expect(await screen.findByText('Business & Factory Overview')).toBeInTheDocument()

    // Check KPI cards
    expect(screen.getByText("Today's Sales")).toBeInTheDocument()
    expect(screen.getByText('Finished Goods Stock')).toBeInTheDocument()
    expect(screen.getByText('Shopkeeper Receivables')).toBeInTheDocument()
    expect(screen.getByText('Supplier Payables')).toBeInTheDocument()
    expect(screen.getByText('Wage Liabilities')).toBeInTheDocument()
  })

  it('renders recent sales transactions and shopkeepers table', async () => {
    renderWithProviders(<DashboardOverviewPage />, { initialEntries: ['/'] })

    expect(await screen.findByText('Recent Sales Transactions')).toBeInTheDocument()
    expect(screen.getByText('Wholesale Shopkeepers')).toBeInTheDocument()
    expect(screen.getByText(/Quick Master Actions/i)).toBeInTheDocument()
  })
})
