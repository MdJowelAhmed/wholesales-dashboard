import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers/test-utils'
import { AddProductDialog } from './AddProductDialog'
import { productsRepository } from '@/mocks/repositories/productsRepository'
import { variantsRepository } from '@/mocks/repositories/variantsRepository'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'

describe('AddProductDialog', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
    vi.clearAllMocks()
  })

  it('renders image upload, fabric input, and initial size formats (16-20, 22-26, 28-32, 34-38)', async () => {
    renderWithProviders(
      <AddProductDialog open={true} onOpenChange={vi.fn()} onSuccess={vi.fn()} />
    )

    expect(screen.getByText('Add Garment Product')).toBeInTheDocument()
    expect(screen.getByText(/Product Photo \/ Garment Design/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Product Name \*/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Design \/ Model Code \*/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Fabric \/ Material/i)).toBeInTheDocument()

    // Default wholesale pack variants
    await waitFor(() => {
      expect(screen.getByDisplayValue('16-20')).toBeInTheDocument()
      expect(screen.getByDisplayValue('22-26')).toBeInTheDocument()
      expect(screen.getByDisplayValue('28-32')).toBeInTheDocument()
      expect(screen.getByDisplayValue('34-38')).toBeInTheDocument()
    })
  })

  it('successfully creates product with multiple size variants and custom image URL', async () => {
    const user = userEvent.setup()
    const handleSuccess = vi.fn()
    const handleOpenChange = vi.fn()

    const createSpy = vi.spyOn(productsRepository, 'createProduct')

    renderWithProviders(
      <AddProductDialog
        open={true}
        onOpenChange={handleOpenChange}
        onSuccess={handleSuccess}
      />
    )

    // Fill Product Name & Model Code
    const nameInput = screen.getByPlaceholderText(/e.g. Boys' Cotton Polo Shirt/i)
    await user.type(nameInput, 'Kids Export Twill Cargo')

    const codeInput = screen.getByPlaceholderText(/e.g. BPS-101/i)
    await user.type(codeInput, 'KTC-909')

    // Switch to image URL and type URL
    const urlModeBtn = screen.getByRole('button', { name: /Image URL/i })
    await user.click(urlModeBtn)

    const urlInput = screen.getByPlaceholderText(/https:\/\/example.com/i)
    await user.type(urlInput, 'https://example.com/cargo.jpg')

    const setUrlBtn = screen.getByRole('button', { name: /Set URL/i })
    await user.click(setUrlBtn)

    // Submit product
    const submitBtn = screen.getByRole('button', { name: /Create Product/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Kids Export Twill Cargo',
          code: 'KTC-909',
          imageUrl: 'https://example.com/cargo.jpg',
          variants: expect.arrayContaining([
            expect.objectContaining({ size: '16-20', pricePerPiece: 180 }),
            expect.objectContaining({ size: '22-26', pricePerPiece: 220 }),
            expect.objectContaining({ size: '28-32', pricePerPiece: 260 }),
            expect.objectContaining({ size: '34-38', pricePerPiece: 310 }),
          ]),
        })
      )
      expect(handleSuccess).toHaveBeenCalled()
      expect(handleOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('dynamically loads categories from variants repository into dropdown', async () => {
    // Add a custom category to the repository
    await variantsRepository.createCategory('Export Denim', 'Denim apparel')

    renderWithProviders(
      <AddProductDialog open={true} onOpenChange={vi.fn()} onSuccess={vi.fn()} />
    )

    await waitFor(() => {
      const categorySelect = screen.getByLabelText(/Product Category \*/i) as HTMLSelectElement
      expect(categorySelect).toBeInTheDocument()
      const optionValues = Array.from(categorySelect.options).map((o) => o.value)
      expect(optionValues).toContain('Export Denim')
    })
  })

  it('dynamically loads sizes from variants repository and allows adding a new size variant row', async () => {
    const user = userEvent.setup()
    // Add a custom size to the repository
    await variantsRepository.createSize('36-40', 'Adult large format')

    renderWithProviders(
      <AddProductDialog open={true} onOpenChange={vi.fn()} onSuccess={vi.fn()} />
    )

    await waitFor(() => {
      expect(screen.getByText('Add Size Variant')).toBeInTheDocument()
    })

    const addVariantBtn = screen.getByRole('button', { name: /Add Size Variant/i })
    await user.click(addVariantBtn)

    await waitFor(() => {
      const options = screen.getAllByRole('option')
      const optionValues = options.map((o) => (o as HTMLOptionElement).value)
      expect(optionValues).toContain('36-40')
    })
  })
})
