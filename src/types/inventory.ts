import { BaseEntity } from './common'

export type StockMovementType =
  | 'purchase'
  | 'purchase_return'
  | 'material_issue'
  | 'production_receipt'
  | 'sale'
  | 'sales_return'
  | 'consignment_out'
  | 'consignment_return'
  | 'transfer_to_own_shop'
  | 'damage'
  | 'adjustment'

export interface RecordMovementInput {
  date: string
  itemType: 'finished_goods' | 'raw_material'
  itemId: string // variantId for finished_goods, materialId for raw_material
  movementType: StockMovementType
  quantityPieces: number // positive integer quantity to move
  unitPrice?: number
  referenceType?: string
  referenceId?: string
  notes?: string
}

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
