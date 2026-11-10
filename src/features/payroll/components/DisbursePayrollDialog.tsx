import React, { useState, useEffect } from 'react'
import { Banknote } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [amount, setAmount] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (target) {
      setAmount(target.remainingPayable)
      setMethod('cash')
    }
  }, [target])

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
      <DialogContent className="max-w-md bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Banknote className="h-5 w-5 text-primary" />
            Disburse Wage / Salary Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
            <div className="font-semibold text-foreground text-sm">
              {target.employeeName} ({target.designation})
            </div>
            <div className="text-muted-foreground">
              Period: {target.period} • Outstanding: {formatBDT(target.remainingPayable)}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Payment Method</label>
            <select
              aria-label="Payment method"
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="cash">Cash (নগদ বিতরণ)</option>
              <option value="bank_transfer">Bank Transfer (ব্যাংক একাউন্ট)</option>
              <option value="bkash">bKash (বিকাশ)</option>
              <option value="nagad">Nagad (নগদ)</option>
              <option value="cheque">Cheque (চেক)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Disbursement Amount (৳)</label>
            <Input
              type="number"
              min={1}
              max={target.remainingPayable}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bg-background text-sm"
            />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={submitting || amount <= 0}
            className="bg-primary text-primary-foreground"
          >
            {submitting ? 'Processing...' : 'Confirm Disbursement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

