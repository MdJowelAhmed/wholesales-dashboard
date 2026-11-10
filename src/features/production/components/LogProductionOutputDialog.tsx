import React, { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Scissors } from 'lucide-react'
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
import { Product } from '@/types/products'
import { Employee } from '@/types/employees'
import { ProductionOrder } from '@/types/production'
import { formatBDT, calculateEmployeeWage } from '@/lib/calculations/financialCalculations'
import { toast } from 'sonner'

const entrySchema = z.object({
  productionDate: z.string().min(1, 'Production date is required'),
  orderCode: z.string().min(1, 'Select a production order'),
  productId: z.string().min(1, 'Select a product'),
  variantId: z.string().min(1, 'Select a size variant'),
  employeeId: z.string().min(1, 'Select an operator/tailor'),
  inputUnit: z.enum(['piece', 'dozen']),
  inputQuantity: z.number().int().positive('Quantity must be at least 1'),
  applicableWageRate: z.number().positive('Wage rate must be greater than 0'),
  goodQuantityPieces: z.number().int().min(0, 'Good pieces cannot be negative'),
  damagedQuantityPieces: z.number().int().min(0, 'Damaged pieces cannot be negative'),
  notes: z.string().optional(),
})

type EntryFormData = z.infer<typeof entrySchema>

interface LogProductionOutputDialogProps {
  orders: ProductionOrder[]
  products: Product[]
  employees: Employee[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function LogProductionOutputDialog({
  orders,
  products,
  employees,
  open,
  onOpenChange,
  onSuccess,
}: LogProductionOutputDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  const defaultOrder = orders[0]
  const defaultProduct = products.find((p) => p.id === defaultOrder?.productId) || products[0]
  const defaultVariant = defaultProduct?.variants[0]
  const defaultEmployee = employees[0]

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      productionDate: new Date().toISOString().split('T')[0],
      orderCode: defaultOrder?.orderCode || 'PO-2026-BPS',
      productId: defaultProduct?.id || '',
      variantId: defaultVariant?.id || '',
      employeeId: defaultEmployee?.id || '',
      inputUnit: 'piece',
      inputQuantity: 60,
      applicableWageRate: defaultEmployee?.ratePerPiece || 18,
      goodQuantityPieces: 60,
      damagedQuantityPieces: 0,
      notes: 'Completed standard sewing batch',
    },
  })

  const selectedProductId = useWatch({ control, name: 'productId' })
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0]
  const inputUnit = useWatch({ control, name: 'inputUnit' })
  const inputQuantity = useWatch({ control, name: 'inputQuantity' }) || 0
  const applicableWageRate = useWatch({ control, name: 'applicableWageRate' }) || 0
  const goodPieces = useWatch({ control, name: 'goodQuantityPieces' }) || 0

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value
    setValue('productId', prodId)
    const prod = products.find((p) => p.id === prodId)
    if (prod && prod.variants.length > 0) {
      setValue('variantId', prod.variants[0].id)
    }
  }

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const empId = e.target.value
    setValue('employeeId', empId)
    const emp = employees.find((em) => em.id === empId)
    if (emp) {
      if (inputUnit === 'dozen' && emp.ratePerDozen) {
        setValue('applicableWageRate', emp.ratePerDozen)
      } else if (emp.ratePerPiece) {
        setValue('applicableWageRate', emp.ratePerPiece)
      }
    }
  }

  const totalCalculatedPieces = inputUnit === 'dozen' ? inputQuantity * 12 : inputQuantity
  const estimatedWage =
    inputUnit === 'dozen'
      ? calculateEmployeeWage({
          rateType: 'dozen',
          baseRate: applicableWageRate,
          completedPieces: totalCalculatedPieces,
        })
      : calculateEmployeeWage({
          rateType: 'piece',
          baseRate: applicableWageRate,
          completedPieces: goodPieces,
        })

  const onSubmit = async (data: EntryFormData) => {
    setLoading(true)
    try {
      const prod = products.find((p) => p.id === data.productId)
      const variant = prod?.variants.find((v) => v.id === data.variantId)
      const emp = employees.find((e) => e.id === data.employeeId)

      await productionRepository.createProductionEntry({
        productionDate: data.productionDate,
        orderCode: data.orderCode,
        productId: data.productId,
        productName: prod ? prod.name : 'Finished Garment',
        variantId: data.variantId,
        sku: variant?.sku || `${prod?.code}-${variant?.size}`,
        size: variant?.size || '18',
        employeeId: data.employeeId,
        employeeName: emp ? emp.name : 'Sewing Operator',
        inputUnit: data.inputUnit,
        inputQuantity: data.inputQuantity,
        applicableWageRate: data.applicableWageRate,
        goodQuantityPieces: data.goodQuantityPieces,
        damagedQuantityPieces: data.damagedQuantityPieces,
        notes: data.notes,
      })

      toast.success('Production output logged', {
        description: `Logged ${data.goodQuantityPieces} finished pieces. Wage earned: ${formatBDT(
          estimatedWage
        )}.`,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Failed to log production output')
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
            Log Daily Output & Tailor Wages
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Date *</label>
              <Input type="date" {...register('productionDate')} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Production Order *
              </label>
              <select
                {...register('orderCode')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.orderCode}>
                    {o.orderCode} ({o.productName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Garment Model *</label>
              <select
                value={selectedProductId}
                onChange={handleProductChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Size Variant *</label>
              <select
                {...register('variantId')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {selectedProduct?.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    Size {v.size} {v.color ? `(${v.color})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Tailor / Operator *
              </label>
              <select
                onChange={handleEmployeeChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.designation})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Input Unit *</label>
              <select
                {...register('inputUnit')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="piece">Per Piece</option>
                <option value="dozen">Per Dozen (12 pcs)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Input Qty ({inputUnit}) *
              </label>
              <Input
                type="number"
                placeholder="60"
                {...register('inputQuantity', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Good Pieces *</label>
              <Input
                type="number"
                placeholder="60"
                {...register('goodQuantityPieces', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Damaged / Reject</label>
              <Input
                type="number"
                placeholder="0"
                {...register('damagedQuantityPieces', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Applicable Wage Rate (৳ / {inputUnit}) *
            </label>
            <Input
              type="number"
              step="any"
              placeholder="18"
              {...register('applicableWageRate', { valueAsNumber: true })}
            />
          </div>

          {/* Wage calculation live summary */}
          <div className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">
              Calculated Wage (Good Output):
            </span>
            <span className="font-bold font-mono text-primary text-sm">
              {formatBDT(estimatedWage)}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Notes / Batch Remarks</label>
            <Input placeholder="Batch notes, machine #, QC remarks" {...register('notes')} />
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
              {loading ? 'Logging...' : 'Confirm Output'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
