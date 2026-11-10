import { z } from 'zod'

export const variantItemSchema = z.object({
  size: z.string().min(1, 'Size or size range is required (e.g. 16-20, 22-26)'),
  color: z.string().optional(),
  pricePerPiece: z.number().positive('Price per piece must be greater than 0'),
  costPerPiece: z.number().min(0, 'Cost cannot be negative').optional(),
  stockPieces: z.number().int().min(0, 'Stock cannot be negative'),
})

export const productFormSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  code: z.string().min(2, 'Model/Design code is required'),
  category: z.string().min(2, 'Category is required'),
  fabric: z.string().optional(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  variants: z
    .array(variantItemSchema)
    .min(1, 'At least one size variant must be defined'),
})

export type ProductVariantItemFormData = z.infer<typeof variantItemSchema>
export type ProductFormData = z.infer<typeof productFormSchema>

export const GARMENT_SIZE_PRESETS = [
  '16-20',
  '22-26',
  '28-32',
  '34-38',
  '18',
  '20',
  '22',
  '24',
  '26',
  'S',
  'M',
  'L',
  'XL',
] as const

export const WHOLESALE_SERIES_PRESET: ProductVariantItemFormData[] = [
  { size: '16-20', color: '', pricePerPiece: 180, costPerPiece: 110, stockPieces: 100 },
  { size: '22-26', color: '', pricePerPiece: 220, costPerPiece: 135, stockPieces: 100 },
  { size: '28-32', color: '', pricePerPiece: 260, costPerPiece: 160, stockPieces: 100 },
  { size: '34-38', color: '', pricePerPiece: 310, costPerPiece: 190, stockPieces: 100 },
]

