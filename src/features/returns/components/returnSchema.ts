import { z } from 'zod'

export const returnSchema = z.object({
  shopkeeperId: z.string().min(1, 'Please select a shopkeeper'),
  deliveryId: z.string().min(1, 'Please select a delivery challan'),
  variantId: z.string().min(1, 'Please select an item to return'),
  returnQuantityPieces: z.number().int().positive('Return quantity must be at least 1 piece'),
  condition: z.enum(['sellable', 'damaged']),
  reason: z.string().min(3, 'Please provide a reason for the return'),
})

export type ReturnFormData = z.infer<typeof returnSchema>

