import type { ReactElement } from 'react'
import {
  RecordUnifiedPaymentDialog,
  RecordUnifiedPaymentDialogProps,
} from '@/features/payments/components/RecordUnifiedPaymentDialog'

interface RecordShopkeeperPaymentDialogProps
  extends Pick<RecordUnifiedPaymentDialogProps, 'open' | 'onOpenChange' | 'onSuccess'> {
  shopkeeperId: string
  shopName: string
  outstandingBalance: number
}

export function RecordShopkeeperPaymentDialog({
  shopkeeperId,
  shopName,
  outstandingBalance,
  open,
  onOpenChange,
  onSuccess,
}: RecordShopkeeperPaymentDialogProps): ReactElement {
  return (
    <RecordUnifiedPaymentDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      presetPartyType="shopkeeper"
      presetPartyId={shopkeeperId}
      lockParty
      lockedPartyLabel={shopName}
      dialogTitle="Record Shopkeeper Payment"
      defaultAmount={outstandingBalance > 0 ? outstandingBalance : 5000}
      defaultNotes="Wholesale collection"
    />
  )
}