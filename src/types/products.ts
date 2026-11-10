import { BaseEntity } from './common'

export interface ProductVariant {
  id: string
  sku: string
  size: string // e.g. "18", "20", "22", "M", "L", "XL"
  color?: string // optional
  pricePerPiece: number // mandatory per-piece pricing
  costPerPiece?: number
  stockPieces: number
  isActive: boolean
}

export interface Product extends BaseEntity {
  name: string
  code: string // Model / design code
  category: string
  description?: string
  status: 'active' | 'inactive'
  variants: ProductVariant[]
}
