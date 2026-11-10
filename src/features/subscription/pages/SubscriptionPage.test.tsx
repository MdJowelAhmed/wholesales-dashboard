import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SubscriptionPage } from './SubscriptionPage'

describe('SubscriptionPage', () => {
  it('renders SaaS subscription tiers, resource quotas, and billing vouchers', () => {
    render(<SubscriptionPage />)

    expect(screen.getByText(/SaaS Subscription & Plans/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Enterprise Wholesale/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Active Factory Resource Quotas/i)).toBeInTheDocument()

    // Plan tiers
    expect(screen.getByText(/Starter Workshop/i)).toBeInTheDocument()
    expect(screen.getByText(/Factory Growth/i)).toBeInTheDocument()

    // Billing history
    expect(screen.getByText(/Subscription Billing History/i)).toBeInTheDocument()
    expect(screen.getByText(/SUB-2026-10/i)).toBeInTheDocument()
  })
})
