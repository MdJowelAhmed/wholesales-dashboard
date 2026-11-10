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
import { Product } from '@/types/products'
import { ShopkeeperTransactionType } from '@/types/shopkeepers'
import { toast } from 'sonner'
import { formatBDT, calculateLineTotal } from '@/lib/calculations/financialCalculations'

const deliverySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  transactionType: z.enum(['credit_sale', 'consignment']),
  productId: z.string().min(1, 'Select a product'),
  variantId: z.string().min(1, 'Select a size variant'),
  quantityPieces: z.number().int().positive('Quantity must be at least 1 piece'),
  pricePerPiece: z.number().positive('Per-piece price must be greater than 0'),
  paidAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
})

type DeliveryFormData = z.infer<typeof deliverySchema>

interface RecordDeliveryDialogProps {
  shopkeeperId: string
  shopName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RecordDeliveryDialog({
  shopkeeperId,
  shopName,
  open,
  onOpenChange,
  onSuccess,
}: RecordDeliveryDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      transactionType: 'credit_sale',
      productId: '',
      variantId: '',
      quantityPieces: 50,
      pricePerPiece: 280,
      paidAmount: 0,
      notes: 'Delivered via Islampur market pickup',
    },
  })

  useEffect(() => {
    const fetchProducts = async () => {
      const prods = await productsRepository.listProducts()
      setProducts(prods)
      if (prods.length > 0 && prods[0].variants.length > 0) {
        setValue('productId', prods[0].id)
        setValue('variantId', prods[0].variants[0].id)
        setValue('pricePerPiece', prods[0].variants[0].pricePerPiece)
      }
    }
    fetchProducts()
  }, [setValue])

  const selectedProductId = useWatch({ control, name: 'productId' })
  const selectedVariantId = useWatch({ control, name: 'variantId' })
  const quantityPieces = useWatch({ control, name: 'quantityPieces' }) || 0
  const pricePerPiece = useWatch({ control, name: 'pricePerPiece' }) || 0
  const transactionType = useWatch({ control, name: 'transactionType' })

  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const selectedVariant = selectedProduct?.variants.find((v) => v.id === selectedVariantId)

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value
    setValue('productId', prodId)
    const prod = products.find((p) => p.id === prodId)
    if (prod && prod.variants.length > 0) {
      setValue('variantId', prod.variants[0].id)
      setValue('pricePerPiece', prod.variants[0].pricePerPiece)
    }
  }

  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const varId = e.target.value
    setValue('variantId', varId)
    const variant = selectedProduct?.variants.find((v) => v.id === varId)
    if (variant) {
      setValue('pricePerPiece', variant.pricePerPiece)
    }
  }

  const lineTotal = calculateLineTotal(quantityPieces, pricePerPiece)

  const onSubmit = async (data: DeliveryFormData) => {
    if (!selectedProduct || !selectedVariant) {
      toast.error('Please select a valid product variant')
      return
    }

    setLoading(true)
    try {
      await shopkeepersRepository.recordDelivery({
        shopkeeperId,
        date: data.date,
        transactionType: data.transactionType as ShopkeeperTransactionType,
        items: [
          {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            variantId: selectedVariant.id,
            sku: selectedVariant.sku,
            size: selectedVariant.size,
            quantityPieces: data.quantityPieces,
            pricePerPiece: data.pricePerPiece,
          },
        ],
        paidAmount: data.paidAmount,
        notes: data.notes,
      })

      toast.success('Product delivery recorded', {
        description: `Delivered ${data.quantityPieces} pcs to ${shopName}.`,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Failed to record delivery')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Dispatch Garment Delivery ({shopName})
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
          {/* Transaction Type Choice */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Delivery Arrangement *
            </label>
            <select
              {...register('transactionType')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-medium"
            >
              <option value="credit_sale">
                Standard Credit Sale (Receivable booked immediately)
              </option>
              <option value="consignment">
                Consignment Delivery (Payment upon sell; stock held tracked)
              </option>
            </select>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {transactionType === 'consignment'
                ? 'Consignment stock is tracked as held pieces until sale or return.'
                : 'Direct wholesale receivable added to shopkeeper ledger.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Delivery Date *</label>
              <Input type="date" {...register('date')} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Garment Product *
              </label>
              <select
                value={selectedProductId}
                onChange={handleProductChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Size Variant *</label>
              <select
                value={selectedVariantId}
                onChange={handleVariantChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {selectedProduct?.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    Size {v.size} {v.color ? `(${v.color})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Quantity (Pieces) *
              </label>
              <Input
                type="number"
                placeholder="50"
                {...register('quantityPieces', { valueAsNumber: true })}
              />
              {errors.quantityPieces && (
                <p className="text-[10px] text-destructive">
                  {errors.quantityPieces.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Price / Piece (৳) *
              </label>
              <Input
                type="number"
                step="any"
                placeholder="280"
                {...register('pricePerPiece', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">
              Calculated Total ({quantityPieces} pcs × ৳{pricePerPiece}):
            </span>
            <span className="font-bold font-mono text-foreground text-sm">
              {formatBDT(lineTotal)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Advance Paid on Delivery (৳)
              </label>
              <Input
                type="number"
                step="any"
                placeholder="0"
                {...register('paidAmount', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Notes / Gate Pass</label>
              <Input placeholder="Courier / pickup note" {...register('notes')} />
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
              {loading ? 'Dispatching...' : 'Dispatch Delivery'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
