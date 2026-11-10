import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers/test-utils'
import { EmployeesListPage } from './EmployeesListPage'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'

describe('EmployeesListPage', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('renders employees list and wage details', async () => {
    renderWithProviders(<EmployeesListPage />, { initialEntries: ['/employees'] })

    expect(await screen.findByText('Factory Employees & Tailors')).toBeInTheDocument()
    expect(screen.getByText('Wage Liabilities')).toBeInTheDocument()
    expect(screen.getByText('Sultana Begum')).toBeInTheDocument()
    expect(screen.getByText('Senior Sewing Operator')).toBeInTheDocument()
    expect(screen.getAllByText(/Piece Rate/i)[0]).toBeInTheDocument()
  })
})
