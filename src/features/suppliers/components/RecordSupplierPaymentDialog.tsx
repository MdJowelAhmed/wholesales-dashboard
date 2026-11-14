import type { ReactElement } from 'react'
import { RecordUnifiedPaymentDialog } from '@/features/payments/components/RecordUnifiedPaymentDialog'

interface RecordSupplierPaymentDialogProps {
  supplierId: string
  supplierName: string
  outstandingPayable: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RecordSupplierPaymentDialog({
  supplierId,
  supplierName,
  outstandingPayable,
  open,
  onOpenChange,
  onSuccess,
}: RecordSupplierPaymentDialogProps): ReactElement {
  return (
    <RecordUnifiedPaymentDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      presetPartyType="supplier"
      presetPartyId={supplierId}
      lockParty
      lockedPartyLabel={supplierName}
      dialogTitle="Pay Supplier"
      defaultAmount={outstandingPayable > 0 ? outstandingPayable : 5000}
      defaultNotes="Fabric / material supplier settlement"
    />
  )
}