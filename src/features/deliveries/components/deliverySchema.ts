import { z } from 'zod'

export const dispatchSchema = z.object({
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

export type DispatchFormData = z.infer<typeof dispatchSchema>

