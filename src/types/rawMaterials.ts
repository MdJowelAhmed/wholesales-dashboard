import { BaseEntity } from './common'

export type MaterialUnit = 'meter' | 'kg' | 'gram' | 'piece' | 'yard' | 'cone'

export interface RawMaterial extends BaseEntity {
  name: string
  code: string
  category: string
  baseUnit: MaterialUnit
  availableQuantity: number
  reorderThreshold: number
  averageCost: number
  supplierId: string
  supplierName: string
  status: 'active' | 'inactive'
}

export interface MaterialMovement extends BaseEntity {
  materialId: string
  materialName: string
  type: 'purchase' | 'issue_production' | 'return' | 'adjustment'
  quantity: number
  unit: MaterialUnit
  referenceId?: string
  notes?: string
}
