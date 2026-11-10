import React, { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DollarSign } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { shopkeepersRepository } from '@/mocks/repositories/shopkeepersRepository'
import { toast } from 'sonner'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { getTodayDateString } from '@/lib/utils'

const paymentSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  paymentMethod: z.enum(['bank_transfer', 'cash', 'cheque', 'bkash', 'nagad']),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface RecordShopkeeperPaymentDialogProps {
  shopkeeperId: string
  shopName: string
  outstandingBalance: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RecordShopkeeperPaymentDialog({
  shopkeeperId,
  shopName,
  outstandingBalance,
  open,
  onOpenChange,
  onSuccess,
}: RecordShopkeeperPaymentDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  const defaultValues = useMemo<PaymentFormData>(
    () => ({
      date: getTodayDateString(),
      amount: outstandingBalance > 0 ? outstandingBalance : 20000,
      paymentMethod: 'cash',
      reference: 'CR-',
      notes: 'Collected at wholesale shop',
    }),
    [outstandingBalance]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues,
  })

  const onSubmit = async (data: PaymentFormData) => {
    setLoading(true)
    try {
      await shopkeepersRepository.recordPayment({
        shopkeeperId,
        date: data.date,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        notes: data.notes,
      })

      toast.success('Payment recorded', {
        description: `Received ${formatBDT(data.amount)} from ${shopName}.`,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Receive Payment ({shopName})
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
          <div className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Outstanding Balance:</span>
            <span className="font-bold font-mono text-primary text-sm">
              {formatBDT(outstandingBalance)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Date *</label>
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
                placeholder="20000"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-[11px] text-destructive">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Payment Method *</label>
              <select
                {...register('paymentMethod')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="cash">Cash (Shop collection)</option>
                <option value="bank_transfer">Bank Transfer (IBBL/City)</option>
                <option value="cheque">Cheque</option>
                <option value="bkash">bKash Merchant</option>
                <option value="nagad">Nagad</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Receipt / Ref No.
              </label>
              <Input placeholder="CR-501 / IBBL-99" {...register('reference')} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Notes</label>
            <Input placeholder="Collected by field representative..." {...register('notes')} />
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
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
