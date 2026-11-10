import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Factory } from 'lucide-react'
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
import { toast } from 'sonner'

const orderSchema = z.object({
  productId: z.string().min(1, 'Select a finished garment model'),
  targetQuantityPieces: z.number().int().positive('Target must be at least 1 piece'),
  startDate: z.string().min(1, 'Start date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
})

type OrderFormData = z.infer<typeof orderSchema>

interface CreateProductionOrderDialogProps {
  products: Product[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateProductionOrderDialog({
  products,
  open,
  onOpenChange,
  onSuccess,
}: CreateProductionOrderDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  const defaultProduct = products[0]

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      productId: defaultProduct?.id || '',
      targetQuantityPieces: 500,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    },
  })

  const onSubmit = async (data: OrderFormData) => {
    setLoading(true)
    try {
      const prod = products.find((p) => p.id === data.productId)
      const productName = prod ? prod.name : 'Garment Model'

      await productionRepository.createProductionOrder({
        productId: data.productId,
        productName,
        targetQuantityPieces: data.targetQuantityPieces,
        startDate: data.startDate,
        dueDate: data.dueDate,
      })

      toast.success('Production order created', {
        description: `Target ${data.targetQuantityPieces} pieces scheduled for ${productName}.`,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Failed to create production order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-primary" />
            New Cutting & Production Order
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Garment Model / Product *
            </label>
            <select
              {...register('productId')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-[11px] text-destructive">{errors.productId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Target Quantity (Pieces) *
            </label>
            <Input
              type="number"
              placeholder="500"
              {...register('targetQuantityPieces', { valueAsNumber: true })}
            />
            {errors.targetQuantityPieces && (
              <p className="text-[11px] text-destructive">
                {errors.targetQuantityPieces.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Start Date *</label>
              <Input type="date" {...register('startDate')} />
              {errors.startDate && (
                <p className="text-[11px] text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Delivery / Due Date *</label>
              <Input type="date" {...register('dueDate')} />
              {errors.dueDate && (
                <p className="text-[11px] text-destructive">{errors.dueDate.message}</p>
              )}
            </div>
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
              {loading ? 'Scheduling...' : 'Create Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
