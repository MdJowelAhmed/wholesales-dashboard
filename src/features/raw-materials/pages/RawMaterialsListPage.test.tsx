import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers/test-utils'
import { RawMaterialsListPage } from './RawMaterialsListPage'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'

describe('RawMaterialsListPage', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('renders raw materials list, units, and low stock indicator', async () => {
    renderWithProviders(<RawMaterialsListPage />, { initialEntries: ['/raw-materials'] })

    expect(await screen.findByText('Raw Materials & Fabric Store')).toBeInTheDocument()
    expect(screen.getByText('Total Stock Value')).toBeInTheDocument()
    expect(screen.getByText(/100% Combed Cotton Single Jersey/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Square Textiles Ltd/i)[0]).toBeInTheDocument()

    // Low stock item
    expect(screen.getByText('LOW')).toBeInTheDocument()
  })
})
