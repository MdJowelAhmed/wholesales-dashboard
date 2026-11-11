import { BaseEntity, PaymentMethod } from './common'

export type ShopkeeperTransactionType = 'credit_sale' | 'consignment'

export interface ShopkeeperDeliveryItem {
  id: string
  productId: string
  productName: string
  variantId: string
  sku: string
  size: string
  quantityPieces: number // mandatory pieces
  pricePerPiece: number // mandatory per-piece pricing
  lineTotal: number
  returnedPieces: number
  sellableReturnedPieces: number
  damagedReturnedPieces: number
  soldPieces?: number
}

export interface ShopkeeperDelivery extends BaseEntity {
  deliveryNumber: string
  date: string
  transactionType: ShopkeeperTransactionType
  items: ShopkeeperDeliveryItem[]
  totalPieces: number
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
  settledAmount?: number
  notes?: string
}

export interface ShopkeeperPayment extends BaseEntity {
  receiptNumber: string
  date: string
  amount: number
  paymentMethod: PaymentMethod
  reference?: string
  notes?: string
}

export interface ShopkeeperReturnRecord extends BaseEntity {
  returnNumber: string
  date: string
  deliveryId: string
  deliveryNumber: string
  variantId: string
  productName: string
  size: string
  returnQuantityPieces: number
  pricePerPiece: number
  creditAmount: number
  condition: 'sellable' | 'damaged'
  reason: string
}

export interface ShopkeeperLedgerEntry {
  id: string
  date: string
  type: 'delivery_credit' | 'consignment_issue' | 'payment_received' | 'return_credit' | 'adjustment'
  reference: string
  description: string
  debit: number // delivery increases receivable
  credit: number // payments and returns decrease receivable
  balance: number
}

export interface Shopkeeper extends BaseEntity {
  shopName: string
  ownerName: string
  phone: string
  marketName: string // e.g. "Islampur Wholesale Market, Old Dhaka"
  address: string
  totalDeliveredValue: number
  totalPaymentsReceived: number
  totalReturnAdjustments: number
  outstandingBalance: number
  consignmentPiecesHeld: number
  lastTransactionDate: string
  status: 'active' | 'inactive'
}
