import { z } from 'zod'

export const logWorkSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  productId: z.string().min(1, 'Please select a garment product'),
  productName: z.string().min(1, 'Garment/Product name is required'),
  size: z.string().min(1, 'Size is required'),
  unit: z.enum(['piece', 'dozen']),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  ratePerUnit: z.number().positive('Wage rate must be greater than 0'),
  notes: z.string().optional(),
})

export type LogWorkFormData = z.infer<typeof logWorkSchema>

