import React, { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { RotateCcw } from 'lucide-react'
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
import { ShopkeeperDelivery } from '@/types/shopkeepers'
import { toast } from 'sonner'
import { formatBDT, calculateReturnCredit } from '@/lib/calculations/financialCalculations'

const returnSchema = z.object({
  deliveryId: z.string().min(1, 'Select a delivery'),
  variantId: z.string().min(1, 'Select an item to return'),
  returnQuantityPieces: z.number().int().positive('Return pieces must be at least 1'),
  condition: z.enum(['sellable', 'damaged']),
  reason: z.string().min(3, 'Return reason is required'),
})

type ReturnFormData = z.infer<typeof returnSchema>

interface RecordShopkeeperReturnDialogProps {
  shopkeeperId: string
  shopName: string
  deliveries: ShopkeeperDelivery[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RecordShopkeeperReturnDialog({
  shopkeeperId,
  shopName,
  deliveries,
  open,
  onOpenChange,
  onSuccess,
}: RecordShopkeeperReturnDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  const defaultDelivery = deliveries[0]
  const defaultItem = defaultDelivery?.items[0]

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      deliveryId: defaultDelivery?.id || '',
      variantId: defaultItem?.variantId || '',
      returnQuantityPieces: 5,
      condition: 'sellable',
      reason: 'Shopkeeper size exchange',
    },
  })

  const selectedDeliveryId = useWatch({ control, name: 'deliveryId' })
  const selectedVariantId = useWatch({ control, name: 'variantId' })
  const returnQty = useWatch({ control, name: 'returnQuantityPieces' }) || 0

  const selectedDelivery = deliveries.find((d) => d.id === selectedDeliveryId)
  const selectedItem = selectedDelivery?.items.find((i) => i.variantId === selectedVariantId)

  const maxEligible = selectedItem ? selectedItem.quantityPieces - selectedItem.returnedPieces : 0
  const creditPreview = selectedItem ? calculateReturnCredit(returnQty, selectedItem.pricePerPiece) : 0

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const delivId = e.target.value
    setValue('deliveryId', delivId)
    const del = deliveries.find((d) => d.id === delivId)
    if (del && del.items.length > 0) {
      setValue('variantId', del.items[0].variantId)
    }
  }

  const onSubmit = async (data: ReturnFormData) => {
    if (!selectedDelivery || !selectedItem) {
      toast.error('Select a valid delivery item')
      return
    }

    if (data.returnQuantityPieces > maxEligible) {
      toast.error(`Cannot return ${data.returnQuantityPieces} pcs. Only ${maxEligible} pcs eligible.`)
      return
    }

    setLoading(true)
    try {
      await shopkeepersRepository.recordReturn({
        shopkeeperId,
        deliveryId: data.deliveryId,
        variantId: data.variantId,
        returnQuantityPieces: data.returnQuantityPieces,
        condition: data.condition,
        reason: data.reason,
      })

      toast.success('Return recorded & ledger adjusted', {
        description: `Returned ${data.returnQuantityPieces} pcs (${data.condition}). Credit: ${formatBDT(
          creditPreview
        )}.`,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record return'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            Process Garment Return ({shopName})
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Original Delivery Reference *
            </label>
            <select
              value={selectedDeliveryId}
              onChange={handleDeliveryChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {deliveries.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.deliveryNumber} ({d.date}) — {d.transactionType === 'consignment' ? 'Consignment' : 'Credit Sale'}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Delivered Garment Item *
            </label>
            <select
              {...register('variantId')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {selectedDelivery?.items.map((i) => (
                <option key={i.variantId} value={i.variantId}>
                  {i.productName} (Size {i.size}) — Delivered {i.quantityPieces} pcs, Already returned {i.returnedPieces} pcs
                </option>
              ))}
            </select>
          </div>

          {selectedItem && (
            <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Price / Piece:</span>
                <span className="font-semibold font-mono text-foreground">
                  {formatBDT(selectedItem.pricePerPiece)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maximum Eligible Return Quantity:</span>
                <span className="font-bold font-mono text-primary">{maxEligible} pieces</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Return Quantity (Pieces) *
              </label>
              <Input
                type="number"
                placeholder="5"
                {...register('returnQuantityPieces', { valueAsNumber: true })}
              />
              {errors.returnQuantityPieces && (
                <p className="text-[11px] text-destructive">
                  {errors.returnQuantityPieces.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Garment Condition *
              </label>
              <select
                {...register('condition')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-medium"
              >
                <option value="sellable">Sellable (Restock to finished goods)</option>
                <option value="damaged">Damaged / Defective (Quarantine)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Return Reason *</label>
            <Input
              placeholder="e.g. Slow moving size exchange / Stitch flaw"
              {...register('reason')}
            />
            {errors.reason && (
              <p className="text-[11px] text-destructive">{errors.reason.message}</p>
            )}
          </div>

          {/* Credit adjustment preview */}
          <div className="p-3 rounded-lg border border-border bg-primary/5 flex items-center justify-between text-xs">
            <span className="text-foreground font-medium">Credit Adjustment to Balance:</span>
            <span className="font-bold font-mono text-primary text-sm">
              {formatBDT(creditPreview)}
            </span>
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
              {loading ? 'Processing...' : 'Confirm Return'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
