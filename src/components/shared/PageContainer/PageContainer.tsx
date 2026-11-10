import React from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export function PageContainer({
  children,
  maxWidth = 'full',
  className,
  ...props
}: PageContainerProps): React.JSX.Element {
  const maxWidthClass = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  }[maxWidth]

  return (
    <div
      className={cn('w-full mx-auto space-y-6', maxWidthClass, className)}
      {...props}
    >
      {children}
    </div>
  )
}
