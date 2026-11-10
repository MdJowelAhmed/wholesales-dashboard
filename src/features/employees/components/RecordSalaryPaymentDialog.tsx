import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { employeesRepository } from '@/mocks/repositories/employeesRepository'
import { toast } from 'sonner'
import { formatBDT } from '@/lib/calculations/financialCalculations'

const paymentSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.number().positive('Payment amount must be greater than 0'),
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

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
}: RecordSalaryPaymentDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      amount: currentPayableBalance > 0 ? currentPayableBalance : 5000,
      notes: 'Wage disbursement settlement',
    },
  })

  const onSubmit = async (data: PaymentFormData) => {
    setLoading(true)
    try {
      await employeesRepository.recordSalaryPayment({
        employeeId,
        date: data.date,
        amount: data.amount,
        notes: data.notes,
      })
      toast.success('Salary/wage payment recorded', {
        description: `Disbursed ${formatBDT(data.amount)} to ${employeeName}.`,
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
            <Banknote className="h-5 w-5 text-primary" />
            Disburse Wage / Salary ({employeeName})
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
          <div className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Current Payable Liability:</span>
            <span className="font-bold font-mono text-foreground">
              {formatBDT(currentPayableBalance)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Disbursement Date *</label>
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
                placeholder="5000"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-[11px] text-destructive">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Voucher / Notes</label>
            <Input placeholder="Cash payroll voucher #..." {...register('notes')} />
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
              {loading ? 'Disbursing...' : 'Disburse Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
