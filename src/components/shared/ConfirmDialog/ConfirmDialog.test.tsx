import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders title, description and triggers onConfirm', async () => {
    const user = userEvent.setup()
    const handleConfirm = vi.fn()
    const handleOpenChange = vi.fn()

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={handleOpenChange}
        title="Delete Variant Record"
        description="Are you sure you want to remove this garment variant?"
        confirmText="Yes, Delete"
        variant="destructive"
        onConfirm={handleConfirm}
      />
    )

    expect(screen.getByText('Delete Variant Record')).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to remove/)).toBeInTheDocument()

    const confirmButton = screen.getByRole('button', { name: 'Yes, Delete' })
    await user.click(confirmButton)
    expect(handleConfirm).toHaveBeenCalledTimes(1)
  })

  it('triggers onOpenChange with false when cancel is clicked', async () => {
    const user = userEvent.setup()
    const handleConfirm = vi.fn()
    const handleOpenChange = vi.fn()

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={handleOpenChange}
        title="Reset Demo Data"
        description="Restore original database snapshot?"
        onConfirm={handleConfirm}
      />
    )

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)
    expect(handleOpenChange).toHaveBeenCalledWith(false)
  })
})
