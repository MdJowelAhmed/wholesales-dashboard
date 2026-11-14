/**
 * Central financial and production calculation rules for Garments SaaS.
 */
export interface LineItemCalculation {
  quantityPieces: number
  pricePerPiece: number
  discount?: number
}

export type WageRateType = 'piece' | 'dozen' | 'monthly_fixed'

export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

/**
 * Normalizes input quantities in piece, dozen, or bundle into integer pieces.
 */
export function toPieces(
  qty: number,
  unit: 'piece' | 'dozen' | 'bundle',
  piecesPerBundle: number = 6
): number {
  if (qty < 0) throw new Error('Quantity must be non-negative')
  switch (unit) {
    case 'piece': return Math.round(qty)
    case 'dozen': return Math.round(qty * 12)
    case 'bundle': return Math.round(qty * (piecesPerBundle || 6))
    default: return Math.round(qty)
  }
}

export function calculatePieceWage(goodPieces: number, ratePerPiece: number): number {
  if (goodPieces < 0 || ratePerPiece < 0) throw new Error('Good pieces and rate must be non-negative')
  return roundCurrency(goodPieces * ratePerPiece)
}

export function calculateDozenWage(goodPieces: number, ratePerDozen: number): number {
  if (goodPieces < 0 || ratePerDozen < 0) throw new Error('Good pieces and rate must be non-negative')
  return roundCurrency((goodPieces / 12) * ratePerDozen)
}

export function calculateLineTotal(
  quantityPieces: number,
  pricePerPiece: number,
  discount: number = 0
): number {
  if (quantityPieces < 0 || pricePerPiece < 0 || discount < 0) {
    throw new Error('Quantity, price per piece, and discount must be non-negative')
  }
  return roundCurrency(Math.max(0, quantityPieces * pricePerPiece - discount))
}

export function calculateInvoiceTotal(
  items: LineItemCalculation[],
  orderDiscount: number = 0,
  tax: number = 0
): { subtotal: number; discount: number; tax: number; total: number } {
  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + calculateLineTotal(item.quantityPieces, item.pricePerPiece, item.discount || 0), 0)
  )
  const totalAfterDiscount = Math.max(0, subtotal - orderDiscount)
  return {
    subtotal,
    discount: roundCurrency(orderDiscount),
    tax: roundCurrency(tax),
    total: roundCurrency(totalAfterDiscount + tax),
  }
}

export function calculateOutstandingBalance(
  totalInvoiced: number,
  totalPaid: number,
  returnCredit: number = 0
): number {
  return roundCurrency(totalInvoiced - totalPaid - returnCredit)
}

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
  monthlySalary = 0,
}: {
  rateType: WageRateType
  baseRate?: number
  completedPieces?: number
  completedDozens?: number
  monthlySalary?: number
}): number {
  const rate = baseRate || 0

  switch (rateType) {
    case 'piece':
      return calculatePieceWage(completedPieces, rate)

    case 'dozen': {
      const piecesEquivalent = completedPieces + completedDozens * 12
      return calculateDozenWage(piecesEquivalent, rate)
    }

    case 'monthly_fixed':
      return roundCurrency(monthlySalary)

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
 * Values on-hand raw material stock using quantity × average cost (inventory asset proxy for P&L COGS context).
 */
export function calculateRawMaterialInventoryValuation(
  materials: Array<{ availableQuantity: number; averageCost: number }>
): number {
  const total = materials.reduce(
    (sum, material) => sum + Math.max(0, material.availableQuantity) * Math.max(0, material.averageCost),
    0
  )
  return roundCurrency(total)
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
  actualMaterialCost: number
  expenses: number
  wages: number
}

export interface PnLMetrics {
  grossRevenue: number
  actualMaterialCost: number
  totalWages: number
  totalExpenses: number
  operatingExpenses: number
  netOperatingProfit: number
  profitMargin: number
}

/**
 * Calculates Profit & Loss (P&L) metrics based on revenues, COGS (actual consumed material cost),
 * wages, and operating expenses. Unsold consignment goods are NOT counted as revenue.
 */
export function calculatePnLMetrics(input: PnLInput): PnLMetrics {
  const grossRevenue = roundCurrency(input.salesRevenue)
  const actualMaterialCost = roundCurrency(input.actualMaterialCost)
  const totalWages = roundCurrency(input.wages)
  const totalExpenses = roundCurrency(input.expenses)
  const operatingExpenses = roundCurrency(totalExpenses + totalWages)
  const netOperatingProfit = roundCurrency(grossRevenue - actualMaterialCost - operatingExpenses)
  const profitMargin = grossRevenue > 0 ? roundCurrency((netOperatingProfit / grossRevenue) * 100) : 0

  return {
    grossRevenue,
    actualMaterialCost,
    totalWages,
    totalExpenses,
    operatingExpenses,
    netOperatingProfit,
    profitMargin,
  }
}

