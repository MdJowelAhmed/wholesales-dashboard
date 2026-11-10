import { z } from 'zod'

export const deliverySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  transactionType: z.enum(['credit_sale', 'consignment']),
  productId: z.string().min(1, 'Select a product'),
  variantId: z.string().min(1, 'Select a size variant'),
  quantityPieces: z.number().int().positive('Quantity must be at least 1 piece'),
  pricePerPiece: z.number().positive('Per-piece price must be greater than 0'),
  paidAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
})

export type DeliveryFormData = z.infer<typeof deliverySchema>

