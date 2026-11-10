import React from 'react'
import { FolderSearch, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function EmptyState({
  title = 'No records found',
  description = 'Try adjusting your search or filters to find what you are looking for.',
  actionLabel,
  onAction,
  icon: Icon = FolderSearch,
  className,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-lg bg-card/50',
        className
      )}
    >
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({
  message = 'Loading data...',
  className,
}: LoadingStateProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-muted-foreground',
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Failed to load data from repository. Please try again.',
  onRetry,
  className,
}: ErrorStateProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 border border-destructive/20 bg-destructive/5 rounded-lg text-foreground',
        className
      )}
    >
      <div className="h-12 w-12 rounded-full bg-destructive/15 text-destructive flex items-center justify-center mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 border-destructive/30 hover:bg-destructive/10"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Retry
        </Button>
      )}
    </div>
  )
}

export function TableSkeleton({
  rows = 5,
  cols = 5,
  className,
}: {
  rows?: number
  cols?: number
  className?: string
}): React.JSX.Element {
  return (
    <div className={cn('space-y-3 p-4 border border-border rounded-lg bg-card', className)}>
      <div className="flex gap-4 border-b border-border pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`head-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`row-${r}`} className="flex gap-4 py-2 border-b border-border/50 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={`cell-${r}-${c}`} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardGridSkeleton({
  count = 4,
  className,
}: {
  count?: number
  className?: string
}): React.JSX.Element {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={`card-${i}`} className="p-5 border border-border rounded-lg bg-card space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  )
}
