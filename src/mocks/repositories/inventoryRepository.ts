import { FinishedGoodsStockItem, InventoryMovement } from '@/types/inventory'
import { RawMaterial } from '@/types/rawMaterials'
import { roundCurrency } from '@/lib/calculations/financialCalculations'
import { mockStorage } from '../storage/localStorageAdapter'

export class InventoryRepository {
  public async getFinishedGoodsStock(): Promise<FinishedGoodsStockItem[]> {
    const db = mockStorage.getDatabase()
    return db.finishedGoodsStock
  }

  public async getRawMaterialsStock(): Promise<RawMaterial[]> {
    const db = mockStorage.getDatabase()
    return db.materials
  }

  public async getStockMovements(): Promise<InventoryMovement[]> {
    const db = mockStorage.getDatabase()
    return db.inventoryMovements
  }

  public async recordFinishedGoodsAdjustment(input: {
    variantId: string
    quantityChange: number
    notes: string
  }): Promise<void> {
    const db = mockStorage.getDatabase()
    const item = db.finishedGoodsStock.find((s) => s.variantId === input.variantId)
    if (!item) throw new Error(`Stock variant not found: ${input.variantId}`)

    item.currentPieces = Math.max(0, item.currentPieces + input.quantityChange)
    item.valuation = roundCurrency(item.currentPieces * item.pricePerPiece)

    db.inventoryMovements.unshift({
      id: `inv-mov-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      itemType: 'finished_goods',
      itemId: item.variantId,
      itemName: `${item.productName} (Size ${item.size})`,
      movementType: 'adjustment',
      quantityChange: input.quantityChange,
      unit: 'pieces',
      notes: input.notes,
      createdAt: new Date().toISOString(),
    })

    mockStorage.saveDatabase(db)
  }

  public async recordRawMaterialAdjustment(input: {
    materialId: string
    quantityChange: number
    notes: string
  }): Promise<void> {
    const db = mockStorage.getDatabase()
    const material = db.materials.find((m) => m.id === input.materialId)
    if (!material) throw new Error(`Raw material not found: ${input.materialId}`)

    material.availableQuantity = Math.max(0, material.availableQuantity + input.quantityChange)

    db.inventoryMovements.unshift({
      id: `inv-mov-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      itemType: 'raw_material',
      itemId: material.id,
      itemName: material.name,
      movementType: 'adjustment',
      quantityChange: input.quantityChange,
      unit: material.baseUnit,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    })

    mockStorage.saveDatabase(db)
  }
}

export const inventoryRepository = new InventoryRepository()
