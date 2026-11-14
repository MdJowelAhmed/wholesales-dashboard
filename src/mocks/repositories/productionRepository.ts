import { ProductionEntry, ProductionOrder } from '@/types/production'
import {
  calculateEmployeeWage,
  calculateRawMaterialConsumption,
  roundCurrency,
} from '@/lib/calculations/financialCalculations'
import { generateId } from '@/lib/ids'
import { mockStorage } from '../storage/localStorageAdapter'
import { STORAGE_SCOPES } from '../storage/storageScopes'

const PRODUCTION_WRITE_SCOPES = [
  STORAGE_SCOPES.PRODUCTION,
  STORAGE_SCOPES.EMPLOYEES,
  STORAGE_SCOPES.INVENTORY,
  STORAGE_SCOPES.PRODUCTS,
  STORAGE_SCOPES.FINANCE,
] as const
import { ledgerEngine } from './ledgerEngine'
import { stockEngine } from './stockEngine'

export class ProductionRepository {
  public async listOrders(): Promise<ProductionOrder[]> {
    const db = mockStorage.getDatabase()
    return db.productionOrders
  }

  public async listEntries(): Promise<ProductionEntry[]> {
    const db = mockStorage.getDatabase()
    return db.productionEntries
  }

  public async createProductionEntry(input: {
    productionDate: string
    orderCode: string
    productId: string
    productName: string
    variantId: string
    sku: string
    size: string
    employeeId: string
    employeeName: string
    inputUnit: 'piece' | 'dozen'
    inputQuantity: number
    applicableWageRate: number
    goodQuantityPieces: number
    damagedQuantityPieces: number
    notes?: string
  }): Promise<ProductionEntry> {
    let db = mockStorage.getDatabase()

    const totalPieces =
      input.inputUnit === 'dozen' ? input.inputQuantity * 12 : input.inputQuantity

    // One single rule: Wage is paid on GOOD pieces only
    const calculatedWage =
      input.inputUnit === 'dozen'
        ? calculateEmployeeWage({
            rateType: 'dozen',
            baseRate: input.applicableWageRate,
            completedPieces: input.goodQuantityPieces,
          })
        : calculateEmployeeWage({
            rateType: 'piece',
            baseRate: input.applicableWageRate,
            completedPieces: input.goodQuantityPieces,
          })

    const entryId = generateId('prd-ent')
    const entry: ProductionEntry = {
      id: entryId,
      productionDate: input.productionDate,
      orderCode: input.orderCode,
      productId: input.productId,
      productName: input.productName,
      variantId: input.variantId,
      sku: input.sku,
      size: input.size,
      employeeId: input.employeeId,
      employeeName: input.employeeName,
      inputUnit: input.inputUnit,
      inputQuantity: input.inputQuantity,
      totalPieces,
      applicableWageRate: input.applicableWageRate,
      calculatedWage,
      goodQuantityPieces: input.goodQuantityPieces,
      damagedQuantityPieces: input.damagedQuantityPieces,
      status: 'approved',
      notes: input.notes,
      createdAt: new Date().toISOString(),
    }

    db.productionEntries = [entry, ...db.productionEntries]

    // 1. Consume raw material (e.g. 0.25 kg fabric per garment)
    if (db.materials && db.materials.length > 0) {
      const material = db.materials[0]
      const consumedQty = calculateRawMaterialConsumption(
        input.goodQuantityPieces + input.damagedQuantityPieces,
        0.25
      )
      if (consumedQty > 0) {
        const res = stockEngine.recordMovement(db, {
          itemType: 'raw_material',
          itemId: material.id,
          movementType: 'material_issue',
          quantityPieces: consumedQty,
          referenceId: entry.id,
          referenceType: 'production',
          date: input.productionDate,
          notes: `Material issue for ${input.goodQuantityPieces} pcs (${input.productName})`,
        })
        db = res.db
      }
    }

    // 2. Add finished goods stock via stockEngine
    if (input.goodQuantityPieces > 0) {
      const stockItem = db.finishedGoodsStock?.find((s) => s.variantId === input.variantId)
      const res = stockEngine.recordMovement(db, {
        itemType: 'finished_goods',
        itemId: input.variantId,
        movementType: 'production_receipt',
        quantityPieces: input.goodQuantityPieces,
        unitPrice: stockItem?.pricePerPiece,
        referenceId: entry.id,
        referenceType: 'production',
        date: input.productionDate,
        notes: `Production output from ${input.employeeName} (${input.goodQuantityPieces} pcs)`,
      })
      db = res.db
    }

    // 3. Record wage earned in employee ledger via ledgerEngine
    if (calculatedWage > 0) {
      const employee = db.employees.find((e) => e.id === input.employeeId)
      if (employee) {
        employee.totalEarnedWages = roundCurrency(employee.totalEarnedWages + calculatedWage)
        const res = ledgerEngine.appendLedgerEntry(db, {
          partyType: 'employee',
          partyId: employee.id,
          date: input.productionDate,
          type: 'work',
          refType: 'production_entry',
          refId: entry.id,
          debit: 0,
          credit: calculatedWage,
          note: `Production Wage: ${input.goodQuantityPieces} pcs (${input.productName} Size ${input.size})`,
        })
        db = res.db
      }
    }

    mockStorage.saveDatabase(db, [...PRODUCTION_WRITE_SCOPES])
    return entry
  }

  public async createProductionOrder(input: {
    productId: string
    productName: string
    targetQuantityPieces: number
    startDate: string
    dueDate: string
  }): Promise<ProductionOrder> {
    const db = mockStorage.getDatabase()
    const code = `PO-2026-${generateId().slice(0, 4).toUpperCase()}`
    const order: ProductionOrder = {
      id: generateId('prd-ord'),
      orderCode: code,
      productId: input.productId,
      productName: input.productName,
      targetQuantityPieces: input.targetQuantityPieces,
      completedPieces: 0,
      startDate: input.startDate,
      dueDate: input.dueDate,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
    }
    db.productionOrders = [order, ...db.productionOrders]
    mockStorage.saveDatabase(db, [...PRODUCTION_WRITE_SCOPES])
    return order
  }

  public async updateOrderStatus(
    orderId: string,
    status: ProductionOrder['status']
  ): Promise<void> {
    const db = mockStorage.getDatabase()
    const order = db.productionOrders.find((o) => o.id === orderId)
    if (!order) throw new Error(`Production order not found: ${orderId}`)
    order.status = status
    mockStorage.saveDatabase(db, [...PRODUCTION_WRITE_SCOPES])
  }

  public async approveEntry(entryId: string): Promise<ProductionEntry> {
    let db = mockStorage.getDatabase()
    const entry = db.productionEntries.find((e) => e.id === entryId)
    if (!entry) throw new Error(`Production entry not found: ${entryId}`)

    if (entry.status !== 'approved') {
      entry.status = 'approved'

      // Update finished goods inventory stock via stockEngine
      const stockItem = db.finishedGoodsStock?.find((s) => s.variantId === entry.variantId)
      const res = stockEngine.recordMovement(db, {
        itemType: 'finished_goods',
        itemId: entry.variantId,
        movementType: 'production_receipt',
        quantityPieces: entry.goodQuantityPieces,
        unitPrice: stockItem?.pricePerPiece,
        referenceId: entry.id,
        referenceType: 'production',
        date: new Date().toISOString().split('T')[0],
        notes: `QC approval: ${entry.goodQuantityPieces} pcs passed`,
      })
      db = res.db
      mockStorage.saveDatabase(db, [...PRODUCTION_WRITE_SCOPES])
    }

    return entry
  }
}

export const productionRepository = new ProductionRepository()
