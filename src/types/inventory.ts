import { BaseEntity } from './common'

export type StockMovementType =
  | 'purchase'
  | 'material_issue'
  | 'material_return'
  | 'production_receipt'
  | 'sale'
  | 'sales_return'
  | 'damage'
  | 'adjustment'

export interface FinishedGoodsStockItem {
  id?: string
  variantId: string
  productId: string
  productName: string
  code: string
  sku: string
  size: string
  color?: string
  currentPieces: number
  reorderLevel: number
  pricePerPiece: number
  valuation: number
}

export interface InventoryMovement extends BaseEntity {
  date: string
  itemType: 'finished_goods' | 'raw_material'
  itemId: string
  itemName: string
  movementType: StockMovementType
  quantityChange: number // positive for additions, negative for reductions
  unit: string // 'pieces', 'meter', etc.
  referenceType?: 'sale' | 'production' | 'delivery' | 'return' | 'manual'
  referenceId?: string
  notes?: string
}
