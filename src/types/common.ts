export type StatusType = 'paid' | 'pending' | 'overdue' | 'active' | 'inactive' | 'approved' | 'rejected'

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt?: string
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque' | 'bkash' | 'nagad'

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
