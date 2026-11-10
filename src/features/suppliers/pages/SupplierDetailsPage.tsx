import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CreditCard, DollarSign, Phone, MapPin, Building2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { StatusBadge } from '@/components/shared/StatusBadge/StatusBadge'
import { PrintButton } from '@/components/shared/PrintButton/PrintButton'
import { LoadingState, EmptyState } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { suppliersRepository } from '@/mocks/repositories/suppliersRepository'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'
import { Supplier, SupplierLedgerEntry } from '@/types/suppliers'
import { RecordSupplierPaymentDialog } from '../components/RecordSupplierPaymentDialog'
import { formatBDT } from '@/lib/calculations/financialCalculations'

export function SupplierDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [ledger, setLedger] = useState<SupplierLedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentOpen, setPaymentOpen] = useState(false)

  const loadData = React.useCallback(async () => {
    if (!id) return
    try {
      const [s, l] = await Promise.all([
        suppliersRepository.getSupplierById(id),
        suppliersRepository.getSupplierLedger(id),
      ])
      setSupplier(s)
      setLedger(l)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
    const unsubscribe = mockStorage.subscribe(() => {
      loadData()
    })
    return () => unsubscribe()
  }, [loadData])

  if (loading) {
    return <LoadingState message="Loading supplier ledger and purchases..." />
  }

  if (!supplier) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild size="sm">
          <Link to="/suppliers">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Suppliers
          </Link>
        </Button>
        <EmptyState
          title="Supplier not found"
          description="The requested fabric or accessory supplier could not be found."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild size="sm" className="h-8 px-2">
          <Link to="/suppliers" className="text-xs">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Suppliers
          </Link>
        </Button>
      </div>

      <PageHeader
        title={supplier.name}
        description={`Contact: ${supplier.contactPerson} • ${supplier.address}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <PrintButton label="Print Ledger Statement" />
            <Button size="sm" onClick={() => setPaymentOpen(true)}>
              <CreditCard className="h-4 w-4 mr-1.5" /> Record Payment
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Outstanding Payable"
          value={formatBDT(supplier.outstandingPayable)}
          subtitle="Net balance owed by factory"
          icon={DollarSign}
        />
        <SummaryCard
          title="Total Purchases"
          value={formatBDT(supplier.totalPurchases)}
          subtitle="All invoiced material supplies"
          icon={Building2}
        />
        <SummaryCard
          title="Total Payments Made"
          value={formatBDT(supplier.totalPayments)}
          subtitle="Disbursements settled to date"
          icon={CreditCard}
        />
      </div>

      {/* Contact & Materials Info */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{supplier.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{supplier.address}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-semibold text-foreground">Supplied:</span>
            <span>{supplier.materialsSupplied.join(', ')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Chronological Ledger Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Supplier Account Ledger</CardTitle>
            <CardDescription>
              Chronological log of raw material deliveries (credits) and payment settlements
              (debits).
            </CardDescription>
          </div>
          <StatusBadge status={supplier.status} />
        </CardHeader>

        <CardContent>
          {ledger.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No transactions recorded in this supplier ledger yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Date</th>
                    <th className="py-2.5 px-3 text-left">Type</th>
                    <th className="py-2.5 px-3 text-left">Description / Voucher</th>
                    <th className="py-2.5 px-3 text-right">Debit (Payment Paid)</th>
                    <th className="py-2.5 px-3 text-right">Credit (Purchase Invoiced)</th>
                    <th className="py-2.5 px-3 text-right">Balance Payable</th>
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
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            entry.type === 'payment'
                              ? 'bg-status-active/15 text-status-active-foreground dark:text-status-active'
                              : 'bg-status-pending/15 text-status-pending-foreground dark:text-status-pending'
                          }`}
                        >
                          {entry.type === 'payment' ? 'Payment' : 'Purchase'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-foreground font-medium">
                        {entry.description}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-status-active-foreground dark:text-status-active">
                        {entry.debit > 0 ? formatBDT(entry.debit) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-status-pending-foreground dark:text-status-pending">
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

      <RecordSupplierPaymentDialog
        supplierId={supplier.id}
        supplierName={supplier.name}
        outstandingPayable={supplier.outstandingPayable}
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        onSuccess={loadData}
      />
    </div>
  )
}
