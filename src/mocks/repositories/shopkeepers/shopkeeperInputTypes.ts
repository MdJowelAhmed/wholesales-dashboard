import { ShopkeeperTransactionType } from '@/types/shopkeepers'

export interface RecordDeliveryInput {
  shopkeeperId: string
  date: string
  transactionType: ShopkeeperTransactionType
  items: Array<{
    productId: string
    productName: string
    variantId: string
    sku: string
    size: string
    quantityPieces: number
    pricePerPiece: number
  }>
  paidAmount?: number
  notes?: string
}

export interface SettleConsignmentItemInput {
  variantId: string
  soldPieces: number
}

export interface SettleConsignmentInput {
  shopkeeperId: string
  deliveryId: string
  items: SettleConsignmentItemInput[]
  date?: string
  notes?: string
}

export interface RecordShopkeeperPaymentInput {
  shopkeeperId: string
  date: string
  amount: number
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'bkash' | 'nagad'
  reference?: string
  notes?: string
}

export interface RecordShopkeeperReturnInput {
  shopkeeperId: string
  deliveryId: string
  variantId: string
  returnQuantityPieces: number
  condition: 'sellable' | 'damaged'
  reason: string
}