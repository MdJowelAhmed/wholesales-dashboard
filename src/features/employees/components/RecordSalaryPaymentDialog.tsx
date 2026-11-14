import type { ReactElement } from 'react'
import { RecordUnifiedPaymentDialog } from '@/features/payments/components/RecordUnifiedPaymentDialog'

interface RecordSalaryPaymentDialogProps {
  employeeId: string
  employeeName: string
  currentPayableBalance: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RecordSalaryPaymentDialog({
  employeeId,
  employeeName,
  currentPayableBalance,
  open,
  onOpenChange,
  onSuccess,
}: RecordSalaryPaymentDialogProps): ReactElement {
  return (
    <RecordUnifiedPaymentDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      presetPartyType="employee"
      presetPartyId={employeeId}
      lockParty
      lockedPartyLabel={employeeName}
      dialogTitle="Disburse Wages / Salary"
      defaultAmount={currentPayableBalance > 0 ? currentPayableBalance : 5000}
      defaultNotes="Wage disbursement settlement"
    />
  )
}