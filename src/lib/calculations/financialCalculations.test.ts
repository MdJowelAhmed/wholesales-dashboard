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
          incentiveAmount: 100,
        })
      ).toBe(2100)
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
})
