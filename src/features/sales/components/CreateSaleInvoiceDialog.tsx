import React, { useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShoppingBag } from 'lucide-react'
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
  calculateInvoiceTotal,
} from '@/lib/calculations/financialCalculations'
import { toast } from 'sonner'
import { getTodayDateString } from '@/lib/utils'
import { saleSchema, type SaleFormData, formatSaleInvoiceItems } from './saleInvoiceSchema'
import { SaleInvoiceItemsFieldArray } from './SaleInvoiceItemsFieldArray'
import { SaleInvoiceSummaryCard } from './SaleInvoiceSummaryCard'
import { CustomerChannelSelector } from './CustomerChannelSelector'

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
  const defaultCustomer = customers[0]

  const defaultValues = React.useMemo<SaleFormData>(
    () => ({
      date: getTodayDateString(),
      customerType: 'retail_customer',
      partyId: defaultCustomer?.id || '',
      customerName: defaultCustomer?.name || 'Walk-in Customer',
      customerPhone: defaultCustomer?.phone || '+880 1711-000000',
      saleType: 'own_shop',
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
      notes: 'Counter sales voucher',
    }),
    [defaultCustomer, defaultProduct, defaultVariant]
  )

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues,
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
    const val = e.target.value as 'retail_customer' | 'wholesale_shopkeeper'
    setValue('customerType', val)
    if (val === 'wholesale_shopkeeper') {
      setValue('saleType', 'wholesale_credit')
      if (shopkeepers.length > 0) {
        setValue('partyId', shopkeepers[0].id)
        setValue('customerName', shopkeepers[0].shopName)
        setValue('customerPhone', shopkeepers[0].phone)
      }
    } else {
      setValue('saleType', 'own_shop')
      if (customers.length > 0) {
        setValue('partyId', customers[0].id)
        setValue('customerName', customers[0].name)
        setValue('customerPhone', customers[0].phone)
      }
    }
  }

  const handlePartySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value
    setValue('partyId', pId)
    if (customerType === 'wholesale_shopkeeper') {
      const sk = shopkeepers.find((s) => s.id === pId)
      if (sk) {
        setValue('customerName', sk.shopName)
        setValue('customerPhone', sk.phone)
      }
    } else {
      const c = customers.find((cust) => cust.id === pId)
      if (c) {
        setValue('customerName', c.name)
        setValue('customerPhone', c.phone)
      }
    }
  }

  // Pure Financial calculations
  const calculationItems = watchItems.map((c) => ({
    quantityPieces: c?.quantityPieces || 0,
    pricePerPiece: c?.pricePerPiece || 0,
    discount: c?.discount || 0,
  }))
  const { subtotal, total } = calculateInvoiceTotal(calculationItems, orderDiscount)
  const dueAmount = Math.max(0, total - (paidAmount || 0))

  const onSubmit = async (data: SaleFormData) => {
    setLoading(true)
    try {
      const formattedItems = formatSaleInvoiceItems(data.items, products)

      const inv = await salesRepository.createSale({
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

      toast.success('Sales invoice issued', {
        description: `Invoice ${inv.invoiceNumber} recorded for ${formatBDT(inv.totalAmount)}.`,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Failed to issue sales invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Create Sales Invoice
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Customer & Type Selector */}
          <CustomerChannelSelector
            customerType={customerType}
            customers={customers}
            shopkeepers={shopkeepers}
            onCustomerTypeChange={handleCustomerTypeChange}
            onPartySelect={handlePartySelect}
          />

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
          <SaleInvoiceItemsFieldArray
            products={products}
            fields={fields}
            watchItems={watchItems}
            append={append}
            remove={remove}
            register={register}
            defaultProduct={defaultProduct}
          />

          {/* Pricing & Payments Summary */}
          <SaleInvoiceSummaryCard
            subtotal={subtotal}
            total={total}
            dueAmount={dueAmount}
            register={register}
          />

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
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
