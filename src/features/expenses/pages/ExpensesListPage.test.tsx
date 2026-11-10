import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ExpensesListPage } from './ExpensesListPage'

describe('ExpensesListPage', () => {
  it('renders expenses list, overhead metrics and vouchers', async () => {
    render(<ExpensesListPage />)

    expect(screen.getByText(/Factory & Operational Expenses/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Total Factory Overheads/i)).toBeInTheDocument()
      expect(screen.getByText(/Power & Electricity/i)).toBeInTheDocument()
      expect(screen.getByText(/Logistics & Transport/i)).toBeInTheDocument()
    })
  })

  it('filters expenses by search keyword', async () => {
    render(<ExpensesListPage />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by voucher #/i)).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Search by voucher #/i)
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_EXP_XYZ' } })

    expect(
      screen.getByText(/No expense records found matching criteria/i)
    ).toBeInTheDocument()
  })

  it('opens Log Expense dialog on button click', async () => {
    render(<ExpensesListPage />)

    const logBtn = screen.getByRole('button', { name: /Log Expense Voucher/i })
    fireEvent.click(logBtn)

    await waitFor(() => {
      expect(screen.getByText(/Record Factory Expense Voucher/i)).toBeInTheDocument()
      expect(screen.getByText(/Expense Title \/ Description \*/i)).toBeInTheDocument()
    })
  })
})
