import React, { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { financeRepository } from '@/mocks/repositories/financeRepository'
import { shopkeepersRepository } from '@/mocks/repositories/shopkeepersRepository'
import { salesRepository } from '@/mocks/repositories/salesRepository'
import { suppliersRepository } from '@/mocks/repositories/suppliersRepository'
import { employeesRepository } from '@/mocks/repositories/employeesRepository'
import { Shopkeeper } from '@/types/shopkeepers'
import { Customer } from '@/types/sales'
import { Supplier } from '@/types/suppliers'
import { Employee } from '@/types/employees'
import { toast } from 'sonner'
import { formatBDT } from '@/lib/calculations/financialCalculations'

const paymentSchema = z.object({
  partyType: z.enum(['shopkeeper', 'customer', 'supplier', 'employee']),
  partyId: z.string().min(1, 'Please select a party'),
  date: z.string().min(1, 'Date is required'),
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'cheque', 'bkash', 'nagad']),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface RecordUnifiedPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RecordUnifiedPaymentDialog({
  open,
  onOpenChange,
  onSuccess,
}: RecordUnifiedPaymentDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      partyType: 'shopkeeper',
      partyId: '',
      date: new Date().toISOString().split('T')[0],
      amount: 5000,
      paymentMethod: 'cash',
      reference: '',
      notes: '',
    },
  })

  useEffect(() => {
    async function loadParties() {
      try {
        const [skList, custList, supList, empList] = await Promise.all([
          shopkeepersRepository.listShopkeepers(),
          salesRepository.listCustomers(),
          suppliersRepository.listSuppliers(),
          employeesRepository.listEmployees(),
        ])
        setShopkeepers(skList)
        setCustomers(custList)
        setSuppliers(supList)
        setEmployees(empList)
        if (skList.length > 0) {
          setValue('partyId', skList[0].id)
        }
      } catch (err) {
        console.error('Failed to load parties for payment dialog', err)
      }
    }
    if (open) {
      loadParties()
    }
  }, [open, setValue])

  const selectedPartyType = useWatch({ control, name: 'partyType' })
  const selectedPartyId = useWatch({ control, name: 'partyId' })

  const handlePartyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pType = e.target.value as 'shopkeeper' | 'customer' | 'supplier' | 'employee'
    setValue('partyType', pType)
    if (pType === 'shopkeeper' && shopkeepers.length > 0) {
      setValue('partyId', shopkeepers[0].id)
    } else if (pType === 'customer' && customers.length > 0) {
      setValue('partyId', customers[0].id)
    } else if (pType === 'supplier' && suppliers.length > 0) {
      setValue('partyId', suppliers[0].id)
    } else if (pType === 'employee' && employees.length > 0) {
      setValue('partyId', employees[0].id)
    }
  }

  // Get active party info for balance helper
  const getSelectedPartyDetails = () => {
    if (selectedPartyType === 'shopkeeper') {
      const sk = shopkeepers.find((s) => s.id === selectedPartyId)
      return sk ? { name: sk.shopName, balance: sk.outstandingBalance, label: 'Outstanding Balance' } : null
    }
    if (selectedPartyType === 'customer') {
      const c = customers.find((cust) => cust.id === selectedPartyId)
      return c ? { name: c.name, balance: c.outstandingBalance, label: 'Customer Due' } : null
    }
    if (selectedPartyType === 'supplier') {
      const s = suppliers.find((sup) => sup.id === selectedPartyId)
      return s ? { name: s.name, balance: s.outstandingPayable, label: 'Payable Due' } : null
    }
    if (selectedPartyType === 'employee') {
      const e = employees.find((emp) => emp.id === selectedPartyId)
      return e ? { name: e.name, balance: e.currentPayableBalance, label: 'Wage Liability' } : null
    }
    return null
  }

  const partyInfo = getSelectedPartyDetails()

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setLoading(true)
      let partyName = ''
      if (data.partyType === 'shopkeeper') {
        partyName = shopkeepers.find((s) => s.id === data.partyId)?.shopName || 'Shopkeeper'
      } else if (data.partyType === 'customer') {
        partyName = customers.find((c) => c.id === data.partyId)?.name || 'Customer'
      } else if (data.partyType === 'supplier') {
        partyName = suppliers.find((s) => s.id === data.partyId)?.name || 'Supplier'
      } else if (data.partyType === 'employee') {
        partyName = employees.find((e) => e.id === data.partyId)?.name || 'Employee'
      }

      await financeRepository.recordPayment({
        date: data.date,
        partyType: data.partyType,
        partyId: data.partyId,
        partyName,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        notes: data.notes,
      })

      toast.success(
        `Recorded ${formatBDT(data.amount)} payment for ${partyName} (${data.partyType.toUpperCase()})`
      )
      reset()
      onOpenChange(false)
      onSuccess()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record payment'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const isDisbursement = selectedPartyType === 'supplier' || selectedPartyType === 'employee'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CreditCard className="h-5 w-5 text-primary" />
            Record Transaction Payment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Party Type selector */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Transaction Party Type *</label>
            <select
              value={selectedPartyType}
              onChange={handlePartyTypeChange}
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

          <div className="text-xs text-muted-foreground p-2 rounded bg-muted/10">
            {isDisbursement ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                🔻 Cash Outflow: Will reduce {selectedPartyType} outstanding payable liability.
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                🟢 Cash Inflow: Will credit {selectedPartyType} ledger and reduce their due balance.
              </span>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
