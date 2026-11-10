import { BaseEntity } from './common'

export interface ProductVariant {
  id: string
  sku: string
  size: string // e.g. "16-20", "22-26", "28-32", "34-38", "18", "20", "22", "M", "L", "XL"
  color?: string // optional (e.g. Navy Blue, Black, Multi)
  pricePerPiece: number // mandatory per-piece wholesale price for this size
  costPerPiece?: number // optional production/cost price
  stockPieces: number // stock quantity in pieces
  isActive: boolean
}

export interface Product extends BaseEntity {
  name: string
  code: string // Model / design code (e.g. BPS-101)
  category: string
  description?: string
  fabric?: string // e.g. 100% Combed Cotton, Denim, Pique
  imageUrl?: string // product photo URL or base64 data URL
  status: 'active' | 'inactive'
  variants: ProductVariant[]
}
