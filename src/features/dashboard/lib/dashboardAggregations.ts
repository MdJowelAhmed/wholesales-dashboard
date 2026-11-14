import { Product } from '@/types/products'
import { Sale } from '@/types/sales'
import { ProductionEntry } from '@/types/production'
import { calculateStockValuation, roundCurrency } from '@/lib/calculations/financialCalculations'

export interface MonthlyTrendPoint {
  month: string
  sales: number
  production: number
}

export interface CategoryDistributionPoint {
  category: string
  pieces: number
  valuation: number
}

export function buildCategoryDistribution(products: Product[]): CategoryDistributionPoint[] {
  const byCategory = new Map<string, { pieces: number; valuation: number }>()

  for (const product of products) {
    const category = product.category?.trim() || 'Uncategorized'
    const pieces =
      product.variants?.reduce((sum, variant) => sum + (variant.stockPieces ?? 0), 0) ?? 0
    const valuation =
      product.variants?.reduce(
        (sum, variant) =>
          sum +
          calculateStockValuation(
            variant.stockPieces ?? 0,
            variant.pricePerPiece ?? 0
          ),
        0
      ) ?? 0

    const current = byCategory.get(category) ?? { pieces: 0, valuation: 0 }
    byCategory.set(category, {
      pieces: current.pieces + pieces,
      valuation: current.valuation + valuation,
    })
  }

  return Array.from(byCategory.entries())
    .map(([category, stats]) => ({
      category,
      pieces: stats.pieces,
      valuation: stats.valuation,
    }))
    .sort((a, b) => b.valuation - a.valuation)
}

export function buildMonthlyOperationsTrend(
  sales: Sale[],
  productionEntries: ProductionEntry[],
  monthCount = 6
): MonthlyTrendPoint[] {
  const now = new Date()
  const buckets: Array<MonthlyTrendPoint & { key: string }> = []

  for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    buckets.push({
      month: d.toLocaleString('en-US', { month: 'short' }),
      sales: 0,
      production: 0,
      key: `${d.getFullYear()}-${d.getMonth()}`,
    })
  }

  for (const sale of sales) {
    const saleDate = new Date(sale.date)
    if (Number.isNaN(saleDate.getTime())) continue
    const key = `${saleDate.getFullYear()}-${saleDate.getMonth()}`
    const bucket = buckets.find((b) => b.key === key)
    if (bucket) {
      bucket.sales += sale.totalAmount
    }
  }

  for (const entry of productionEntries) {
    const prodDate = new Date(entry.productionDate)
    if (Number.isNaN(prodDate.getTime())) continue
    const key = `${prodDate.getFullYear()}-${prodDate.getMonth()}`
    const bucket = buckets.find((b) => b.key === key)
    if (bucket) {
      bucket.production += entry.calculatedWage ?? 0
    }
  }

  return buckets.map(({ month, sales: salesTotal, production }) => ({
    month,
    sales: roundCurrency(salesTotal),
    production: roundCurrency(production),
  }))
}

/** @deprecated Use buildMonthlyOperationsTrend */
export function buildMonthlySalesTrend(sales: Sale[], monthCount = 6): MonthlyTrendPoint[] {
  return buildMonthlyOperationsTrend(sales, [], monthCount)
}