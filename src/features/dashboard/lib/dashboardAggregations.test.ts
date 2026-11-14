import { describe, it, expect } from 'vitest'
import { buildMonthlyOperationsTrend } from './dashboardAggregations'

describe('dashboardAggregations', () => {
  it('aggregates sales and production wages into monthly buckets', () => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-10`

    const trend = buildMonthlyOperationsTrend(
      [
        {
          id: 's1',
          invoiceNumber: 'INV-1',
          date: dateStr,
          customerName: 'Test',
          customerType: 'retail_customer',
          customerId: 'c1',
          saleType: 'own_shop',
          items: [],
          subtotal: 10000,
          discount: 0,
          totalAmount: 10000,
          paidAmount: 10000,
          outstandingBalance: 0,
          paymentMethod: 'cash',
          status: 'paid',
          createdAt: dateStr,
        },
      ],
      [
        {
          id: 'p1',
          productionDate: dateStr,
          orderCode: 'PO-1',
          productId: 'prod',
          productName: 'Shirt',
          variantId: 'var',
          sku: 'SKU',
          size: 'M',
          employeeId: 'e1',
          employeeName: 'Worker',
          inputUnit: 'piece',
          inputQuantity: 100,
          totalPieces: 100,
          applicableWageRate: 15,
          calculatedWage: 1500,
          goodQuantityPieces: 100,
          damagedQuantityPieces: 0,
          status: 'approved',
          createdAt: dateStr,
        },
      ],
      6
    )

    const current = trend.find((b) => b.sales > 0 || b.production > 0)
    expect(current).toBeDefined()
    expect(current?.sales).toBe(10000)
    expect(current?.production).toBe(1500)
  })
})