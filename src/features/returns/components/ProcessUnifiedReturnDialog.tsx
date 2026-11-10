import React, { useState, useEffect, useCallback } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { returnSchema, type ReturnFormData } from './returnSchema'
import { ReturnCreditSummaryCard } from './ReturnCreditSummaryCard'
import { ReturnSourceSelectors } from './ReturnSourceSelectors'

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

  const loadDeliveriesForShopkeeper = useCallback(
    async (skId: string) => {
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
    },
    [setValue]
  )

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
  }, [open, setValue, loadDeliveriesForShopkeeper])

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

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('deliveryId', e.target.value)
    const d = deliveries.find((del) => del.id === e.target.value)
    if (d && d.items.length > 0) {
      setValue('variantId', d.items[0].variantId)
    }
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
        toast.error(`Cannot return ${data.returnQuantityPieces} pcs. Only ${eligiblePieces} pcs eligible.`)
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

      const formattedCredit = formatBDT(creditAmount)
      toast.success(`Processed return of ${data.returnQuantityPieces} pcs (${data.condition}). Credit: ${formattedCredit}`)
      reset()
      onOpenChange(false)
      onSuccess()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to record return')
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
          <ReturnSourceSelectors
            shopkeepers={shopkeepers}
            deliveries={deliveries}
            deliveryItems={deliveryItems}
            selectedShopkeeperId={selectedShopkeeperId}
            onShopkeeperChange={handleShopkeeperChange}
            onDeliveryChange={handleDeliveryChange}
            register={register}
            errors={errors}
          />

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
          <ReturnCreditSummaryCard
            creditAmount={creditAmount}
            unitPrice={selectedItem?.pricePerPiece || 0}
            returnQuantityPieces={returnQuantityPieces}
            condition={condition}
          />

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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
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
