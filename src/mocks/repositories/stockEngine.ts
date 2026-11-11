import { SeedDatabase } from '../seed'
import { InventoryMovement, RecordMovementInput, StockMovementType } from '@/types/inventory'
import { generateId } from '@/lib/ids'
import { roundCurrency } from '@/lib/calculations/financialCalculations'

export class StockEngine {
  /**
   * Determines if a movement type increases or decreases stock.
   */
  public isPositiveMovement(movementType: StockMovementType): boolean {
    switch (movementType) {
      case 'purchase':
      case 'production_receipt':
      case 'sales_return':
      case 'consignment_return':
        return true
      case 'purchase_return':
      case 'material_issue':
      case 'sale':
      case 'consignment_out':
      case 'transfer_to_own_shop':
      case 'damage':
        return false
      case 'adjustment':
        return true
    }
  }

  /**
   * The single authoritative helper that mutates finishedGoodsStock / materials immutably
   * and records an inventory movement audit trail.
   */
  public recordMovement(
    db: SeedDatabase,
    input: RecordMovementInput
  ): { db: SeedDatabase; movement: InventoryMovement } {
    const isPositive = this.isPositiveMovement(input.movementType)
    const qty = Math.abs(Math.round(input.quantityPieces))
    const signedQtyChange = isPositive ? qty : -qty

    let itemName = input.itemId
    let nextDb = { ...db }

    if (input.itemType === 'finished_goods') {
      const stockList = [...(nextDb.finishedGoodsStock || [])]
      const stockIndex = stockList.findIndex((s) => s.variantId === input.itemId)

      if (stockIndex !== -1) {
        const item = stockList[stockIndex]
        itemName = `${item.productName} (${item.size})`
        const newPieces = Math.max(0, item.currentPieces + signedQtyChange)
        const valuation = roundCurrency(newPieces * item.pricePerPiece)

        stockList[stockIndex] = {
          ...item,
          currentPieces: newPieces,
          valuation,
        }
        nextDb.finishedGoodsStock = stockList
      }

      // Also sync variant stock in products table
      const products = [...(nextDb.products || [])]
      let productUpdated = false
      for (let pIdx = 0; pIdx < products.length; pIdx++) {
        const product = products[pIdx]
        const vIdx = (product.variants || []).findIndex((v) => v.id === input.itemId)
        if (vIdx !== -1) {
          const variants = [...product.variants]
          const oldStock = variants[vIdx].stockPieces || 0
          const updatedPieces = Math.max(0, oldStock + signedQtyChange)
          variants[vIdx] = {
            ...variants[vIdx],
            stockPieces: updatedPieces,
          }
          products[pIdx] = { ...product, variants }
          productUpdated = true
          break
        }
      }
      if (productUpdated) {
        nextDb.products = products
      }
    } else {
      // Raw Material
      const materials = [...(nextDb.materials || [])]
      const mIndex = materials.findIndex((m) => m.id === input.itemId)
      if (mIndex !== -1) {
        const mat = materials[mIndex]
        itemName = mat.name
        const newAvailable = Math.max(0, mat.availableQuantity + signedQtyChange)
        materials[mIndex] = {
          ...mat,
          availableQuantity: newAvailable,
        }
        nextDb.materials = materials
      }
    }

    const movement: InventoryMovement = {
      id: generateId('mov'),
      date: input.date,
      itemType: input.itemType,
      itemId: input.itemId,
      itemName,
      movementType: input.movementType,
      quantityChange: signedQtyChange,
      unit: input.itemType === 'finished_goods' ? 'pieces' : 'meters',
      referenceType: input.referenceType as InventoryMovement['referenceType'],
      referenceId: input.referenceId,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    }

    nextDb.inventoryMovements = [...(nextDb.inventoryMovements || []), movement]

    return {
      db: nextDb,
      movement,
    }
  }

  /**
   * Computes the net stock for an item by summing all its historical movements.
   */
  public calculateStockFromMovements(db: SeedDatabase, itemId: string): number {
    const movements = (db.inventoryMovements || []).filter((m) => m.itemId === itemId)
    return movements.reduce((sum, m) => sum + m.quantityChange, 0)
  }
}

export const stockEngine = new StockEngine()

