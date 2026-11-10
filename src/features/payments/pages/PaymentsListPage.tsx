import { useState, useEffect, useMemo } from 'react'
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { financeRepository } from '@/mocks/repositories/financeRepository'
import { PaymentRecord } from '@/types/finance'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { RecordUnifiedPaymentDialog } from '../components/RecordUnifiedPaymentDialog'

export function PaymentsListPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [partyTypeFilter, setPartyTypeFilter] = useState<'all' | 'shopkeeper' | 'customer' | 'supplier' | 'employee'>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | 'cash' | 'bank_transfer' | 'cheque' | 'bkash' | 'nagad'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadPayments = async () => {
    try {
      setLoading(true)
      const data = await financeRepository.listPayments()
      setPayments(data)
    } catch (err) {
      console.error('Failed to load payments', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [])

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

  // Summary Metrics
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
    return { totalInflow, totalOutflow, netCashflow, count: payments.length }
  }, [payments])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Payments & Collections
          </h1>
          <p className="text-sm text-muted-foreground">
            Central settlement ledger for wholesale shopkeepers, retail customers, fabric suppliers, and workers
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Inflows (Collections)</span>
              <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.totalInflow)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Shopkeepers & retail sales</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Outflows (Disbursed)</span>
              <ArrowUpRight className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.totalOutflow)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Suppliers & employee wages</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Net Operations Cashflow</span>
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.netCashflow)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Net treasury position</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Recorded Transactions</span>
              <Receipt className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {metrics.count} Receipts
            </div>
            <p className="mt-1 text-xs text-muted-foreground">All settlement vouchers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
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

      {/* Payments Table */}
      <Card className="border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Receipt / Voucher #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Party Name</th>
                <th className="px-4 py-3">Party Category</th>
                <th className="px-4 py-3">Cash Direction</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Reference / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Loading payments...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isInflow = p.partyType === 'shopkeeper' || p.partyType === 'customer'
                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground font-mono">
                        {p.receiptNumber}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {p.date}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {p.partyName}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[11px] capitalize">
                          {p.partyType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {isInflow ? (
                          <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 gap-1">
                            <ArrowDownLeft className="h-3.5 w-3.5" />
                            Collection In
                          </span>
                        ) : (
                          <span className="flex items-center text-xs font-semibold text-rose-600 dark:text-rose-400 gap-1">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            Disbursement Out
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">
                        <span className={isInflow ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {isInflow ? '+' : '-'} {formatBDT(p.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className="bg-muted text-foreground text-xs uppercase"
                        >
                          {p.paymentMethod.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <div>{p.referenceTransactionCode || '-'}</div>
                        {p.notes && <div className="text-[11px] italic">{p.notes}</div>}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Dialog */}
      <RecordUnifiedPaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadPayments}
      />
    </div>
  )
}
