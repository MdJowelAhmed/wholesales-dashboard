import React from 'react'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { cn } from '@/lib/utils'

interface CurrencyDisplayProps {
  amount: number
  className?: string
  showPositiveSign?: boolean
  highlightZero?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function CurrencyDisplay({
  amount,
  className,
  showPositiveSign = false,
  size = 'md',
}: CurrencyDisplayProps): React.JSX.Element {
  const formatted = formatBDT(Math.abs(amount))
  const isNegative = amount < 0
  const isPositive = amount > 0

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm font-medium',
    lg: 'text-lg font-semibold',
    xl: 'text-2xl font-bold tracking-tight',
  }[size]

  return (
    <span
      className={cn(
        'font-mono tabular-nums tracking-tight text-foreground',
        sizeClasses,
        isNegative && 'text-destructive',
        className
      )}
    >
      {isNegative && '-'}
      {showPositiveSign && isPositive && '+'}
      {formatted}
    </span>
  )
}
