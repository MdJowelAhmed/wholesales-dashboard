import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  EmptyState,
  LoadingState,
  ErrorState,
  TableSkeleton,
  CardGridSkeleton,
} from './StateFeedbacks'

describe('StateFeedbacks', () => {
  it('renders EmptyState and triggers onAction callback', async () => {
    const user = userEvent.setup()
    const handleAction = vi.fn()

    render(
      <EmptyState
        title="No Products Found"
        description="Try searching for another model."
        actionLabel="Add First Product"
        onAction={handleAction}
      />
    )

    expect(screen.getByText('No Products Found')).toBeInTheDocument()
    expect(screen.getByText('Try searching for another model.')).toBeInTheDocument()

    const button = screen.getByRole('button', { name: 'Add First Product' })
    await user.click(button)
    expect(handleAction).toHaveBeenCalledTimes(1)
  })

  it('renders LoadingState with message', () => {
    render(<LoadingState message="Fetching factory production lines..." />)
    expect(screen.getByText('Fetching factory production lines...')).toBeInTheDocument()
  })

  it('renders ErrorState and triggers retry', async () => {
    const user = userEvent.setup()
    const handleRetry = vi.fn()

    render(
      <ErrorState
        title="Network Disconnected"
        message="Could not read mock repository."
        onRetry={handleRetry}
      />
    )

    expect(screen.getByText('Network Disconnected')).toBeInTheDocument()
    const retryBtn = screen.getByRole('button', { name: /Retry/i })
    await user.click(retryBtn)
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })

  it('renders TableSkeleton and CardGridSkeleton without throwing', () => {
    const { container: tableContainer } = render(<TableSkeleton rows={3} cols={4} />)
    expect(tableContainer.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)

    const { container: cardsContainer } = render(<CardGridSkeleton count={4} />)
    expect(cardsContainer.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })
})
