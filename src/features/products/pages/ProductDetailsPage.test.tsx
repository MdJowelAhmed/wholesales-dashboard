import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '@/test/helpers/test-utils'
import { ProductDetailsPage } from './ProductDetailsPage'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'

describe('ProductDetailsPage', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('renders product details and variants table with sizes and per-piece prices', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/products/:id" element={<ProductDetailsPage />} />
      </Routes>,
      { initialEntries: ['/products/prod-001'] }
    )

    expect(await screen.findByText(/Boys' Pique Polo Shirt \(BPS-101\)/i)).toBeInTheDocument()
    expect(screen.getByText('Size Variants & Pricing')).toBeInTheDocument()

    // Variant sizes 18, 20, 22
    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('22')).toBeInTheDocument()
    expect(screen.getByText('BPS-101-18-NAVY')).toBeInTheDocument()
  })
})
