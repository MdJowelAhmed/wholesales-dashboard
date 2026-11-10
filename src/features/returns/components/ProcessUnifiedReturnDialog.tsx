import React, { useState, useEffect } from 'react'
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
import { Shopkeeper, ShopkeeperDelivery, ShopkeeperDeliveryItem } from '@/types/shopkeepers'
import { toast } from 'sonner'
import { formatBDT, calculateReturnCredit } from '@/lib/calculations/financialCalculations'

const returnSchema = z.object({
  shopkeeperId: z.string().min(1, 'Please select a shopkeeper'),
  deliveryId: z.string().min(1, 'Please select a delivery challan'),
  variantId: z.string().min(1, 'Please select an item to return'),
  returnQuantityPieces: z.number().int().positive('Return quantity must be at least 1 piece'),
  condition: z.enum(['sellable', 'damaged']),
  reason: z.string().min(3, 'Please provide a reason for the return'),
})

type ReturnFormData = z.infer<typeof returnSchema>

interface ProcessUnifiedReturnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ProcessUnifiedReturnDialog({
  open,
  onOpenChange,
  onSuccess,
}: ProcessUnifiedReturnDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([])
  const [deliveries, setDeliveries] = useState<ShopkeeperDelivery[]>([])

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
      shopkeeperId: '',
      deliveryId: '',
      variantId: '',
      returnQuantityPieces: 5,
      condition: 'sellable',
      reason: 'Excess stock return from market display',
    },
  })

  // Load shopkeepers on open
  useEffect(() => {
    async function loadShopkeepers() {
      try {
        const skList = await shopkeepersRepository.listShopkeepers()
        setShopkeepers(skList)
        if (skList.length > 0) {
          setValue('shopkeeperId', skList[0].id)
          loadDeliveriesForShopkeeper(skList[0].id)
        }
      } catch (err) {
        console.error('Failed to load shopkeepers for return dialog', err)
      }
    }
    if (open) {
      loadShopkeepers()
    }
  }, [open, setValue])

  const loadDeliveriesForShopkeeper = async (skId: string) => {
    try {
      const dList = await shopkeepersRepository.getDeliveries(skId)
      setDeliveries(dList)
      if (dList.length > 0) {
        setValue('deliveryId', dList[0].id)
        if (dList[0].items.length > 0) {
          setValue('variantId', dList[0].items[0].variantId)
        }
      } else {
        setValue('deliveryId', '')
        setValue('variantId', '')
      }
    } catch (err) {
      console.error('Failed to load deliveries for shopkeeper', err)
    }
  }

  const selectedShopkeeperId = useWatch({ control, name: 'shopkeeperId' })
  const selectedDeliveryId = useWatch({ control, name: 'deliveryId' })
  const selectedVariantId = useWatch({ control, name: 'variantId' })
  const returnQuantityPieces = useWatch({ control, name: 'returnQuantityPieces' }) || 0
  const condition = useWatch({ control, name: 'condition' })

  const handleShopkeeperChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const skId = e.target.value
    setValue('shopkeeperId', skId)
    loadDeliveriesForShopkeeper(skId)
  }

  const selectedDelivery = deliveries.find((d) => d.id === selectedDeliveryId)
  const deliveryItems: ShopkeeperDeliveryItem[] = selectedDelivery?.items || []
  const selectedItem = deliveryItems.find((i) => i.variantId === selectedVariantId)

  const eligiblePieces = selectedItem
    ? Math.max(0, selectedItem.quantityPieces - selectedItem.returnedPieces)
    : 0

  const creditAmount = selectedItem
    ? calculateReturnCredit(returnQuantityPieces, selectedItem.pricePerPiece)
    : 0

  const onSubmit = async (data: ReturnFormData) => {
    try {
      setLoading(true)

      if (data.returnQuantityPieces > eligiblePieces) {
        toast.error(
          `Cannot return ${data.returnQuantityPieces} pcs. Only ${eligiblePieces} pcs eligible.`
        )
        return
      }

      await shopkeepersRepository.recordReturn({
        shopkeeperId: data.shopkeeperId,
        deliveryId: data.deliveryId,
        variantId: data.variantId,
        returnQuantityPieces: data.returnQuantityPieces,
        condition: data.condition,
        reason: data.reason,
      })

      toast.success(
        `Processed return of ${data.returnQuantityPieces} pcs (${data.condition}). Credit: ${formatBDT(
          creditAmount
        )}`
      )
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
      <DialogContent className="max-w-lg bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <RotateCcw className="h-5 w-5 text-primary" />
            Process Wholesale Return
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Shopkeeper Selection */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Shopkeeper / Partner *</label>
            <select
              value={selectedShopkeeperId}
              onChange={handleShopkeeperChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {shopkeepers.map((sk) => (
                <option key={sk.id} value={sk.id}>
                  {sk.shopName} - {sk.marketName}
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Selection */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Original Delivery Challan *</label>
            <select
              {...register('deliveryId')}
              onChange={(e) => {
                setValue('deliveryId', e.target.value)
                const d = deliveries.find((del) => del.id === e.target.value)
                if (d && d.items.length > 0) {
                  setValue('variantId', d.items[0].variantId)
                }
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {deliveries.length === 0 ? (
                <option value="">No past deliveries found for this shopkeeper</option>
              ) : (
                deliveries.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.deliveryNumber} ({d.date}) - {d.transactionType.replace('_', ' ')} (
                    {d.totalPieces} pcs)
                  </option>
                ))
              )}
            </select>
            {errors.deliveryId && (
              <p className="text-xs text-destructive">{errors.deliveryId.message}</p>
            )}
          </div>

          {/* Item Selection from Delivery */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Garment Item / Size *</label>
            <select
              {...register('variantId')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {deliveryItems.map((item) => (
                <option key={item.variantId} value={item.variantId}>
                  {item.productName} (Size {item.size}) - Delivered: {item.quantityPieces} pcs |
                  Returned: {item.returnedPieces} pcs | Eligible: {item.quantityPieces - item.returnedPieces} pcs
                </option>
              ))}
            </select>
            {errors.variantId && (
              <p className="text-xs text-destructive">{errors.variantId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Return Quantity (Pieces) *
              </label>
              <Input
                type="number"
                min={1}
                max={eligiblePieces > 0 ? eligiblePieces : 1}
                {...register('returnQuantityPieces', { valueAsNumber: true })}
                className="bg-background"
              />
              <span className="text-[11px] text-muted-foreground">
                Max eligible: {eligiblePieces} pcs
              </span>
              {errors.returnQuantityPieces && (
                <p className="text-xs text-destructive">{errors.returnQuantityPieces.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Physical Condition *</label>
              <select
                {...register('condition')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="sellable">Sellable (Restock to Inventory)</option>
                <option value="damaged">Damaged / Defective (Quarantine)</option>
              </select>
            </div>
          </div>

          {/* Credit & Inventory summary */}
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Credit Adjustment to Ledger:</span>
              <span className="text-foreground font-semibold">{formatBDT(creditAmount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Return Rate:</span>
              <span>
                {returnQuantityPieces} pcs @ ৳{selectedItem?.pricePerPiece || 0}/pc
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              {condition === 'sellable'
                ? '✅ Sellable garments will be immediately added back to active warehouse finished goods inventory.'
                : '⚠️ Damaged pieces are marked as defective and will NOT be added to sellable stock.'}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Reason for Return *</label>
            <Input
              type="text"
              placeholder="e.g. Size ratio adjustment, fabric discoloration, unsold consignment"
              {...register('reason')}
              className="bg-background"
            />
            {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
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
            <Button
              type="submit"
              disabled={loading || deliveries.length === 0 || eligiblePieces === 0}
              className="bg-primary text-primary-foreground"
            >
              {loading ? 'Processing...' : 'Confirm Return & Credit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
