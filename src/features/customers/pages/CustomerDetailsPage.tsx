import React, { useState, useTransition } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, DollarSign, Phone, MapPin, UserCheck } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { StatusBadge } from '@/components/shared/StatusBadge/StatusBadge'
import { PrintButton } from '@/components/shared/PrintButton/PrintButton'
import { EmptyState, TableSkeleton, CardGridSkeleton } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { salesRepository } from '@/mocks/repositories/salesRepository'
import { useRepositoryQuery, QUERY_INVALIDATION_SCOPES } from '@/lib/hooks'
import { Customer, CustomerLedgerEntry } from '@/types/sales'
import { RecordCustomerPaymentDialog } from '../components/RecordCustomerPaymentDialog'
import { formatBDT } from '@/lib/calculations/financialCalculations'

export function CustomerDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [, startTransition] = useTransition()

  const { data, loading, refetch } = useRepositoryQuery(
    async () => {
      if (!id) return { customer: null as Customer | null, ledger: [] as CustomerLedgerEntry[] }
      const [customer, ledger] = await Promise.all([
        salesRepository.getCustomerById(id),
        salesRepository.getCustomerLedger(id),
      ])
      return { customer, ledger }
    },
    {
      deps: [id],
      initialData: { customer: null, ledger: [] },
      invalidationScopes: [...QUERY_INVALIDATION_SCOPES.customers],
    }
  )

  const { customer, ledger } = data

  const handleRefetch = () => {
    startTransition(() => {
      refetch()
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-muted/50 rounded animate-pulse" />
        <CardGridSkeleton count={3} />
        <TableSkeleton rows={5} cols={7} />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild size="sm">
          <Link to="/customers">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Customers
          </Link>
        </Button>
        <EmptyState
          title="Customer not found"
          description="The requested retail customer record could not be found."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild size="sm" className="h-8 px-2">
          <Link to="/customers" className="text-xs">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Customers
          </Link>
        </Button>
      </div>

      <PageHeader
        title={customer.name}
        description={`Phone: ${customer.phone} • ${customer.address || 'Direct Showroom Buyer'}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <PrintButton label="Print Statement" />
            <Button size="sm" onClick={() => setPaymentOpen(true)}>
              <DollarSign className="h-4 w-4 mr-1.5" /> Receive Payment
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Outstanding Balance"
          value={formatBDT(customer.outstandingBalance)}
          subtitle="Net due owed by boutique"
          icon={DollarSign}
        />
        <SummaryCard
          title="Total Purchases"
          value={formatBDT(customer.totalPurchases)}
          subtitle="All retail orders & invoices"
          icon={UserCheck}
        />
        <SummaryCard
          title="Total Payments Received"
          value={formatBDT(customer.totalPayments)}
          subtitle="bKash & bank disbursements"
          icon={DollarSign}
        />
      </div>

      {/* Contact Info */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{customer.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{customer.address || 'Showroom Customer'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Chronological Customer Ledger */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Customer Account Ledger</CardTitle>
            <CardDescription>
              Chronological log of retail invoices (debits) and payment settlements (credits).
            </CardDescription>
          </div>
          <StatusBadge status={customer.status} />
        </CardHeader>

        <CardContent>
          {ledger.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No transactions recorded for this customer yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Date</th>
                    <th className="py-2.5 px-3 text-left">Transaction Type</th>
                    <th className="py-2.5 px-3 text-left">Reference / Invoice</th>
                    <th className="py-2.5 px-3 text-left">Description</th>
                    <th className="py-2.5 px-3 text-right">Debit (Invoiced)</th>
                    <th className="py-2.5 px-3 text-right">Credit (Payment)</th>
                    <th className="py-2.5 px-3 text-right">Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ledger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs text-muted-foreground">
                        {entry.date}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${
                            entry.type === 'sale'
                              ? 'bg-primary/15 text-primary'
                              : 'bg-status-active/15 text-status-active-foreground dark:text-status-active'
                          }`}
                        >
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs font-semibold text-foreground">
                        {entry.reference}
                      </td>
                      <td className="py-3 px-3 text-xs text-foreground font-medium">
                        {entry.description}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-primary">
                        {entry.debit > 0 ? formatBDT(entry.debit) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-status-active-foreground dark:text-status-active">
                        {entry.credit > 0 ? formatBDT(entry.credit) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-bold text-foreground">
                        {formatBDT(entry.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <RecordCustomerPaymentDialog
        customerId={customer.id}
        customerName={customer.name}
        outstandingBalance={customer.outstandingBalance}
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        onSuccess={handleRefetch}
      />
    </div>
  )
}
