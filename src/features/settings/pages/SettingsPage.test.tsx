import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SettingsPage } from './SettingsPage'

describe('SettingsPage', () => {
  it('renders settings page, company profile and save button', () => {
    render(<SettingsPage />)

    expect(screen.getByText(/Factory & System Settings/i)).toBeInTheDocument()
    expect(screen.getByText(/Commercial Company Details/i)).toBeInTheDocument()
    expect(
      screen.getByDisplayValue(/Aparajita Garments & Wholesale Ltd./i)
    ).toBeInTheDocument()
  })

  it('switches between profile, branches, and data management tabs', async () => {
    render(<SettingsPage />)

    // Switch to branches
    const branchesTab = screen.getByRole('button', { name: /Warehouses & Depots/i })
    fireEvent.click(branchesTab)
    expect(
      screen.getByText(/Registered Factory Facilities & Hubs/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Central Finished Goods Wholesale Depot/i)
    ).toBeInTheDocument()

    // Switch to data
    const dataTab = screen.getByRole('button', { name: /Database Backup & Restore/i })
    fireEvent.click(dataTab)
    expect(
      screen.getByText(/Local Browser Database Tools/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Download Snapshot/i })
    ).toBeInTheDocument()

    // Switch to attributes (Categories & Sizes)
    const attributesTab = screen.getByRole('button', { name: /Categories & Sizes/i })
    fireEvent.click(attributesTab)
    expect(await screen.findByText(/Product Categories \(পোশাকের ক্যাটাগরি\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Size Formats & Ranges \(সাইজ ও সাইজ রেঞ্জ\)/i)).toBeInTheDocument()
  })
})
