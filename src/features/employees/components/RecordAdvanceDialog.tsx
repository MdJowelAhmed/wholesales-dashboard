import React, { useState } from 'react'
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
import { employeesRepository } from '@/mocks/repositories/employeesRepository'
import { toast } from 'sonner'
import { formatBDT } from '@/lib/calculations/financialCalculations'

const advanceSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.number().positive('Advance amount must be greater than 0'),
  notes: z.string().optional(),
})

type AdvanceFormData = z.infer<typeof advanceSchema>

interface RecordAdvanceDialogProps {
  employeeId: string
  employeeName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RecordAdvanceDialog({
  employeeId,
  employeeName,
  open,
  onOpenChange,
  onSuccess,
}: RecordAdvanceDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdvanceFormData>({
    resolver: zodResolver(advanceSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      amount: 2000,
      notes: 'Emergency cash advance',
    },
  })

  const onSubmit = async (data: AdvanceFormData) => {
    setLoading(true)
    try {
      await employeesRepository.recordAdvance({
        employeeId,
        date: data.date,
        amount: data.amount,
        notes: data.notes,
      })
      toast.success('Advance issued', {
        description: `Disbursed ${formatBDT(data.amount)} advance to ${employeeName}.`,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Failed to issue advance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Issue Cash Advance ({employeeName})
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Date *</label>
            <Input type="date" {...register('date')} />
            {errors.date && (
              <p className="text-[11px] text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Advance Amount (৳) *
            </label>
            <Input type="number" step="any" placeholder="2000" {...register('amount', { valueAsNumber: true })} />
            {errors.amount && (
              <p className="text-[11px] text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Purpose / Reason</label>
            <Input placeholder="Medical, festive, etc." {...register('notes')} />
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
              {loading ? 'Processing...' : 'Disburse Advance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
