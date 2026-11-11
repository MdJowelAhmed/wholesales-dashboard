export type LedgerPartyType = 'customer' | 'supplier' | 'employee' | 'shopkeeper'

export type LedgerEntryType =
  | 'sale'
  | 'purchase'
  | 'payment'
  | 'return'
  | 'work'
  | 'salary'
  | 'advance'
  | 'adjustment'
  | 'reversal'

export interface LedgerEntry {
  id: string
  partyType: LedgerPartyType
  partyId: string
  date: string
  type: LedgerEntryType
  refType: string
  refId: string
  debit: number
  credit: number
  balanceAfter: number
  balance?: number
  note?: string
  reversalOf?: string
  createdAt?: string
}

export interface AppendLedgerEntryInput {
  partyType: LedgerPartyType
  partyId: string
  date: string
  type: LedgerEntryType
  refType: string
  refId: string
  debit: number
  credit: number
  note?: string
  reversalOf?: string
}
