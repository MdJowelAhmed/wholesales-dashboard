import React, { useState, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Scissors } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { productionRepository } from '@/mocks/repositories/productionRepository'
import { Employee } from '@/types/employees'
import { toast } from 'sonner'
import { formatBDT, roundCurrency } from '@/lib/calculations/financialCalculations'
import { getTodayDateString } from '@/lib/utils/date'

const logWorkSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  productName: z.string().min(1, 'Garment/Product name is required'),
  size: z.string().min(1, 'Size is required'),
  unit: z.enum(['piece', 'dozen']),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  ratePerUnit: z.number().positive('Wage rate must be greater than 0'),
  notes: z.string().optional(),
})

type LogWorkFormData = z.infer<typeof logWorkSchema>

interface LogWorkerWorkDialogProps {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function LogWorkerWorkDialog({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: LogWorkerWorkDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const today = useMemo(() => getTodayDateString(), [])

  const defaultRate =
    employee.compensationMethod === 'dozen'
      ? employee.ratePerDozen || 140
      : employee.ratePerPiece || 18

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<LogWorkFormData>({
    resolver: zodResolver(logWorkSchema),
    defaultValues: {
      date: today,
      productName: "Boys' Cotton Polo Shirt",
      size: '20',
      unit: employee.compensationMethod === 'dozen' ? 'dozen' : 'piece',
      quantity: 100,
      ratePerUnit: defaultRate,
      notes: 'Daily factory work log',
    },
  })

  const watchedQuantity = useWatch({ control, name: 'quantity' }) || 0
  const watchedRate = useWatch({ control, name: 'ratePerUnit' }) || 0
  const watchedUnit = useWatch({ control, name: 'unit' }) || 'piece'

  // Dynamic live calculation
  const totalPieces = watchedUnit === 'dozen' ? watchedQuantity * 12 : watchedQuantity
  const calculatedLineTotal =
    watchedUnit === 'dozen'
      ? roundCurrency((totalPieces * watchedRate) / 12)
      : roundCurrency(totalPieces * watchedRate)

  const onSubmit = async (data: LogWorkFormData) => {
    try {
      setLoading(true)
      const pieces = data.unit === 'dozen' ? data.quantity * 12 : data.quantity

      await productionRepository.createProductionEntry({
        productionDate: data.date,
        orderCode: `WO-${data.date.replace(/-/g, '').slice(2)}`,
        productId: 'prod-001',
        productName: data.productName,
        variantId: 'var-101-18',
        sku: `${data.productName.slice(0, 3).toUpperCase()}-${data.size}`,
        size: data.size,
        employeeId: employee.id,
        employeeName: employee.name,
        inputUnit: data.unit,
        inputQuantity: data.quantity,
        applicableWageRate: data.ratePerUnit,
        goodQuantityPieces: pieces,
        damagedQuantityPieces: 0,
        notes: data.notes,
      })

      toast.success(
        `Logged ${pieces} pcs for ${employee.name} (${formatBDT(calculatedLineTotal)})`
      )
      reset()
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to record work entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            Log Daily Work / কাজের হিসাব
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground">Date / তারিখ</label>
              <Input type="date" {...register('date')} className="mt-1" />
              {errors.date && (
                <p className="text-xs text-destructive mt-1">{errors.date.message}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Size / সাইজ</label>
              <Input
                placeholder="e.g. 18, 20, 22-26"
                {...register('size')}
                className="mt-1 font-mono"
              />
              {errors.size && (
                <p className="text-xs text-destructive mt-1">{errors.size.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Garment / পণ্যের নাম</label>
            <Input
              placeholder="e.g. Boys' Cotton Polo Shirt"
              {...register('productName')}
              className="mt-1"
            />
            {errors.productName && (
              <p className="text-xs text-destructive mt-1">{errors.productName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground">Unit / একক</label>
              <select
                {...register('unit')}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="piece">Piece (পিস)</option>
                <option value="dozen">Dozen (ডজন)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Quantity / পরিমাণ</label>
              <Input
                type="number"
                {...register('quantity', { valueAsNumber: true })}
                className="mt-1 font-mono"
              />
              {errors.quantity && (
                <p className="text-xs text-destructive mt-1">{errors.quantity.message}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Rate / মজুরি দর (৳)</label>
              <Input
                type="number"
                step="0.5"
                {...register('ratePerUnit', { valueAsNumber: true })}
                className="mt-1 font-mono"
              />
              {errors.ratePerUnit && (
                <p className="text-xs text-destructive mt-1">{errors.ratePerUnit.message}</p>
              )}
            </div>
          </div>

          {/* Real-time Calculation Summary Box */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-1.5">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Equivalent Pieces (মোট পিস):</span>
              <span className="font-mono font-semibold text-foreground">{totalPieces} pcs</span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Rate applied (দর):</span>
              <span className="font-mono text-foreground">
                ৳{watchedRate}/{watchedUnit}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-border/60 pt-1.5 text-sm">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                This Entry Total / মোট আয়:
              </span>
              <span className="font-mono font-bold text-primary text-base">
                {formatBDT(calculatedLineTotal)}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Notes / মন্তব্য</label>
            <Input
              placeholder="e.g. Overlock finishing batch"
              {...register('notes')}
              className="mt-1"
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Save Work Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

