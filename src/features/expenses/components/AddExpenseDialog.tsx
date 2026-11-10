import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Receipt } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { financeRepository } from '@/mocks/repositories/financeRepository'
import { toast } from 'sonner'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { getTodayDateString } from '@/lib/utils'

const expenseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  title: z.string().min(3, 'Expense title is required'),
  category: z.enum([
    'rent',
    'electricity',
    'transport',
    'packaging',
    'maintenance',
    'food_entertainment',
    'other',
  ]),
  amount: z.number().positive('Amount must be greater than zero'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'cheque', 'bkash', 'nagad']),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddExpenseDialogProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: getTodayDateString(),
      title: 'Transport Van Hire to Islampur',
      category: 'transport',
      amount: 3500,
      paymentMethod: 'cash',
      reference: 'VCH-2026-101',
      notes: 'Carried 15 cartons of boys polo shirts',
    },
  })

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      setLoading(true)
      const exp = await financeRepository.createExpense({
        date: data.date,
        title: data.title,
        category: data.category,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        notes: data.notes,
      })
      toast.success(`Recorded expense: ${exp.expenseNumber} (${formatBDT(exp.amount)})`)
      reset()
      onOpenChange(false)
      onSuccess()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record expense'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Receipt className="h-5 w-5 text-primary" />
            Record Factory Expense Voucher
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Expense Title / Description *</label>
            <Input
              type="text"
              placeholder="e.g. DESCO Electricity Bill / Sewing Machine Needle Set"
              {...register('title')}
              className="bg-background"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Category *</label>
              <select
                {...register('category')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="rent">Factory / Shop Rent</option>
                <option value="electricity">DESCO Power & Utilities</option>
                <option value="transport">Van & Courier Transport</option>
                <option value="packaging">Packaging Cartons & Poly</option>
                <option value="maintenance">Sewing Machine Repairs</option>
                <option value="food_entertainment">Worker Refreshment</option>
                <option value="other">Miscellaneous Expense</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Amount (৳ BDT) *</label>
              <Input
                type="number"
                step="0.01"
                min={1}
                {...register('amount', { valueAsNumber: true })}
                className="bg-background"
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Payment Date *</label>
              <Input type="date" {...register('date')} className="bg-background" />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Payment Method *</label>
              <select
                {...register('paymentMethod')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="cash">Cash (নগদ)</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="bkash">bKash (বিকাশ)</option>
                <option value="nagad">Nagad (নগদ)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Reference / Receipt Bill #</label>
            <Input
              type="text"
              placeholder="e.g. Meter # 88219 / Courier Memo # 440"
              {...register('reference')}
              className="bg-background"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Auditing Remarks</label>
            <Input
              type="text"
              placeholder="e.g. Approved by Factory Manager"
              {...register('notes')}
              className="bg-background"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
              {loading ? 'Saving...' : 'Record Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
