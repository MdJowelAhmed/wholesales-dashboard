/**
 * Central financial and production calculation rules for Garments SaaS.
 * All finished garment pricing is per piece.
 * Quantities are normalized in integer pieces.
 * Amounts are rounded to 2 decimal places to avoid floating-point issues.
 */

export interface LineItemCalculation {
  quantityPieces: number
  pricePerPiece: number
  discount?: number
}

export type WageRateType = 'piece' | 'dozen' | 'monthly_fixed' | 'monthly_plus_incentive'

/**
 * Rounds a number strictly to two decimal places
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

/**
 * Calculates line total for garment sales or deliveries.
 * Line total = (quantity in pieces * per-piece price) - discount
 */
export function calculateLineTotal(
  quantityPieces: number,
  pricePerPiece: number,
  discount: number = 0
): number {
  if (quantityPieces < 0 || pricePerPiece < 0 || discount < 0) {
    throw new Error('Quantity, price per piece, and discount must be non-negative')
  }
  const gross = quantityPieces * pricePerPiece
  const net = Math.max(0, gross - discount)
  return roundCurrency(net)
}

/**
 * Calculates invoice grand total
 */
export function calculateInvoiceTotal(
  items: LineItemCalculation[],
  orderDiscount: number = 0,
  tax: number = 0
): {
  subtotal: number
  discount: number
  tax: number
  total: number
} {
  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + calculateLineTotal(item.quantityPieces, item.pricePerPiece, item.discount || 0), 0)
  )
  const totalAfterDiscount = Math.max(0, subtotal - orderDiscount)
  const total = roundCurrency(totalAfterDiscount + tax)

  return {
    subtotal,
    discount: roundCurrency(orderDiscount),
    tax: roundCurrency(tax),
    total,
  }
}

/**
 * Calculates outstanding balance
 * Outstanding = total invoiced - total paid - total return credits
 */
export function calculateOutstandingBalance(
  totalInvoiced: number,
  totalPaid: number,
  returnCredit: number = 0
): number {
  const balance = totalInvoiced - totalPaid - returnCredit
  return roundCurrency(balance)
}

/**
 * Calculates return credit for returned pieces
 */
export function calculateReturnCredit(
  returnedPieces: number,
  originalPricePerPiece: number
): number {
  if (returnedPieces < 0 || originalPricePerPiece < 0) {
    throw new Error('Return pieces and price must be non-negative')
  }
  return roundCurrency(returnedPieces * originalPricePerPiece)
}

/**
 * Calculates employee wage according to compensation method.
 * For dozen rate: 1 dozen = 12 pieces. Dozen rate per piece = dozenRate / 12.
 */
export function calculateEmployeeWage({
  rateType,
  baseRate,
  completedPieces = 0,
  completedDozens = 0,
  incentiveAmount = 0,
  monthlySalary = 0,
}: {
  rateType: WageRateType
  baseRate?: number
  completedPieces?: number
  completedDozens?: number
  incentiveAmount?: number
  monthlySalary?: number
}): number {
  const rate = baseRate || 0

  switch (rateType) {
    case 'piece':
      return roundCurrency(completedPieces * rate + incentiveAmount)

    case 'dozen': {
      // If pieces are provided, normalize: each piece is rate / 12
      const piecesEquivalent = completedPieces + completedDozens * 12
      const dozenWages = (piecesEquivalent / 12) * rate
      return roundCurrency(dozenWages + incentiveAmount)
    }

    case 'monthly_fixed':
      return roundCurrency(monthlySalary)

    case 'monthly_plus_incentive':
      return roundCurrency(monthlySalary + incentiveAmount)

    default:
      return 0
  }
}

/**
 * Formats a monetary number in Bangladeshi Taka (BDT)
 */
export function formatBDT(amount: number): string {
  const rounded = roundCurrency(amount)
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(rounded)
    .replace('BDT', '৳')
    .trim()
}

/**
 * Calculates stock valuation: pieces * price per piece
 */
export function calculateStockValuation(pieces: number, pricePerPiece: number): number {
  if (pieces < 0 || pricePerPiece < 0) {
    throw new Error('Pieces and price per piece must be non-negative')
  }
  return roundCurrency(pieces * pricePerPiece)
}

/**
 * Calculates production efficiency percentage: (goodPieces / totalPieces) * 100
 */
export function calculateProductionEfficiency(goodPieces: number, totalPieces: number): number {
  if (totalPieces <= 0) return 0
  if (goodPieces < 0) throw new Error('Good pieces cannot be negative')
  const percentage = (goodPieces / totalPieces) * 100
  return roundCurrency(Math.min(100, Math.max(0, percentage)))
}

/**
 * Calculates raw material consumption: pieces produced * consumption per piece
 */
export function calculateRawMaterialConsumption(
  piecesProduced: number,
  consumptionPerPiece: number
): number {
  if (piecesProduced < 0 || consumptionPerPiece < 0) {
    throw new Error('Pieces produced and consumption per piece must be non-negative')
  }
  return roundCurrency(piecesProduced * consumptionPerPiece)
}

/**
 * Calculates net payable wages after deductions and advances
 */
export function calculateNetPayrollPayable({
  monthlySalary = 0,
  pieceRateEarnings = 0,
  incentives = 0,
  adjustments = 0,
  advancesDeducted = 0,
}: {
  monthlySalary?: number
  pieceRateEarnings?: number
  incentives?: number
  adjustments?: number
  advancesDeducted?: number
}): number {
  const gross = monthlySalary + pieceRateEarnings + incentives + adjustments
  const net = Math.max(0, gross - advancesDeducted)
  return roundCurrency(net)
}

export interface PnLInput {
  salesRevenue: number
  dispatchedValue: number
  expenses: number
  wages: number
  materialCostPercentage?: number
}

export interface PnLMetrics {
  grossRevenue: number
  estimatedMaterialCost: number
  totalWages: number
  totalExpenses: number
  operatingExpenses: number
  netOperatingProfit: number
  profitMargin: number
}

/**
 * Calculates Profit & Loss (P&L) metrics based on revenues, COGS, wages, and operating expenses.
 */
export function calculatePnLMetrics(input: PnLInput): PnLMetrics {
  const grossRevenue = roundCurrency(input.salesRevenue + input.dispatchedValue)
  const materialCostRate = input.materialCostPercentage ?? 0.45
  const estimatedMaterialCost = roundCurrency(grossRevenue * materialCostRate)
  const totalWages = roundCurrency(input.wages)
  const totalExpenses = roundCurrency(input.expenses)
  const operatingExpenses = roundCurrency(totalExpenses + totalWages)
  const netOperatingProfit = roundCurrency(grossRevenue - estimatedMaterialCost - operatingExpenses)
  const profitMargin = grossRevenue > 0 ? roundCurrency((netOperatingProfit / grossRevenue) * 100) : 0

  return {
    grossRevenue,
    estimatedMaterialCost,
    totalWages,
    totalExpenses,
    operatingExpenses,
    netOperatingProfit,
    profitMargin,
  }
}

