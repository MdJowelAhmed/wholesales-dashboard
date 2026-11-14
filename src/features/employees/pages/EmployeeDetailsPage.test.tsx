import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers/test-utils'
import { EmployeeDetailsPage } from './EmployeeDetailsPage'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'
import { Route, Routes } from 'react-router-dom'

describe('EmployeeDetailsPage', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  const renderComponent = (employeeId = 'emp-002') => {
    return renderWithProviders(
      <Routes>
        <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
      </Routes>,
      { initialEntries: [`/employees/${employeeId}`] }
    )
  }

  it('renders employee profile, top calculation KPI cards, and work history tab by default', async () => {
    renderComponent('emp-002')

    // Profile header
    expect(await screen.findByText(/Sultana Begum/i)).toBeInTheDocument()
    expect(screen.getByText(/EMP-OPR-04/i)).toBeInTheDocument()

    // Top calculation KPIs
    expect(screen.getByText(/Total Earned Wages \(মোট আয়\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Total Payments \(মোট নিয়েছে\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Current Balance \(অবশিষ্ট পাওনা\)/i)).toBeInTheDocument()

    // Default Work History Tab
    expect(screen.getByText(/Work History \/ কাজের বিবরণ/i)).toBeInTheDocument()
    expect(screen.getByText(/Log Daily Work \/ কাজ যোগ করুন/i)).toBeInTheDocument()

    // Table headers & footer
    expect(screen.getByText(/Date \/ তারিখ/i)).toBeInTheDocument()
    expect(screen.getByText(/Good Pieces \/ পিস/i)).toBeInTheDocument()
    expect(screen.getByText(/Total Earned \/ মোট মজুরি/i)).toBeInTheDocument()
    expect(screen.getByText(/Period Total/i)).toBeInTheDocument()
  })

  it('switches between Work History and Payment History tabs', async () => {
    renderComponent('emp-002')

    expect(await screen.findByText(/Work History \/ কাজের বিবরণ/i)).toBeInTheDocument()

    // Click on Payment History tab
    const paymentTabButton = screen.getByText(/Payment History \/ পেমেন্টের হিসাব/i)
    fireEvent.click(paymentTabButton)

    // Verification of Payment History view
    expect(await screen.findByText(/Wage Settlement Balance Breakdown \/ হিসাব নিকাশ/i)).toBeInTheDocument()
    expect(screen.getByText(/মোট আয়:/i)).toBeInTheDocument()
    expect(screen.getByText(/মোট নিয়েছে:/i)).toBeInTheDocument()
    expect(screen.getByText(/অবশিষ্ট পাওনা:/i)).toBeInTheDocument()
    expect(screen.getByText(/Voucher \/ Description/i)).toBeInTheDocument()
    expect(screen.getByText(/Amount Taken \/ গৃহীত টাকা/i)).toBeInTheDocument()
  })

  it('opens Log Daily Work, Issue Advance, and Disburse Payment dialogs on button clicks', async () => {
    renderComponent('emp-002')

    expect(await screen.findByText(/Sultana Begum/i)).toBeInTheDocument()

    // Open Log Daily Work
    const logWorkBtn = screen.getByText(/Log Daily Work/i)
    fireEvent.click(logWorkBtn)
    expect(await screen.findByText(/Log Daily Work \/ কাজের হিসাব/i)).toBeInTheDocument()
    expect(screen.getByText(/This Entry Total \/ মোট আয়:/i)).toBeInTheDocument()

    // Close dialog
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))

    // Switch to Payment History tab for advance and payment actions
    const paymentTabButton = screen.getByText(/Payment History \/ পেমেন্টের হিসাব/i)
    fireEvent.click(paymentTabButton)

    // Open Issue Advance
    const advanceBtn = screen.getByText(/Issue Advance/i)
    fireEvent.click(advanceBtn)
    expect(await screen.findByText(/Issue Cash Advance/i)).toBeInTheDocument()

    // Close advance dialog
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))

    // Open Disburse Payment
    const paymentBtn = screen.getByText(/Disburse Payment/i)
    fireEvent.click(paymentBtn)
    expect(await screen.findByText(/Disburse Wages \/ Salary/i)).toBeInTheDocument()
  })
})
