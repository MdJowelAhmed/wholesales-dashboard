import { BaseEntity } from './common'

export interface ProductionEntry extends BaseEntity {
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
  totalPieces: number // normalized to pieces
  applicableWageRate: number
  calculatedWage: number
  goodQuantityPieces: number
  damagedQuantityPieces: number
  status: 'pending_inspection' | 'approved' | 'rejected'
  notes?: string
}

export interface ProductionOrder extends BaseEntity {
  orderCode: string
  productId: string
  productName: string
  targetQuantityPieces: number
  completedPieces: number
  startDate: string
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
}
