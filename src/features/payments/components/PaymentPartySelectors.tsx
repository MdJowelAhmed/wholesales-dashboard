import React from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Shopkeeper } from '@/types/shopkeepers'
import { Customer } from '@/types/sales'
import { Supplier } from '@/types/suppliers'
import { Employee } from '@/types/employees'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { PaymentFormData } from './unifiedPaymentSchema'

interface PartyInfo {
  name: string
  label: string
  balance: number
}

interface PaymentPartySelectorsProps {
  selectedPartyType: 'shopkeeper' | 'customer' | 'supplier' | 'employee'
  partyInfo?: PartyInfo | null
  shopkeepers: Shopkeeper[]
  customers: Customer[]
  suppliers: Supplier[]
  employees: Employee[]
  onPartyTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  register: UseFormRegister<PaymentFormData>
  errors: FieldErrors<PaymentFormData>
  lockParty?: boolean
  lockedPartyLabel?: string
}

export function PaymentPartySelectors({
  selectedPartyType,
  partyInfo,
  shopkeepers,
  customers,
  suppliers,
  employees,
  onPartyTypeChange,
  register,
  errors,
  lockParty = false,
  lockedPartyLabel,
}: PaymentPartySelectorsProps) {
  if (lockParty && lockedPartyLabel) {
    return (
      <>
        <input type="hidden" {...register('partyType')} />
        <input type="hidden" {...register('partyId')} />
        <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
          <div className="text-xs text-muted-foreground mb-1">Payment party</div>
          <div className="font-semibold text-foreground">{lockedPartyLabel}</div>
        </div>
        {partyInfo && (
          <div className="rounded-lg border border-border bg-muted/20 p-3 flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{partyInfo.label}:</span>
            <span className="font-semibold text-foreground">{formatBDT(partyInfo.balance)}</span>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Transaction Party Type *</label>
        <select
          value={selectedPartyType}
          onChange={onPartyTypeChange}
          disabled={lockParty}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="shopkeeper">Wholesale Shopkeeper (Collection In)</option>
          <option value="customer">Retail Customer (Collection In)</option>
          <option value="supplier">Material Supplier (Payment Out)</option>
          <option value="employee">Worker / Staff (Wage Payout)</option>
        </select>
      </div>

      {/* Party Dropdown */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Select Party *</label>
        <select
          {...register('partyId')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {selectedPartyType === 'shopkeeper' &&
            shopkeepers.map((sk) => (
              <option key={sk.id} value={sk.id}>
                {sk.shopName} - {sk.marketName} (Due: ৳{sk.outstandingBalance})
              </option>
            ))}
          {selectedPartyType === 'customer' &&
            customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone ? `(${c.phone})` : ''} (Due: ৳{c.outstandingBalance})
              </option>
            ))}
          {selectedPartyType === 'supplier' &&
            suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.contactPerson}) (Payable: ৳{s.outstandingPayable})
              </option>
            ))}
          {selectedPartyType === 'employee' &&
            employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} - {e.designation} (Payable: ৳{e.currentPayableBalance})
              </option>
            ))}
        </select>
        {errors.partyId && (
          <p className="text-xs text-destructive">{errors.partyId.message}</p>
        )}
      </div>

      {/* Party Balance Snapshot */}
      {partyInfo && (
        <div className="rounded-lg border border-border bg-muted/20 p-3 flex justify-between items-center text-xs">
          <span className="text-muted-foreground">{partyInfo.label}:</span>
          <span className="font-semibold text-foreground">{formatBDT(partyInfo.balance)}</span>
        </div>
      )}
    </>
  )
}
