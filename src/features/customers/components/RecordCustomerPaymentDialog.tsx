import type { ReactElement } from 'react'
import { RecordUnifiedPaymentDialog } from '@/features/payments/components/RecordUnifiedPaymentDialog'

interface RecordCustomerPaymentDialogProps {
  customerId: string
  customerName: string
  outstandingBalance: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RecordCustomerPaymentDialog({
  customerId,
  customerName,
  outstandingBalance,
  open,
  onOpenChange,
  onSuccess,
}: RecordCustomerPaymentDialogProps): ReactElement {
  return (
    <RecordUnifiedPaymentDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      presetPartyType="customer"
      presetPartyId={customerId}
      lockParty
      lockedPartyLabel={customerName}
      dialogTitle="Record Customer Payment"
      defaultAmount={outstandingBalance > 0 ? outstandingBalance : 1000}
      defaultNotes="Retail collection"
    />
  )
}