import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { PayrollListPage } from './PayrollListPage'

describe('PayrollListPage', () => {
  it('renders payroll records, gross earnings, and pay slip vouchers', async () => {
    render(<PayrollListPage />)

    expect(screen.getByText(/Worker Payroll & Wages/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Total Payroll Bill/i)).toBeInTheDocument()
      expect(screen.getByText(/Total Paid Wages/i)).toBeInTheDocument()
      expect(screen.getByText(/Wage Liabilities Due/i)).toBeInTheDocument()
    })
  })

  it('filters payroll by search keyword', async () => {
    render(<PayrollListPage />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by worker name/i)).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Search by worker name/i)
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_WORKER_XYZ' } })

    expect(
      screen.getByText(/No payroll records found/i)
    ).toBeInTheDocument()
  })

  it('triggers generate monthly payroll on button click', async () => {
    render(<PayrollListPage />)

    const genBtn = screen.getByRole('button', { name: /Generate Monthly Payroll/i })
    expect(genBtn).toBeInTheDocument()
    fireEvent.click(genBtn)

    await waitFor(() => {
      expect(screen.getByText(/Total Payroll Bill/i)).toBeInTheDocument()
    })
  })
})
