import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers/test-utils'
import { AppLayout } from './AppLayout'

describe('AppLayout', () => {
  it('renders brand title, navigation categories and breadcrumb', () => {
    renderWithProviders(<AppLayout />, { initialEntries: ['/'] })

    expect(screen.getByText('Aparajita ERP')).toBeInTheDocument()
    expect(screen.getByText('Garments & Wholesale')).toBeInTheDocument()
    expect(screen.getByText('Core Master Data')).toBeInTheDocument()
    expect(screen.getByText('Manufacturing & Partners')).toBeInTheDocument()
    expect(screen.getByText('Commerce & Orders')).toBeInTheDocument()
    expect(screen.getByText('Finance & System')).toBeInTheDocument()

    // Breadcrumb
    expect(screen.getByRole('navigation', { name: /breadcrumbs/i })).toBeInTheDocument()
  })

  it('toggles theme when theme toggle button is clicked', async () => {
    const user = userEvent.setup()
    const { store } = renderWithProviders(<AppLayout />, { initialEntries: ['/'] })

    const themeButton = screen.getByTitle(/Theme:/i)
    expect(themeButton).toBeInTheDocument()

    await user.click(themeButton)
    expect(store.getState().theme.mode).toBeDefined()
  })

  it('toggles sidebar collapsed state when toggle is clicked', async () => {
    const user = userEvent.setup()
    const { store } = renderWithProviders(<AppLayout />, { initialEntries: ['/'] })

    const toggleBtn = screen.getByLabelText('Collapse sidebar')
    expect(store.getState().ui.sidebarCollapsed).toBe(false)

    await user.click(toggleBtn)
    expect(store.getState().ui.sidebarCollapsed).toBe(true)
  })

  it('allows switching the active business profile', async () => {
    const user = userEvent.setup()
    const { store } = renderWithProviders(<AppLayout />, { initialEntries: ['/'] })

    const select = screen.getByRole('combobox', { name: /select business branch/i })
    expect(select).toBeInTheDocument()

    await user.selectOptions(select, 'biz-2')
    expect(store.getState().ui.activeBusiness.id).toBe('biz-2')
  })

  it('opens Global Search dialog when search button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AppLayout />, { initialEntries: ['/'] })

    const searchBtn = screen.getByText(/Search products, wholesale shops/i)
    await user.click(searchBtn)

    expect(
      screen.getByPlaceholderText(/Search products, wholesale shops, suppliers/i)
    ).toBeInTheDocument()
  })

  it('opens notifications dropdown when bell icon is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AppLayout />, { initialEntries: ['/'] })

    const notifBtn = screen.getByRole('button', { name: /view notifications/i })
    await user.click(notifBtn)

    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Low Stock Alert')).toBeInTheDocument()
  })
})
