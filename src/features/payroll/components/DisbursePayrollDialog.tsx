import React, { useState } from 'react'
import { Banknote } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PayrollRecord } from '@/types/finance'
import { PaymentMethod } from '@/types/common'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface DisbursePayrollDialogProps {
  target: PayrollRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (targetId: string, method: PaymentMethod, amount: number) => Promise<void>
}

export function DisbursePayrollDialog({
  target,
  open,
  onOpenChange,
  onConfirm,
}: DisbursePayrollDialogProps): React.JSX.Element | null {
  const [prevTargetId, setPrevTargetId] = useState<string | null>(null)
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [amount, setAmount] = useState<number>(target?.remainingPayable ?? 0)
  const [submitting, setSubmitting] = useState(false)

  if (target && target.id !== prevTargetId) {
    setPrevTargetId(target.id)
    setAmount(target.remainingPayable)
    setMethod('cash')
  }

  if (!target) return null

  const handleConfirm = async () => {
    if (amount <= 0) return
    try {
      setSubmitting(true)
      await onConfirm(target.id, method, amount)
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            Disburse Wages & Salary
          </DialogTitle>
          <DialogDescription>
            Release wage disbursement to {target.employeeName} ({target.designation}) for period{' '}
            {target.period}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="rounded-lg bg-muted/40 p-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Earned Wages:</span>
              <span className="font-mono font-medium">
                {formatBDT(target.netPayable + (target.advancesDeducted || 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Advances Recovered:</span>
              <span className="font-mono font-medium text-rose-500">
                -{formatBDT(target.advancesDeducted || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Already Paid:</span>
              <span className="font-mono font-medium text-emerald-500">
                {formatBDT(target.paidAmount)}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border font-bold">
              <span>Outstanding Payable:</span>
              <span className="font-mono text-primary">
                {formatBDT(target.remainingPayable)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Disbursement Amount (BDT) *</label>
            <Input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              max={target.remainingPayable}
              min={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Payment Channel *</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="cash">Cash in Hand</option>
              <option value="bkash">bKash Payroll</option>
              <option value="nagad">Nagad Wallet</option>
              <option value="bank_transfer">BEFTN / Bank Transfer</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={submitting || amount <= 0}>
            {submitting ? 'Disbursing...' : `Disburse ${formatBDT(amount || 0)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
