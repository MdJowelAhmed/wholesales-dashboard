import React, { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sliders } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { inventoryRepository } from '@/mocks/repositories/inventoryRepository'
import { FinishedGoodsStockItem } from '@/types/inventory'
import { RawMaterial } from '@/types/rawMaterials'
import { toast } from 'sonner'

const adjustSchema = z.object({
  targetType: z.enum(['finished_goods', 'raw_material']),
  itemId: z.string().min(1, 'Select an item to adjust'),
  quantityChange: z.number().int().refine((val) => val !== 0, {
    message: 'Adjustment cannot be zero',
  }),
  notes: z.string().min(3, 'Adjustment reason is required'),
})

type AdjustFormData = z.infer<typeof adjustSchema>

interface AdjustStockDialogProps {
  finishedGoods: FinishedGoodsStockItem[]
  materials: RawMaterial[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AdjustStockDialog({
  finishedGoods,
  materials,
  open,
  onOpenChange,
  onSuccess,
}: AdjustStockDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  const defaultFG = finishedGoods[0]

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AdjustFormData>({
    resolver: zodResolver(adjustSchema),
    defaultValues: {
      targetType: 'finished_goods',
      itemId: defaultFG?.variantId || '',
      quantityChange: 10,
      notes: 'Physical inventory audit reconciliation',
    },
  })

  const targetType = useWatch({ control, name: 'targetType' })

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as 'finished_goods' | 'raw_material'
    setValue('targetType', val)
    if (val === 'finished_goods' && finishedGoods.length > 0) {
      setValue('itemId', finishedGoods[0].variantId)
    } else if (val === 'raw_material' && materials.length > 0) {
      setValue('itemId', materials[0].id)
    }
  }

  const onSubmit = async (data: AdjustFormData) => {
    setLoading(true)
    try {
      if (data.targetType === 'finished_goods') {
        await inventoryRepository.recordFinishedGoodsAdjustment({
          variantId: data.itemId,
          quantityChange: data.quantityChange,
          notes: data.notes,
        })
      } else {
        await inventoryRepository.recordRawMaterialAdjustment({
          materialId: data.itemId,
          quantityChange: data.quantityChange,
          notes: data.notes,
        })
      }

      toast.success('Inventory adjusted & audit movement logged', {
        description: `Adjustment of ${data.quantityChange > 0 ? '+' : ''}${
          data.quantityChange
        } applied.`,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to adjust stock'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            Manual Stock Adjustment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Stock Category *</label>
            <select
              value={targetType}
              onChange={handleTypeChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="finished_goods">Finished Garment Pieces</option>
              <option value="raw_material">Raw Materials & Fabric</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Select Stock Item *</label>
            <select
              {...register('itemId')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {targetType === 'finished_goods'
                ? finishedGoods.map((fg) => (
                    <option key={fg.variantId} value={fg.variantId}>
                      {fg.productName} (Size {fg.size}) — {fg.currentPieces} pcs in stock
                    </option>
                  ))
                : materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.availableQuantity} {m.baseUnit}
                    </option>
                  ))}
            </select>
            {errors.itemId && (
              <p className="text-[11px] text-destructive">{errors.itemId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Quantity Adjustment (Enter negative to deduct) *
            </label>
            <Input
              type="number"
              placeholder="+10 or -5"
              {...register('quantityChange', { valueAsNumber: true })}
            />
            {errors.quantityChange && (
              <p className="text-[11px] text-destructive">{errors.quantityChange.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Adjustment Reason / Audit Note *
            </label>
            <Input
              placeholder="e.g. Physical inventory count, damaged in store, sample issue"
              {...register('notes')}
            />
            {errors.notes && (
              <p className="text-[11px] text-destructive">{errors.notes.message}</p>
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
              {loading ? 'Adjusting...' : 'Confirm Adjustment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
