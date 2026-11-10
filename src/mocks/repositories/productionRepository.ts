import { ProductionEntry, ProductionOrder } from '@/types/production'
import {
  calculateEmployeeWage,
  roundCurrency,
} from '@/lib/calculations/financialCalculations'
import { mockStorage } from '../storage/localStorageAdapter'

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
    const db = mockStorage.getDatabase()

    // Normalize to pieces: 1 dozen = 12 pieces
    const totalPieces =
      input.inputUnit === 'dozen' ? input.inputQuantity * 12 : input.inputQuantity

    // Calculate earned wage for the operator
    const calculatedWage =
      input.inputUnit === 'dozen'
        ? calculateEmployeeWage({
            rateType: 'dozen',
            baseRate: input.applicableWageRate,
            completedPieces: totalPieces,
          })
        : calculateEmployeeWage({
            rateType: 'piece',
            baseRate: input.applicableWageRate,
            completedPieces: input.goodQuantityPieces,
          })

    const entry: ProductionEntry = {
      id: `prd-ent-${Date.now()}`,
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

    db.productionEntries.unshift(entry)

    // Update finished goods inventory if approved
    const stockItem = db.finishedGoodsStock.find((s) => s.variantId === input.variantId)
    if (stockItem) {
      stockItem.currentPieces += input.goodQuantityPieces
      stockItem.valuation = roundCurrency(stockItem.currentPieces * stockItem.pricePerPiece)
    }

    // Update employee wage ledger
    const employee = db.employees.find((e) => e.id === input.employeeId)
    if (employee) {
      employee.totalEarnedWages = roundCurrency(employee.totalEarnedWages + calculatedWage)
      employee.currentPayableBalance = roundCurrency(
        employee.currentPayableBalance + calculatedWage
      )

      const ledger = db.employeeLedger[employee.id] || []
      const prevBal = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0
      ledger.push({
        id: `eledg-${Date.now()}`,
        date: input.productionDate,
        type: 'wage_earned',
        description: `Production Wage: ${input.goodQuantityPieces} pcs (${input.productName} Size ${input.size})`,
        debit: 0,
        credit: calculatedWage,
        balance: roundCurrency(prevBal + calculatedWage),
      })
      db.employeeLedger[employee.id] = ledger
    }

    // Log stock movement into inventory
    if (input.goodQuantityPieces > 0) {
      db.inventoryMovements.unshift({
        id: `inv-mov-${Date.now()}`,
        date: input.productionDate,
        itemType: 'finished_goods',
        itemId: input.variantId,
        itemName: `${input.productName} (Size ${input.size})`,
        movementType: 'production_receipt',
        quantityChange: input.goodQuantityPieces,
        unit: 'pieces',
        referenceType: 'production',
        referenceId: entry.id,
        notes: `Production output from ${input.employeeName} (${input.goodQuantityPieces} pcs)`,
        createdAt: new Date().toISOString(),
      })
    }

    mockStorage.saveDatabase(db)
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
    const code = `PO-2026-${Date.now().toString().slice(-4)}`
    const order: ProductionOrder = {
      id: `prd-ord-${Date.now()}`,
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
    db.productionOrders.unshift(order)
    mockStorage.saveDatabase(db)
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
    mockStorage.saveDatabase(db)
  }

  public async approveEntry(entryId: string): Promise<ProductionEntry> {
    const db = mockStorage.getDatabase()
    const entry = db.productionEntries.find((e) => e.id === entryId)
    if (!entry) throw new Error(`Production entry not found: ${entryId}`)

    if (entry.status !== 'approved') {
      entry.status = 'approved'

      // Update finished goods inventory stock
      const stockItem = db.finishedGoodsStock.find((s) => s.variantId === entry.variantId)
      if (stockItem) {
        stockItem.currentPieces += entry.goodQuantityPieces
        stockItem.valuation = roundCurrency(stockItem.currentPieces * stockItem.pricePerPiece)
      }

      // Record movement
      db.inventoryMovements.unshift({
        id: `inv-mov-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        itemType: 'finished_goods',
        itemId: entry.variantId,
        itemName: `${entry.productName} (Size ${entry.size})`,
        movementType: 'production_receipt',
        quantityChange: entry.goodQuantityPieces,
        unit: 'pieces',
        referenceType: 'production',
        referenceId: entry.id,
        notes: `QC approval: ${entry.goodQuantityPieces} pcs passed`,
        createdAt: new Date().toISOString(),
      })

      mockStorage.saveDatabase(db)
    }

    return entry
  }
}

export const productionRepository = new ProductionRepository()
