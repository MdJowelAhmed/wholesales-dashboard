import { FinishedGoodsStockItem, InventoryMovement } from '@/types/inventory'
import { RawMaterial } from '@/types/rawMaterials'
import { mockStorage } from '../storage/localStorageAdapter'
import { STORAGE_SCOPES } from '../storage/storageScopes'

const INVENTORY_WRITE_SCOPES = [STORAGE_SCOPES.INVENTORY, STORAGE_SCOPES.PRODUCTS, STORAGE_SCOPES.MATERIALS] as const
import { stockEngine } from './stockEngine'

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

    const { db: updatedDb } = stockEngine.recordMovement(db, {
      itemType: 'finished_goods',
      itemId: input.variantId,
      movementType: 'adjustment',
      quantityPieces: input.quantityChange,
      unitPrice: item.pricePerPiece,
      date: new Date().toISOString().split('T')[0],
      notes: input.notes,
    })

    mockStorage.saveDatabase(updatedDb, [...INVENTORY_WRITE_SCOPES])
  }

  public async recordRawMaterialAdjustment(input: {
    materialId: string
    quantityChange: number
    notes: string
  }): Promise<void> {
    const db = mockStorage.getDatabase()
    const material = db.materials.find((m) => m.id === input.materialId)
    if (!material) throw new Error(`Raw material not found: ${input.materialId}`)

    const { db: updatedDb } = stockEngine.recordMovement(db, {
      itemType: 'raw_material',
      itemId: input.materialId,
      movementType: 'adjustment',
      quantityPieces: input.quantityChange,
      date: new Date().toISOString().split('T')[0],
      notes: input.notes,
    })

    mockStorage.saveDatabase(updatedDb, [...INVENTORY_WRITE_SCOPES])
  }
}

export const inventoryRepository = new InventoryRepository()
