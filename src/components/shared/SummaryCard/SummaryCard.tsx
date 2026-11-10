import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SummaryCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  trend?: {
    value: string
    isPositive?: boolean
  }
  className?: string
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: SummaryCardProps): React.JSX.Element {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          {Icon && (
            <div className="h-8 w-8 rounded-md bg-secondary text-secondary-foreground flex items-center justify-center">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="text-2xl font-bold text-foreground tracking-tight">{value}</div>
          {trend && (
            <span
              className={cn(
                'text-xs font-semibold px-1.5 py-0.5 rounded',
                trend.isPositive
                  ? 'bg-status-active/15 text-status-active-foreground dark:text-status-active'
                  : 'bg-status-overdue/15 text-status-overdue-foreground dark:text-status-overdue'
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
