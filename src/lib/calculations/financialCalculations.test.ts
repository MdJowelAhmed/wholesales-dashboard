import { describe, it, expect } from 'vitest'
import {
  calculateLineTotal,
  calculateInvoiceTotal,
  calculateOutstandingBalance,
  calculateReturnCredit,
  calculateEmployeeWage,
  formatBDT,
  roundCurrency,
  calculateStockValuation,
  calculateProductionEfficiency,
  calculateRawMaterialConsumption,
  calculateNetPayrollPayable,
  toPieces,
  calculatePieceWage,
  calculateDozenWage,
  calculatePnLMetrics,
  calculateRawMaterialInventoryValuation,
  calculateRawMaterialConsumptionCost,
} from './financialCalculations'

describe('financialCalculations', () => {
  describe('calculateLineTotal', () => {
    it('calculates line total accurately as quantity * price per piece', () => {
      // 6 pieces * BDT 320 = BDT 1,920
      expect(calculateLineTotal(6, 320)).toBe(1920)
    })

    it('subtracts item discount accurately', () => {
      expect(calculateLineTotal(10, 150, 100)).toBe(1400)
    })

    it('throws error for negative values', () => {
      expect(() => calculateLineTotal(-1, 100)).toThrow()
      expect(() => calculateLineTotal(5, -10)).toThrow()
    })
  })

  describe('calculateInvoiceTotal', () => {
    it('sums multiple line items, applies order discount and tax', () => {
      const items = [
        { quantityPieces: 10, pricePerPiece: 200 }, // 2000
        { quantityPieces: 5, pricePerPiece: 400, discount: 100 }, // 1900
      ]
      const result = calculateInvoiceTotal(items, 100, 50)
      expect(result.subtotal).toBe(3900)
      expect(result.discount).toBe(100)
      expect(result.tax).toBe(50)
      expect(result.total).toBe(3850)
    })
  })

  describe('calculateOutstandingBalance', () => {
    it('calculates remaining balance correctly with payments and return credits', () => {
      // Total 10,000, Paid 6,000, Returned 1,000 -> 3,000
      expect(calculateOutstandingBalance(10000, 6000, 1000)).toBe(3000)
    })
  })

  describe('calculateReturnCredit', () => {
    it('multiplies returned pieces by original per-piece price', () => {
      expect(calculateReturnCredit(4, 350)).toBe(1400)
    })
  })

  describe('calculateEmployeeWage', () => {
    it('calculates piece-rate wages correctly', () => {
      expect(
        calculateEmployeeWage({
          rateType: 'piece',
          baseRate: 25,
          completedPieces: 80,
        })
      ).toBe(2000)
    })

    it('calculates dozen-rate wages correctly (1 dozen = 12 pieces)', () => {
      // 24 pieces = 2 dozens @ 120/dozen = 240
      expect(
        calculateEmployeeWage({
          rateType: 'dozen',
          baseRate: 120,
          completedPieces: 24,
        })
      ).toBe(240)
    })

    it('calculates fixed monthly salary', () => {
      expect(
        calculateEmployeeWage({
          rateType: 'monthly_fixed',
          monthlySalary: 22000,
        })
      ).toBe(22000)
    })
  })

  describe('formatBDT', () => {
    it('formats numbers with BDT symbol', () => {
      const formatted = formatBDT(1500)
      expect(formatted).toContain('1,500.00')
      expect(formatted).toContain('৳')
    })
  })

  describe('calculateStockValuation', () => {
    it('calculates valuation as pieces * price per piece', () => {
      expect(calculateStockValuation(150, 320)).toBe(48000)
    })

    it('throws for negative values', () => {
      expect(() => calculateStockValuation(-5, 200)).toThrow()
    })
  })

  describe('calculateProductionEfficiency', () => {
    it('calculates efficiency percentage correctly', () => {
      expect(calculateProductionEfficiency(95, 100)).toBe(95)
      expect(calculateProductionEfficiency(118, 120)).toBe(98.33)
    })

    it('returns 0 when total pieces is 0', () => {
      expect(calculateProductionEfficiency(0, 0)).toBe(0)
    })
  })

  describe('calculateRawMaterialConsumption', () => {
    it('calculates fabric consumption accurately', () => {
      // 500 polo shirts * 0.28 kg fabric = 140 kg
      expect(calculateRawMaterialConsumption(500, 0.28)).toBe(140)
    })
  })

  describe('calculateNetPayrollPayable', () => {
    it('computes gross wages minus advances accurately', () => {
      // 15000 salary + 2000 incentive - 3000 advance = 14000
      expect(
        calculateNetPayrollPayable({
          monthlySalary: 15000,
          incentives: 2000,
          advancesDeducted: 3000,
        })
      ).toBe(14000)
    })

    it('returns zero when deductions exceed gross', () => {
      expect(
        calculateNetPayrollPayable({
          monthlySalary: 5000,
          advancesDeducted: 7000,
        })
      ).toBe(0)
    })
  })

  describe('roundCurrency', () => {
    it('rounds numbers to two decimals correctly', () => {
      expect(roundCurrency(123.456)).toBe(123.46)
      expect(roundCurrency(123.454)).toBe(123.45)
    })
  })

  describe('toPieces', () => {
    it('converts pieces, dozens, and bundles accurately', () => {
      expect(toPieces(10, 'piece')).toBe(10)
      expect(toPieces(2, 'dozen')).toBe(24)
      expect(toPieces(5, 'bundle')).toBe(30)
      expect(toPieces(3, 'bundle', 10)).toBe(30)
    })
  })

  describe('calculatePieceWage and calculateDozenWage', () => {
    it('calculates wage on good pieces only', () => {
      expect(calculatePieceWage(50, 12)).toBe(600)
      expect(calculateDozenWage(24, 120)).toBe(240)
      expect(calculateDozenWage(18, 120)).toBe(180)
    })
  })

  describe('calculateRawMaterialConsumptionCost', () => {
    it('sums material_issue movements at average cost', () => {
      expect(
        calculateRawMaterialConsumptionCost(
          [
            {
              itemType: 'raw_material',
              movementType: 'material_issue',
              itemId: 'mat-1',
              quantityChange: -40,
            },
          ],
          [{ id: 'mat-1', averageCost: 100 }]
        )
      ).toBe(4000)
    })
  })

  describe('calculateRawMaterialInventoryValuation', () => {
    it('sums available quantity times average cost', () => {
      expect(
        calculateRawMaterialInventoryValuation([
          { availableQuantity: 100, averageCost: 50 },
          { availableQuantity: 20, averageCost: 200 },
        ])
      ).toBe(9000)
    })
  })

  describe('calculatePnLMetrics', () => {
    it('calculates P&L metrics using actualMaterialCost and without counting unsold consignment', () => {
      const pnl = calculatePnLMetrics({
        salesRevenue: 70000,
        actualMaterialCost: 25000,
        wages: 15000,
        expenses: 5000,
      })

      expect(pnl.grossRevenue).toBe(70000)
      expect(pnl.actualMaterialCost).toBe(25000)
      expect(pnl.totalWages).toBe(15000)
      expect(pnl.totalExpenses).toBe(5000)
      expect(pnl.operatingExpenses).toBe(20000)
      expect(pnl.netOperatingProfit).toBe(25000)
      expect(pnl.profitMargin).toBe(35.71)
    })
  })
})
