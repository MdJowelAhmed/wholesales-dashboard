import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { PaymentFormData } from './unifiedPaymentSchema'

interface PaymentAmountFieldsProps {
  register: UseFormRegister<PaymentFormData>
  errors: FieldErrors<PaymentFormData>
}

export function PaymentAmountFields({ register, errors }: PaymentAmountFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Payment Date *</label>
          <Input type="date" {...register('date')} className="bg-background" />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Amount (৳ BDT) *</label>
          <Input
            type="number"
            step="0.01"
            min={1}
            {...register('amount', { valueAsNumber: true })}
            className="bg-background"
          />
          {errors.amount && (
            <p className="text-xs text-destructive">{errors.amount.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Payment Method *</label>
          <select
            {...register('paymentMethod')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="cash">Cash (নগদ)</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="bkash">bKash (বিকাশ)</option>
            <option value="nagad">Nagad (নগদ)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Txn ID / Cheque #</label>
          <Input
            type="text"
            placeholder="e.g. TR-998812 / CHQ-102"
            {...register('reference')}
            className="bg-background"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Remarks / Ledger Note</label>
        <Input
          type="text"
          placeholder="e.g. Partial settlement against delivery"
          {...register('notes')}
          className="bg-background"
        />
      </div>
    </>
  )
}

