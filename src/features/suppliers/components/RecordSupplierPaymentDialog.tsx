import React, { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { suppliersRepository } from '@/mocks/repositories/suppliersRepository'
import { toast } from 'sonner'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { getTodayDateString } from '@/lib/utils/date'

const paymentSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.number().positive('Payment amount must be greater than 0'),
  paymentMethod: z.enum(['bank_transfer', 'cash', 'cheque', 'bkash', 'nagad']),
  reference: z.string().min(2, 'Reference / Cheque / Bank Txn ID is required'),
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

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
}: RecordSupplierPaymentDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const today = useMemo(() => getTodayDateString(), [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      date: today,
      amount: outstandingPayable > 0 ? outstandingPayable : 50000,
      paymentMethod: 'bank_transfer',
      reference: 'DBBL-TXN-',
      notes: '',
    },
  })

  const onSubmit = async (data: PaymentFormData) => {
    setLoading(true)
    try {
      await suppliersRepository.recordPayment({
        supplierId,
        date: data.date,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        notes: data.notes,
      })
      toast.success('Supplier payment recorded', {
        description: `Disbursed ${formatBDT(data.amount)} to ${supplierName}.`,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Failed to record supplier payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Record Supplier Payment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
          <div className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Outstanding Payable:</span>
            <span className="font-bold font-mono text-destructive">
              {formatBDT(outstandingPayable)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Payment Date *</label>
              <Input type="date" {...register('date')} />
              {errors.date && (
                <p className="text-[11px] text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Amount (৳) *</label>
              <Input
                type="number"
                step="any"
                placeholder="50000"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-[11px] text-destructive">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Payment Method *
              </label>
              <select
                {...register('paymentMethod')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="bank_transfer">Bank Transfer (DBBL/City)</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="bkash">bKash Merchant</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Reference / Txn ID *
              </label>
              <Input placeholder="e.g. DBBL-9921 / CHQ-104" {...register('reference')} />
              {errors.reference && (
                <p className="text-[11px] text-destructive">{errors.reference.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Notes / Remarks</label>
            <Input placeholder="Payment against yarn consignment..." {...register('notes')} />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Disburse Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
