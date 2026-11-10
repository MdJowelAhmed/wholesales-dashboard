import React, { useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ShoppingBag, Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { salesRepository } from '@/mocks/repositories/salesRepository'
import { Product } from '@/types/products'
import { Customer } from '@/types/sales'
import { Shopkeeper } from '@/types/shopkeepers'
import {
  formatBDT,
  calculateLineTotal,
  calculateInvoiceTotal,
} from '@/lib/calculations/financialCalculations'
import { toast } from 'sonner'

const itemSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  variantId: z.string().min(1, 'Select a variant'),
  quantityPieces: z.number().int().positive('Quantity must be at least 1 piece'),
  pricePerPiece: z.number().positive('Price must be greater than 0'),
  discount: z.number().min(0).optional(),
})

const saleSchema = z.object({
  date: z.string().min(1, 'Invoice date is required'),
  customerType: z.enum(['retail_customer', 'wholesale_shopkeeper']),
  partyId: z.string().optional(),
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().optional(),
  saleType: z.enum(['own_shop', 'wholesale_credit']),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
  orderDiscount: z.number().min(0).optional(),
  paidAmount: z.number().min(0).optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'cheque', 'bkash', 'nagad']),
  notes: z.string().optional(),
})

type SaleFormData = z.infer<typeof saleSchema>

interface CreateSaleInvoiceDialogProps {
  products: Product[]
  customers: Customer[]
  shopkeepers: Shopkeeper[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateSaleInvoiceDialog({
  products,
  customers,
  shopkeepers,
  open,
  onOpenChange,
  onSuccess,
}: CreateSaleInvoiceDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  const defaultProduct = products[0]
  const defaultVariant = defaultProduct?.variants[0]

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      customerType: 'wholesale_shopkeeper',
      partyId: shopkeepers[0]?.id || '',
      customerName: shopkeepers[0]?.shopName || 'Haji Garments Wholesale',
      customerPhone: shopkeepers[0]?.phone || '+880 1712-445566',
      saleType: 'wholesale_credit',
      items: [
        {
          productId: defaultProduct?.id || '',
          variantId: defaultVariant?.id || '',
          quantityPieces: 50,
          pricePerPiece: defaultVariant?.pricePerPiece || 280,
          discount: 0,
        },
      ],
      orderDiscount: 0,
      paidAmount: 5000,
      paymentMethod: 'cash',
      notes: 'Dispatched via wholesale transport',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const customerType = useWatch({ control, name: 'customerType' })
  const watchItems = useWatch({ control, name: 'items' }) || []
  const orderDiscount = useWatch({ control, name: 'orderDiscount' }) || 0
  const paidAmount = useWatch({ control, name: 'paidAmount' }) || 0

  const handleCustomerTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as 'retail_customer' | 'wholesale_shopkeeper'
    setValue('customerType', type)
    if (type === 'wholesale_shopkeeper' && shopkeepers.length > 0) {
      setValue('partyId', shopkeepers[0].id)
      setValue('customerName', shopkeepers[0].shopName)
      setValue('customerPhone', shopkeepers[0].phone)
      setValue('saleType', 'wholesale_credit')
    } else if (type === 'retail_customer' && customers.length > 0) {
      setValue('partyId', customers[0].id)
      setValue('customerName', customers[0].name)
      setValue('customerPhone', customers[0].phone)
      setValue('saleType', 'own_shop')
    }
  }

  const handlePartyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setValue('partyId', id)
    if (customerType === 'wholesale_shopkeeper') {
      const sk = shopkeepers.find((s) => s.id === id)
      if (sk) {
        setValue('customerName', sk.shopName)
        setValue('customerPhone', sk.phone)
      }
    } else {
      const c = customers.find((cust) => cust.id === id)
      if (c) {
        setValue('customerName', c.name)
        setValue('customerPhone', c.phone)
      }
    }
  }

  const { subtotal, total } = calculateInvoiceTotal(
    watchItems.map((i) => ({
      quantityPieces: i.quantityPieces || 0,
      pricePerPiece: i.pricePerPiece || 0,
      discount: i.discount || 0,
    })),
    orderDiscount
  )
  const dueAmount = Math.max(0, total - paidAmount)

  const onSubmit = async (data: SaleFormData) => {
    setLoading(true)
    try {
      const formattedItems = data.items.map((item) => {
        const prod = products.find((p) => p.id === item.productId)
        const variant = prod?.variants.find((v) => v.id === item.variantId)
        return {
          productId: item.productId,
          productName: prod ? prod.name : 'Garment Item',
          variantId: item.variantId,
          sku: variant?.sku || `${prod?.code}-${variant?.size}`,
          size: variant?.size || '18',
          quantityPieces: item.quantityPieces,
          pricePerPiece: item.pricePerPiece,
          discount: item.discount || 0,
        }
      })

      const sale = await salesRepository.createSale({
        date: data.date,
        customerType: data.customerType,
        customerId: data.partyId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        saleType: data.saleType,
        items: formattedItems,
        orderDiscount: data.orderDiscount,
        paidAmount: data.paidAmount,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      })

      toast.success('Sales invoice created', {
        description: `Invoice ${sale.invoiceNumber} created. Total: ${formatBDT(total)}.`,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create sales invoice'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Create Sales Invoice
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Customer & Sale Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Customer Type *</label>
              <select
                value={customerType}
                onChange={handleCustomerTypeChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="wholesale_shopkeeper">Wholesale Shopkeeper</option>
                <option value="retail_customer">Retail / Boutique Customer</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Select Client Party *</label>
              <select
                onChange={handlePartyChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {customerType === 'wholesale_shopkeeper'
                  ? shopkeepers.map((sk) => (
                      <option key={sk.id} value={sk.id}>
                        {sk.shopName} ({sk.marketName})
                      </option>
                    ))
                  : customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Customer / Shop Name *</label>
              <Input placeholder="Client name" {...register('customerName')} />
              {errors.customerName && (
                <p className="text-[11px] text-destructive">{errors.customerName.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Phone Number</label>
              <Input placeholder="+880 1..." {...register('customerPhone')} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Invoice Date *</label>
              <Input type="date" {...register('date')} />
            </div>
          </div>

          {/* Line Items strictly per piece */}
          <div className="space-y-2 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Finished Garments (Strictly Per-Piece)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() =>
                  append({
                    productId: defaultProduct?.id || '',
                    variantId: defaultVariant?.id || '',
                    quantityPieces: 20,
                    pricePerPiece: defaultVariant?.pricePerPiece || 280,
                    discount: 0,
                  })
                }
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Garment
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => {
                const currentItem = watchItems[index]
                const lineLineTotal = calculateLineTotal(
                  currentItem?.quantityPieces || 0,
                  currentItem?.pricePerPiece || 0,
                  currentItem?.discount || 0
                )

                return (
                  <div
                    key={field.id}
                    className="p-3 rounded-lg border border-border bg-card/60 space-y-2 text-xs"
                  >
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5 space-y-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Model & Variant
                        </label>
                        <select
                          {...register(`items.${index}.variantId`)}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          {products.flatMap((p) =>
                            p.variants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {p.name} (Size {v.size}) — ৳{v.pricePerPiece}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Pieces *
                        </label>
                        <Input
                          type="number"
                          className="h-9 text-xs"
                          placeholder="50"
                          {...register(`items.${index}.quantityPieces`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Price/Pc *
                        </label>
                        <Input
                          type="number"
                          step="any"
                          className="h-9 text-xs"
                          placeholder="280"
                          {...register(`items.${index}.pricePerPiece`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Line Total
                        </label>
                        <div className="h-9 flex items-center font-mono font-bold text-foreground">
                          {formatBDT(lineLineTotal)}
                        </div>
                      </div>

                      <div className="col-span-1 pt-4 text-right">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pricing & Payments Summary */}
          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items Subtotal:</span>
              <span className="font-mono font-semibold text-foreground">{formatBDT(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Order Discount (৳):</span>
              <div className="w-28">
                <Input
                  type="number"
                  step="any"
                  className="h-8 text-xs font-mono"
                  placeholder="0"
                  {...register('orderDiscount', { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="flex justify-between font-bold text-sm border-t border-border pt-2">
              <span className="text-foreground">Grand Total:</span>
              <span className="font-mono text-primary">{formatBDT(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Payment Collected Now (৳)
              </label>
              <Input
                type="number"
                step="any"
                placeholder="0"
                {...register('paidAmount', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Payment Method</label>
              <select
                {...register('paymentMethod')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer (IBBL/City)</option>
                <option value="bkash">bKash Merchant</option>
                <option value="nagad">Nagad</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div className="p-2 rounded bg-secondary text-secondary-foreground flex items-center justify-between text-xs">
            <span className="font-medium">Remaining Due Balance:</span>
            <span className="font-mono font-bold">{formatBDT(dueAmount)}</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Invoice Notes</label>
            <Input placeholder="Transport challan, gate pass remarks" {...register('notes')} />
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Issue Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
