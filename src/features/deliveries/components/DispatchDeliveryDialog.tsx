import React, { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Truck } from 'lucide-react'
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
import { productsRepository } from '@/mocks/repositories/productsRepository'
import { Product, ProductVariant } from '@/types/products'
import { Shopkeeper } from '@/types/shopkeepers'
import { toast } from 'sonner'
import { formatBDT, calculateLineTotal } from '@/lib/calculations/financialCalculations'

const dispatchSchema = z.object({
  shopkeeperId: z.string().min(1, 'Please select a wholesale shopkeeper'),
  date: z.string().min(1, 'Date is required'),
  transactionType: z.enum(['credit_sale', 'consignment']),
  productId: z.string().min(1, 'Select a product'),
  variantId: z.string().min(1, 'Select a size variant'),
  quantityPieces: z.number().int().positive('Quantity must be at least 1 piece'),
  pricePerPiece: z.number().positive('Per-piece price must be greater than 0'),
  paidAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
})

type DispatchFormData = z.infer<typeof dispatchSchema>

interface DispatchDeliveryDialogProps {
  shopkeepers: Shopkeeper[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DispatchDeliveryDialog({
  shopkeepers,
  open,
  onOpenChange,
  onSuccess,
}: DispatchDeliveryDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DispatchFormData>({
    resolver: zodResolver(dispatchSchema),
    defaultValues: {
      shopkeeperId: shopkeepers[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      transactionType: 'credit_sale',
      productId: '',
      variantId: '',
      quantityPieces: 50,
      pricePerPiece: 280,
      paidAmount: 0,
      notes: '',
    },
  })

  useEffect(() => {
    async function fetchProducts() {
      try {
        const prodList = await productsRepository.listProducts()
        setProducts(prodList)
        if (prodList.length > 0) {
          setValue('productId', prodList[0].id)
          if (prodList[0].variants.length > 0) {
            setValue('variantId', prodList[0].variants[0].id)
            setValue('pricePerPiece', prodList[0].variants[0].pricePerPiece)
          }
        }
      } catch (err) {
        console.error('Failed to load products for delivery', err)
      }
    }
    if (open) {
      fetchProducts()
    }
  }, [open, setValue])

  const selectedProductId = useWatch({ control, name: 'productId' })
  const selectedVariantId = useWatch({ control, name: 'variantId' })
  const quantityPieces = useWatch({ control, name: 'quantityPieces' }) || 0
  const pricePerPiece = useWatch({ control, name: 'pricePerPiece' }) || 0
  const transactionType = useWatch({ control, name: 'transactionType' })

  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const variants: ProductVariant[] = selectedProduct?.variants || []
  const selectedVariant = variants.find((v) => v.id === selectedVariantId)

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value
    setValue('productId', prodId)
    const prod = products.find((p) => p.id === prodId)
    if (prod && prod.variants.length > 0) {
      setValue('variantId', prod.variants[0].id)
      setValue('pricePerPiece', prod.variants[0].pricePerPiece)
    }
  }

  const lineTotal = calculateLineTotal(quantityPieces, pricePerPiece)

  const onSubmit = async (data: DispatchFormData) => {
    try {
      setLoading(true)
      const prod = products.find((p) => p.id === data.productId)
      const variant = prod?.variants.find((v) => v.id === data.variantId)

      if (!prod || !variant) {
        toast.error('Invalid product or variant selected')
        return
      }

      await shopkeepersRepository.recordDelivery({
        shopkeeperId: data.shopkeeperId,
        date: data.date,
        transactionType: data.transactionType,
        items: [
          {
            productId: prod.id,
            productName: prod.name,
            variantId: variant.id,
            sku: variant.sku,
            size: variant.size,
            quantityPieces: data.quantityPieces,
            pricePerPiece: data.pricePerPiece,
          },
        ],
        paidAmount: data.paidAmount,
        notes: data.notes,
      })

      toast.success(
        `Dispatched ${data.quantityPieces} pcs garments via ${
          data.transactionType === 'consignment' ? 'Consignment' : 'Credit Sale'
        }`
      )
      reset()
      onOpenChange(false)
      onSuccess()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record delivery'
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
            <Truck className="h-5 w-5 text-primary" />
            Dispatch Wholesale Delivery (Challan)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Shopkeeper selection */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Wholesale Shopkeeper *</label>
            <select
              {...register('shopkeeperId')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {shopkeepers.map((sk) => (
                <option key={sk.id} value={sk.id}>
                  {sk.shopName} - {sk.marketName} ({sk.ownerName})
                </option>
              ))}
            </select>
            {errors.shopkeeperId && (
              <p className="text-xs text-destructive">{errors.shopkeeperId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Dispatch Date *</label>
              <Input type="date" {...register('date')} className="bg-background" />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Transaction Type *</label>
              <select
                {...register('transactionType')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="credit_sale">Credit Sale (Receivable)</option>
                <option value="consignment">Consignment (Vendor Held)</option>
              </select>
            </div>
          </div>

          {/* Product & Variant */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Garment Product *</label>
              <select
                value={selectedProductId}
                onChange={handleProductChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Size Variant *</label>
              <select
                {...register('variantId')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    Size {v.size} ({v.color}) - {v.sku}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity in Pieces and Price per piece */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Quantity (Pieces) *
              </label>
              <Input
                type="number"
                min={1}
                {...register('quantityPieces', { valueAsNumber: true })}
                className="bg-background"
              />
              {errors.quantityPieces && (
                <p className="text-xs text-destructive">{errors.quantityPieces.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Price per Piece (৳) *
              </label>
              <Input
                type="number"
                step="0.01"
                min={1}
                {...register('pricePerPiece', { valueAsNumber: true })}
                className="bg-background"
              />
              {errors.pricePerPiece && (
                <p className="text-xs text-destructive">{errors.pricePerPiece.message}</p>
              )}
            </div>
          </div>

          {/* Live Valuation calculation */}
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Delivery Total:</span>
              <span className="text-foreground font-semibold">{formatBDT(lineTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Selected Item:</span>
              <span>
                {selectedProduct?.name} (Size {selectedVariant?.size}) • {quantityPieces} pcs
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              {transactionType === 'consignment'
                ? 'ℹ️ Consignment pieces remain factory asset until sold; no debt is added immediately.'
                : 'ℹ️ Credit sale is added directly to the shopkeeper ledger and accounts receivable balance.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Upfront Cash (৳)</label>
              <Input
                type="number"
                min={0}
                {...register('paidAmount', { valueAsNumber: true })}
                className="bg-background"
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Challan Notes / Gate Pass</label>
              <Input
                type="text"
                {...register('notes')}
                className="bg-background"
                placeholder="e.g. Sent via Sundarban Courier"
              />
            </div>
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
              {loading ? 'Dispatching...' : 'Confirm Delivery Dispatch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
