import React from 'react'
import { Badge } from '@/components/ui/badge'

export type StandardStatus =
  | 'paid'
  | 'pending'
  | 'overdue'
  | 'active'
  | 'inactive'
  | 'approved'
  | 'rejected'
  | 'partial'

interface StatusBadgeProps {
  status: StandardStatus | string
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps): React.JSX.Element {
  const normalized = status.toLowerCase()

  switch (normalized) {
    case 'paid':
      return <Badge variant="paid" className={className}>{label || 'Paid'}</Badge>
    case 'pending':
    case 'in_progress':
    case 'pending_inspection':
      return <Badge variant="pending" className={className}>{label || 'Pending'}</Badge>
    case 'partial':
      return <Badge variant="pending" className={className}>{label || 'Partial'}</Badge>
    case 'overdue':
      return <Badge variant="overdue" className={className}>{label || 'Overdue'}</Badge>
    case 'active':
    case 'completed':
      return <Badge variant="active" className={className}>{label || 'Active'}</Badge>
    case 'inactive':
    case 'cancelled':
      return <Badge variant="inactive" className={className}>{label || 'Inactive'}</Badge>
    case 'approved':
      return <Badge variant="approved" className={className}>{label || 'Approved'}</Badge>
    case 'rejected':
      return <Badge variant="rejected" className={className}>{label || 'Rejected'}</Badge>
    default:
      return <Badge variant="outline" className={className}>{label || status}</Badge>
  }
}
