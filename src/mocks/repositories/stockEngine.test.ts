import { describe, it, expect } from 'vitest'
import { stockEngine } from './stockEngine'
import { getFreshSeedData, SeedDatabase } from '../seed'

describe('stockEngine', () => {
  it('records finished goods movements and updates both finishedGoodsStock and product variants', () => {
    let db: SeedDatabase = getFreshSeedData()
    const targetVariantId = db.finishedGoodsStock[0].variantId
    const initialPieces = db.finishedGoodsStock[0].currentPieces

    // Record production receipt (+50 pieces)
    const res1 = stockEngine.recordMovement(db, {
      date: '2026-11-01',
      itemType: 'finished_goods',
      itemId: targetVariantId,
      movementType: 'production_receipt',
      quantityPieces: 50,
      referenceType: 'production',
      referenceId: 'po-1',
    })
    db = res1.db

    const stockItem1 = db.finishedGoodsStock.find((s) => s.variantId === targetVariantId)
    expect(stockItem1?.currentPieces).toBe(initialPieces + 50)
    expect(res1.movement.quantityChange).toBe(50)

    // Record sale / delivery (-30 pieces)
    const res2 = stockEngine.recordMovement(db, {
      date: '2026-11-02',
      itemType: 'finished_goods',
      itemId: targetVariantId,
      movementType: 'sale',
      quantityPieces: 30,
      referenceType: 'delivery',
      referenceId: 'del-1',
    })
    db = res2.db

    const stockItem2 = db.finishedGoodsStock.find((s) => s.variantId === targetVariantId)
    expect(stockItem2?.currentPieces).toBe(initialPieces + 20)
    expect(res2.movement.quantityChange).toBe(-30)
  })

  it('records raw material issues and updates availableQuantity', () => {
    let db: SeedDatabase = getFreshSeedData()
    const targetMatId = db.materials[0].id
    const initialQty = db.materials[0].availableQuantity

    const res = stockEngine.recordMovement(db, {
      date: '2026-11-01',
      itemType: 'raw_material',
      itemId: targetMatId,
      movementType: 'material_issue',
      quantityPieces: 25,
      referenceType: 'production',
      referenceId: 'po-1',
    })
    db = res.db

    const mat = db.materials.find((m) => m.id === targetMatId)
    expect(mat?.availableQuantity).toBe(initialQty - 25)
    expect(res.movement.quantityChange).toBe(-25)
  })

  it('handles consignment movements (consignment_out reduces main stock, consignment_return restores stock)', () => {
    let db: SeedDatabase = getFreshSeedData()
    const targetVariantId = db.finishedGoodsStock[0].variantId
    const initialPieces = db.finishedGoodsStock[0].currentPieces

    // Consignment dispatched (-40 pcs)
    const res1 = stockEngine.recordMovement(db, {
      date: '2026-11-01',
      itemType: 'finished_goods',
      itemId: targetVariantId,
      movementType: 'consignment_out',
      quantityPieces: 40,
      referenceType: 'delivery',
      referenceId: 'del-cons-1',
    })
    db = res1.db

    let stockItem = db.finishedGoodsStock.find((s) => s.variantId === targetVariantId)
    expect(stockItem?.currentPieces).toBe(initialPieces - 40)

    // Unsold goods returned (+10 pcs)
    const res2 = stockEngine.recordMovement(db, {
      date: '2026-11-05',
      itemType: 'finished_goods',
      itemId: targetVariantId,
      movementType: 'consignment_return',
      quantityPieces: 10,
      referenceType: 'return',
      referenceId: 'ret-1',
    })
    db = res2.db

    stockItem = db.finishedGoodsStock.find((s) => s.variantId === targetVariantId)
    expect(stockItem?.currentPieces).toBe(initialPieces - 30)
  })
})

