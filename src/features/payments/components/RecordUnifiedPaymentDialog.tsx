import React, { useState, useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { getTodayDateString } from '@/lib/utils'
import { paymentSchema, type PaymentFormData } from './unifiedPaymentSchema'
import { PaymentPartySelectors } from './PaymentPartySelectors'
import { PaymentAmountFields } from './PaymentAmountFields'

export type PaymentPartyType = PaymentFormData['partyType']

export interface RecordUnifiedPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  /** Pre-select party (used by entity detail/list pages) */
  presetPartyType?: PaymentPartyType
  presetPartyId?: string
  /** Hide party type/party pickers when recording from a known entity */
  lockParty?: boolean
  dialogTitle?: string
  defaultAmount?: number
  defaultNotes?: string
  /** Display name when party dropdown is locked */
  lockedPartyLabel?: string
}

export function RecordUnifiedPaymentDialog({
  open,
  onOpenChange,
  onSuccess,
  presetPartyType,
  presetPartyId,
  lockParty = false,
  dialogTitle,
  defaultAmount = 5000,
  defaultNotes = '',
  lockedPartyLabel,
}: RecordUnifiedPaymentDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const resolvedPartyType = presetPartyType ?? 'shopkeeper'

  const defaultValues = useMemo<PaymentFormData>(
    () => ({
      partyType: resolvedPartyType,
      partyId: presetPartyId ?? '',
      date: getTodayDateString(),
      amount: defaultAmount,
      paymentMethod: 'cash',
      reference: '',
      notes: defaultNotes,
    }),
    [resolvedPartyType, presetPartyId, defaultAmount, defaultNotes]
  )

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues,
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

        if (lockParty && presetPartyId) {
          setValue('partyType', resolvedPartyType)
          setValue('partyId', presetPartyId)
          return
        }

        if (presetPartyId) {
          setValue('partyType', resolvedPartyType)
          setValue('partyId', presetPartyId)
          return
        }

        if (resolvedPartyType === 'shopkeeper' && skList.length > 0) {
          setValue('partyId', skList[0].id)
        }
      } catch (err) {
        console.error('Failed to load parties for payment dialog', err)
      }
    }
    if (open) {
      reset(defaultValues)
      loadParties()
    }
  }, [open, setValue, reset, defaultValues, lockParty, presetPartyId, resolvedPartyType])

  const selectedPartyType = useWatch({ control, name: 'partyType' })
  const selectedPartyId = useWatch({ control, name: 'partyId' })

  const handlePartyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (lockParty) return
    const pType = e.target.value as PaymentPartyType
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

  const getSelectedPartyDetails = () => {
    if (lockParty && lockedPartyLabel) {
      const balance =
        resolvedPartyType === 'shopkeeper'
          ? shopkeepers.find((s) => s.id === presetPartyId)?.outstandingBalance ?? 0
          : resolvedPartyType === 'customer'
            ? customers.find((c) => c.id === presetPartyId)?.outstandingBalance ?? 0
            : resolvedPartyType === 'supplier'
              ? suppliers.find((s) => s.id === presetPartyId)?.outstandingPayable ?? 0
              : employees.find((e) => e.id === presetPartyId)?.currentPayableBalance ?? 0

      const label =
        resolvedPartyType === 'shopkeeper'
          ? 'Outstanding Balance'
          : resolvedPartyType === 'customer'
            ? 'Customer Due'
            : resolvedPartyType === 'supplier'
              ? 'Payable Due'
              : 'Wage Liability'

      return { name: lockedPartyLabel, balance, label }
    }

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
      let partyName = lockedPartyLabel || ''
      if (!partyName) {
        if (data.partyType === 'shopkeeper') {
          partyName = shopkeepers.find((s) => s.id === data.partyId)?.shopName || 'Shopkeeper'
        } else if (data.partyType === 'customer') {
          partyName = customers.find((c) => c.id === data.partyId)?.name || 'Customer'
        } else if (data.partyType === 'supplier') {
          partyName = suppliers.find((s) => s.id === data.partyId)?.name || 'Supplier'
        } else if (data.partyType === 'employee') {
          partyName = employees.find((e) => e.id === data.partyId)?.name || 'Employee'
        }
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
      reset(defaultValues)
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
  const title = dialogTitle ?? 'Record Transaction Payment'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CreditCard className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <PaymentPartySelectors
            selectedPartyType={selectedPartyType}
            partyInfo={partyInfo}
            shopkeepers={shopkeepers}
            customers={customers}
            suppliers={suppliers}
            employees={employees}
            onPartyTypeChange={handlePartyTypeChange}
            register={register}
            errors={errors}
            lockParty={lockParty}
            lockedPartyLabel={lockedPartyLabel}
          />

          <PaymentAmountFields register={register} errors={errors} />

          <div className="text-xs text-muted-foreground p-2 rounded bg-muted/10">
            {isDisbursement ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                Cash outflow: reduces {selectedPartyType} outstanding payable liability.
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Cash inflow: credits {selectedPartyType} ledger and reduces their due balance.
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
            <Button
              type="submit"
              disabled={loading || !selectedPartyId}
              className="bg-primary text-primary-foreground"
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}