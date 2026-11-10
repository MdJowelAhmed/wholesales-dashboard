import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers/test-utils'
import { VariantsPage } from './VariantsPage'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'

describe('VariantsPage', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('renders variants page, summary cards and default categories tab', async () => {
    renderWithProviders(<VariantsPage />, { initialEntries: ['/variants'] })

    expect(
      await screen.findByText('Variants & Attributes (সাইজ, ক্যাটাগরি ও কালার)')
    ).toBeInTheDocument()

    // Summary cards
    expect(screen.getByText('Product Categories')).toBeInTheDocument()
    expect(screen.getByText('Size Formats & Series')).toBeInTheDocument()
    expect(screen.getByText('Fabric Color Palette')).toBeInTheDocument()

    // Tab buttons
    expect(screen.getByRole('button', { name: /Categories \(ক্যাটাগরি\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sizes & Ranges \(সাইজ ও রেঞ্জ\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Colors & Shades \(কালার ও শেড\)/i })).toBeInTheDocument()

    // Default categories displayed
    expect(screen.getByText("Kids' Wear")).toBeInTheDocument()
    expect(screen.getByText("Boys' Wear")).toBeInTheDocument()
  })

  it('allows creating, editing, and filtering garment categories', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VariantsPage />, { initialEntries: ['/variants'] })

    await screen.findByText("Kids' Wear")

    // Create Category
    const createBtn = screen.getByRole('button', { name: /Create Category/i })
    await user.click(createBtn)

    const nameInput = screen.getByPlaceholderText(/Export Polo, Denim Jeans/i)
    await user.type(nameInput, 'Export Panjabi')

    const submitBtn = screen.getByRole('button', { name: /^Create Category$/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Export Panjabi')).toBeInTheDocument()
    })

    // Filter categories
    const searchInput = screen.getByPlaceholderText(/Search categories/i)
    await user.type(searchInput, 'Panjabi')
    expect(screen.getByText('Export Panjabi')).toBeInTheDocument()
    expect(screen.queryByText("Kids' Wear")).not.toBeInTheDocument()
  })

  it('switches to Sizes tab and allows creating a new wholesale size format', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VariantsPage />, { initialEntries: ['/variants'] })

    const sizesTab = screen.getByRole('button', { name: /Sizes & Ranges \(সাইজ ও রেঞ্জ\)/i })
    await user.click(sizesTab)

    expect(await screen.findByText('16-20')).toBeInTheDocument()
    expect(screen.getByText('22-26')).toBeInTheDocument()

    // Create a new size format
    const createSizeBtn = screen.getByRole('button', { name: /Create Size Format/i })
    await user.click(createSizeBtn)

    const sizeInput = screen.getByPlaceholderText(/16-20, 22-26, 36-40, XXL/i)
    await user.type(sizeInput, '36-40')

    const submitBtn = screen.getByRole('button', { name: /^Create Size$/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('36-40')).toBeInTheDocument()
    })
  })

  it('switches to Colors tab and displays color shade palette', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VariantsPage />, { initialEntries: ['/variants'] })

    const colorsTab = screen.getByRole('button', { name: /Colors & Shades \(কালার ও শেড\)/i })
    await user.click(colorsTab)

    expect(await screen.findByText('Navy Blue')).toBeInTheDocument()
    expect(screen.getByText('Dark Indigo')).toBeInTheDocument()

    // Create a new color shade
    const createColorBtn = screen.getByRole('button', { name: /Create Color Shade/i })
    await user.click(createColorBtn)

    const colorInput = screen.getByPlaceholderText(/Navy Blue, Dark Indigo/i)
    await user.type(colorInput, 'Bottle Green')

    const submitBtn = screen.getByRole('button', { name: /^Create Color$/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Bottle Green')).toBeInTheDocument()
    })
  })
})

