import React from 'react'
import { Printer } from 'lucide-react'
import { Button, ButtonProps } from '@/components/ui/button'

interface PrintButtonProps extends Omit<ButtonProps, 'onClick'> {
  label?: string
  onBeforePrint?: () => void
}

export function PrintButton({
  label = 'Print Statement / Invoice',
  variant = 'outline',
  size = 'sm',
  onBeforePrint,
  ...props
}: PrintButtonProps): React.JSX.Element {
  const handlePrint = () => {
    if (onBeforePrint) onBeforePrint()
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handlePrint}
      {...props}
    >
      <Printer className="h-4 w-4 mr-2" />
      {label}
    </Button>
  )
}
