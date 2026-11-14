import React, { useState, useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { productsRepository } from '@/mocks/repositories/productsRepository'
import { variantsRepository } from '@/mocks/repositories/variantsRepository'
import { Product } from '@/types/products'
import { Employee } from '@/types/employees'
import { toast } from 'sonner'
import { formatBDT, calculateEmployeeWage } from '@/lib/calculations/financialCalculations'
import { getTodayDateString } from '@/lib/utils/date'
import { WorkerWorkCalculationCard } from './WorkerWorkCalculationCard'
import { WorkerWorkFormFields } from './WorkerWorkFormFields'
import { logWorkSchema, LogWorkFormData } from './workerWorkSchema'

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
  const [products, setProducts] = useState<Product[]>([])
  const [dynamicSizes, setDynamicSizes] = useState<string[]>([])
  const today = useMemo(() => getTodayDateString(), [])

  const defaultRate =
    employee.compensationMethod === 'dozen'
      ? employee.ratePerDozen || 140
      : employee.ratePerPiece || 18

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LogWorkFormData>({
    resolver: zodResolver(logWorkSchema),
    defaultValues: {
      date: today,
      productId: '',
      productName: '',
      size: '',
      unit: employee.compensationMethod === 'dozen' ? 'dozen' : 'piece',
      quantity: 100,
      ratePerUnit: defaultRate,
      notes: 'Daily factory work log',
    },
  })

  useEffect(() => {
    if (!open) return
    let mounted = true
    Promise.all([
      productsRepository.listProducts(),
      variantsRepository.listSizeNames(),
    ]).then(([prods, sizes]) => {
      if (!mounted) return
      setProducts(prods)
      setDynamicSizes(sizes)
      if (prods.length > 0) {
        setValue('productId', prods[0].id)
        setValue('productName', prods[0].name)
        const firstSize = prods[0].variants?.[0]?.size || sizes[0] || '16-20'
        setValue('size', firstSize)
      } else if (sizes.length > 0) {
        setValue('size', sizes[0])
      }
    })
    return () => {
      mounted = false
    }
  }, [open, setValue])

  const selectedProductId = useWatch({ control, name: 'productId' })
  const watchedQuantity = useWatch({ control, name: 'quantity' }) || 0
  const watchedRate = useWatch({ control, name: 'ratePerUnit' }) || 0
  const watchedUnit = useWatch({ control, name: 'unit' }) || 'piece'

  const totalPieces = watchedUnit === 'dozen' ? watchedQuantity * 12 : watchedQuantity
  const calculatedLineTotal = useMemo(() => {
    if (watchedUnit === 'dozen') {
      return calculateEmployeeWage({
        rateType: 'dozen',
        baseRate: watchedRate,
        completedDozens: watchedQuantity,
      })
    }
    return calculateEmployeeWage({
      rateType: 'piece',
      baseRate: watchedRate,
      completedPieces: watchedQuantity,
    })
  }, [watchedUnit, watchedRate, watchedQuantity])

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value
    setValue('productId', prodId)
    const found = products.find((p) => p.id === prodId)
    if (found) {
      setValue('productName', found.name)
      if (found.variants && found.variants.length > 0) {
        setValue('size', found.variants[0].size)
      }
    }
  }

  const onSubmit = async (data: LogWorkFormData) => {
    try {
      setLoading(true)
      const pieces = data.unit === 'dozen' ? data.quantity * 12 : data.quantity
      const prod = products.find((p) => p.id === data.productId)
      const variant = prod?.variants?.find((v) => v.size === data.size) || prod?.variants?.[0]

      await productionRepository.createProductionEntry({
        productionDate: data.date,
        orderCode: `WO-${data.date.replace(/-/g, '').slice(2)}`,
        productId: data.productId || prod?.id || 'prod-001',
        productName: data.productName,
        variantId: variant?.id || 'var-101-18',
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
          <WorkerWorkFormFields
            register={register}
            errors={errors}
            products={products}
            dynamicSizes={dynamicSizes}
            selectedProductId={selectedProductId}
            onProductSelect={handleProductSelect}
          />

          <WorkerWorkCalculationCard
            totalPieces={totalPieces}
            rate={watchedRate}
            unit={watchedUnit}
            lineTotal={calculatedLineTotal}
          />

          <div>
            <label className="text-xs font-medium text-foreground">Notes / মন্তব্য</label>
            <Input placeholder="e.g. Overlock finishing batch" {...register('notes')} className="mt-1" />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
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
