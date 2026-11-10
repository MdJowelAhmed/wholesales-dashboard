import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground border-border',
        // Centralized semantic status variants
        paid: 'border-status-paid-border bg-status-paid/15 text-status-paid-foreground dark:text-status-paid',
        pending: 'border-status-pending-border bg-status-pending/15 text-status-pending-foreground dark:text-status-pending',
        overdue: 'border-status-overdue-border bg-status-overdue/15 text-status-overdue-foreground dark:text-status-overdue',
        active: 'border-status-active-border bg-status-active/15 text-status-active-foreground dark:text-status-active',
        inactive: 'border-status-inactive-border bg-status-inactive/15 text-status-inactive-foreground dark:text-status-inactive',
        approved: 'border-status-approved-border bg-status-approved/15 text-status-approved-foreground dark:text-status-approved',
        rejected: 'border-status-rejected-border bg-status-rejected/15 text-status-rejected-foreground dark:text-status-rejected',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
