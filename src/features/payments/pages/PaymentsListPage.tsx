import { useState, useMemo, useTransition } from 'react'
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Receipt,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { financeRepository } from '@/mocks/repositories/financeRepository'
import { useRepositoryQuery, QUERY_INVALIDATION_SCOPES } from '@/lib/hooks'
import { PaymentRecord } from '@/types/finance'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { RecordUnifiedPaymentDialog } from '../components/RecordUnifiedPaymentDialog'
import { PaymentsTable } from '../components/PaymentsTable'

export function PaymentsListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [partyTypeFilter, setPartyTypeFilter] = useState<'all' | 'shopkeeper' | 'customer' | 'supplier' | 'employee'>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | 'cash' | 'bank_transfer' | 'cheque' | 'bkash' | 'nagad'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [, startTransition] = useTransition()

  const { data: payments = [], loading, refetch } = useRepositoryQuery<PaymentRecord[]>(
    () => financeRepository.listPayments(),
    { initialData: [], invalidationScopes: [...QUERY_INVALIDATION_SCOPES.payments] }
  )

  const handleRefetch = () => {
    startTransition(() => {
      refetch()
    })
  }

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.referenceTransactionCode && p.referenceTransactionCode.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchPartyType = partyTypeFilter === 'all' || p.partyType === partyTypeFilter
      const matchMethod = methodFilter === 'all' || p.paymentMethod === methodFilter

      return matchSearch && matchPartyType && matchMethod
    })
  }, [payments, searchTerm, partyTypeFilter, methodFilter])

  const metrics = useMemo(() => {
    let totalInflow = 0
    let totalOutflow = 0

    payments.forEach((p) => {
      if (p.partyType === 'shopkeeper' || p.partyType === 'customer') {
        totalInflow += p.amount
      } else {
        totalOutflow += p.amount
      }
    })

    const netCashflow = totalInflow - totalOutflow
    return { totalInflow, totalOutflow, netCashflow }
  }, [payments])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Payments & Collections
          </h1>
          <p className="text-sm text-muted-foreground">
            Track wholesale collections, supplier settlements, employee advances, and cash vouchers
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          id="btn-record-payment"
        >
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Inflows (Collections)</span>
              <Wallet className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.totalInflow)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">From shopkeepers & boutique customers</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Outflows (Disbursed)</span>
              <Receipt className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.totalOutflow)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">To suppliers & factory employees</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Net Operations Cashflow</span>
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.netCashflow)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Net liquid cash realized</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Transactions</span>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {payments.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">All settlement vouchers</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by receipt #, party name, or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
              id="input-search-payments"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                aria-label="Filter by party type"
                value={partyTypeFilter}
                onChange={(e) =>
                  setPartyTypeFilter(
                    e.target.value as 'all' | 'shopkeeper' | 'customer' | 'supplier' | 'employee'
                  )
                }
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Parties</option>
                <option value="shopkeeper">Shopkeepers</option>
                <option value="customer">Customers</option>
                <option value="supplier">Suppliers</option>
                <option value="employee">Employees / Workers</option>
              </select>
            </div>

            <select
              aria-label="Filter by payment method"
              value={methodFilter}
              onChange={(e) =>
                setMethodFilter(
                  e.target.value as 'all' | 'cash' | 'bank_transfer' | 'cheque' | 'bkash' | 'nagad'
                )
              }
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <PaymentsTable
        loading={loading}
        filteredPayments={filteredPayments}
      />

      <RecordUnifiedPaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleRefetch}
      />
    </div>
  )
}
