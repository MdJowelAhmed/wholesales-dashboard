import React from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { cn } from '@/lib/utils'

interface DateDisplayProps {
  date: string | Date
  formatString?: string
  relative?: boolean
  className?: string
}

export function DateDisplay({
  date,
  formatString = 'dd MMM yyyy',
  className,
}: DateDisplayProps): React.JSX.Element {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date

  if (!isValid(parsedDate)) {
    return <span className={cn('text-muted-foreground', className)}>Invalid date</span>
  }

  const formatted = format(parsedDate, formatString)

  return (
    <time
      dateTime={parsedDate.toISOString()}
      className={cn('text-muted-foreground font-mono text-xs', className)}
    >
      {formatted}
    </time>
  )
}
