import { z } from 'zod'

export const entrySchema = z.object({
  productionDate: z.string().min(1, 'Production date is required'),
  orderCode: z.string().min(1, 'Select a production order'),
  productId: z.string().min(1, 'Select a product'),
  variantId: z.string().min(1, 'Select a size variant'),
  employeeId: z.string().min(1, 'Select an operator/tailor'),
  inputUnit: z.enum(['piece', 'dozen']),
  inputQuantity: z.number().int().positive('Quantity must be at least 1'),
  applicableWageRate: z.number().positive('Wage rate must be greater than 0'),
  goodQuantityPieces: z.number().int().min(0, 'Good pieces cannot be negative'),
  damagedQuantityPieces: z.number().int().min(0, 'Damaged pieces cannot be negative'),
  notes: z.string().optional(),
})

export type EntryFormData = z.infer<typeof entrySchema>

