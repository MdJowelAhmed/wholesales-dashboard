import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { productsRepository } from '@/mocks/repositories/productsRepository'
import { toast } from 'sonner'

const variantSchema = z.object({
  size: z.string().min(1, 'Size is required (e.g. 18, 20, 22)'),
  color: z.string().optional(),
  pricePerPiece: z.number().positive('Price per piece must be greater than 0'),
  costPerPiece: z.number().min(0, 'Cost cannot be negative').optional(),
  stockPieces: z.number().int().min(0, 'Stock cannot be negative'),
})

type VariantFormData = z.infer<typeof variantSchema>

interface AddVariantDialogProps {
  productId: string
  productCode: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddVariantDialog({
  productId,
  productCode,
  open,
  onOpenChange,
  onSuccess,
}: AddVariantDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      size: '20',
      color: '',
      pricePerPiece: 300,
      costPerPiece: 185,
      stockPieces: 50,
    },
  })

  const onSubmit = async (data: VariantFormData) => {
    setLoading(true)
    try {
      const sku = data.color
        ? `${productCode}-${data.size}-${data.color.toUpperCase().replace(/\s+/g, '')}`
        : `${productCode}-${data.size}`

      await productsRepository.addVariant(productId, {
        sku,
        size: data.size,
        color: data.color || undefined,
        pricePerPiece: data.pricePerPiece,
        costPerPiece: data.costPerPiece || 0,
        stockPieces: data.stockPieces,
        isActive: true,
      })

      toast.success('Variant added', {
        description: `Size ${data.size} added with per-piece price ৳${data.pricePerPiece}.`,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Failed to add variant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Garment Variant ({productCode})</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Size (e.g. 18, 20, 22) *
              </label>
              <Input placeholder="20" {...register('size')} />
              {errors.size && (
                <p className="text-[11px] text-destructive">{errors.size.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Color (Optional)
              </label>
              <Input placeholder="e.g. Navy Blue" {...register('color')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Per-Piece Price (৳) *
              </label>
              <Input
                type="number"
                step="any"
                placeholder="300"
                {...register('pricePerPiece', { valueAsNumber: true })}
              />
              {errors.pricePerPiece && (
                <p className="text-[11px] text-destructive">
                  {errors.pricePerPiece.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Cost Per Piece (৳)
              </label>
              <Input
                type="number"
                step="any"
                placeholder="185"
                {...register('costPerPiece', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Initial Stock Pieces *
            </label>
            <Input
              type="number"
              placeholder="50"
              {...register('stockPieces', { valueAsNumber: true })}
            />
            {errors.stockPieces && (
              <p className="text-[11px] text-destructive">{errors.stockPieces.message}</p>
            )}
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
              {loading ? 'Adding...' : 'Add Variant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
