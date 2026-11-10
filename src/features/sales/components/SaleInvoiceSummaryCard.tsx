import { UseFormRegister } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { SaleFormData } from './saleInvoiceSchema'

interface SaleInvoiceSummaryCardProps {
  subtotal: number
  total: number
  dueAmount: number
  register: UseFormRegister<SaleFormData>
}

export function SaleInvoiceSummaryCard({
  subtotal,
  total,
  dueAmount,
  register,
}: SaleInvoiceSummaryCardProps) {
  return (
    <>
      {/* Pricing & Payments Summary */}
      <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Items Subtotal:</span>
          <span className="font-mono font-semibold text-foreground">{formatBDT(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Order Discount (৳):</span>
          <div className="w-28">
            <Input
              type="number"
              step="any"
              className="h-8 text-xs font-mono"
              placeholder="0"
              {...register('orderDiscount', { valueAsNumber: true })}
            />
          </div>
        </div>
        <div className="flex justify-between font-bold text-sm border-t border-border pt-2">
          <span className="text-foreground">Grand Total:</span>
          <span className="font-mono text-primary">{formatBDT(total)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">
            Payment Collected Now (৳)
          </label>
          <Input
            type="number"
            step="any"
            placeholder="0"
            {...register('paidAmount', { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Payment Method</label>
          <select
            {...register('paymentMethod')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer (IBBL/City)</option>
            <option value="bkash">bKash Merchant</option>
            <option value="nagad">Nagad</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>
      </div>

      <div className="p-2 rounded bg-secondary text-secondary-foreground flex items-center justify-between text-xs">
        <span className="font-medium">Remaining Due Balance:</span>
        <span className="font-mono font-bold">{formatBDT(dueAmount)}</span>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">Invoice Notes</label>
        <Input placeholder="Transport challan, gate pass remarks" {...register('notes')} />
      </div>
    </>
  )
}

