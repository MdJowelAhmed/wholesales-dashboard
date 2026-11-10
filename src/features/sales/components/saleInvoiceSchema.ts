import { z } from 'zod'

export const itemSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  variantId: z.string().min(1, 'Select a variant'),
  quantityPieces: z.number().int().positive('Quantity must be at least 1 piece'),
  pricePerPiece: z.number().positive('Price must be greater than 0'),
  discount: z.number().min(0).optional(),
})

export const saleSchema = z.object({
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

export type SaleFormData = z.infer<typeof saleSchema>
export type SaleItemFormData = z.infer<typeof itemSchema>

import { Product } from '@/types/products'

export function formatSaleInvoiceItems(items: SaleItemFormData[], products: Product[]) {
  return items.map((it) => {
    const prod = products.find((p) => p.variants.some((v) => v.id === it.variantId))
    const variant = prod?.variants.find((v) => v.id === it.variantId)
    return {
      productId: prod ? prod.id : 'unknown',
      productName: prod ? prod.name : 'Finished Garment',
      variantId: it.variantId,
      sku: variant ? variant.sku : 'SKU-GEN',
      size: variant ? variant.size : 'M',
      color: variant?.color,
      quantityPieces: it.quantityPieces,
      pricePerPiece: it.pricePerPiece,
      discount: it.discount,
    }
  })
}
