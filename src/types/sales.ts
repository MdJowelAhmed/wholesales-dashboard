import { BaseEntity, PaymentMethod } from './common'

export interface CustomerLedgerEntry {
  id: string
  date: string
  type: 'sale' | 'payment' | 'return' | 'adjustment'
  reference: string
  description: string
  debit: number
  credit: number
  balance: number
}

export interface Customer extends BaseEntity {
  name: string
  phone: string
  address?: string
  totalPurchases: number
  totalPayments: number
  outstandingBalance: number
  lastPurchaseDate: string
  status: 'active' | 'inactive'
}

export interface SaleItem {
  id: string
  productId: string
  productName: string
  variantId: string
  sku: string
  size: string
  quantityPieces: number
  pricePerPiece: number
  discount: number
  lineTotal: number
}

export interface Sale extends BaseEntity {
  invoiceNumber: string
  date: string
  customerType: 'retail_customer' | 'wholesale_shopkeeper'
  customerId?: string
  customerName: string
  customerPhone?: string
  saleType: 'own_shop' | 'wholesale_credit'
  items: SaleItem[]
  subtotal: number
  discount: number
  totalAmount: number
  paidAmount: number
  outstandingBalance: number
  paymentMethod: PaymentMethod
  status: 'paid' | 'partial' | 'pending' | 'returned'
  notes?: string
}
