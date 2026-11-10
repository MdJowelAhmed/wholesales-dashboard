import React from 'react'
import { Customer } from '@/types/sales'
import { Shopkeeper } from '@/types/shopkeepers'

interface CustomerChannelSelectorProps {
  customerType: 'retail_customer' | 'wholesale_shopkeeper'
  customers: Customer[]
  shopkeepers: Shopkeeper[]
  onCustomerTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onPartySelect: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export function CustomerChannelSelector({
  customerType,
  customers,
  shopkeepers,
  onCustomerTypeChange,
  onPartySelect,
}: CustomerChannelSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">Channel / Customer Type *</label>
        <select
          value={customerType}
          onChange={onCustomerTypeChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="retail_customer">Retail / Walk-In Outlet Customer</option>
          <option value="wholesale_shopkeeper">Wholesale Shopkeeper (Market Credit)</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">Select Registered Account</label>
        <select
          onChange={onPartySelect}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {customerType === 'wholesale_shopkeeper'
            ? shopkeepers.map((sk) => (
                <option key={sk.id} value={sk.id}>
                  {sk.shopName} ({sk.marketName})
                </option>
              ))
            : customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
        </select>
      </div>
    </div>
  )
}

