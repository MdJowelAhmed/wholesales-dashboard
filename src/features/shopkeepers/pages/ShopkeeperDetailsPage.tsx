import React, { useState, useTransition } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Truck,
  DollarSign,
  RotateCcw,
  Package,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { PrintButton } from '@/components/shared/PrintButton/PrintButton'
import { EmptyState, TableSkeleton, CardGridSkeleton } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { shopkeepersRepository } from '@/mocks/repositories/shopkeepersRepository'
import { useRepositoryQuery, QUERY_INVALIDATION_SCOPES } from '@/lib/hooks'
import {
  Shopkeeper,
  ShopkeeperDelivery,
  ShopkeeperLedgerEntry,
  ShopkeeperPayment,
  ShopkeeperReturnRecord,
} from '@/types/shopkeepers'
import { RecordDeliveryDialog } from '../components/RecordDeliveryDialog'
import { RecordShopkeeperPaymentDialog } from '../components/RecordShopkeeperPaymentDialog'
import { RecordShopkeeperReturnDialog } from '../components/RecordShopkeeperReturnDialog'
import { ShopkeeperLedgerTab } from '../components/ShopkeeperLedgerTab'
import { ShopkeeperDeliveriesTab } from '../components/ShopkeeperDeliveriesTab'
import { ShopkeeperPaymentsTab } from '../components/ShopkeeperPaymentsTab'
import { ShopkeeperReturnsTab } from '../components/ShopkeeperReturnsTab'
import { ShopkeeperProfileHeader } from '../components/ShopkeeperProfileHeader'
import { formatBDT } from '@/lib/calculations/financialCalculations'

export function ShopkeeperDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<'ledger' | 'deliveries' | 'payments' | 'returns'>('ledger')
  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [, startTransition] = useTransition()

  const { data, loading, refetch } = useRepositoryQuery(
    async () => {
      if (!id) {
        return {
          shopkeeper: null as Shopkeeper | null,
          deliveries: [] as ShopkeeperDelivery[],
          payments: [] as ShopkeeperPayment[],
          returns: [] as ShopkeeperReturnRecord[],
          ledger: [] as ShopkeeperLedgerEntry[],
        }
      }
      const [sk, d, p, r, l] = await Promise.all([
        shopkeepersRepository.getShopkeeperById(id),
        shopkeepersRepository.getDeliveries(id),
        shopkeepersRepository.getPayments(id),
        shopkeepersRepository.getReturns(id),
        shopkeepersRepository.getLedger(id),
      ])
      return { shopkeeper: sk, deliveries: d, payments: p, returns: r, ledger: l }
    },
    {
      deps: [id],
      initialData: {
        shopkeeper: null,
        deliveries: [],
        payments: [],
        returns: [],
        ledger: [],
      },
      invalidationScopes: [...QUERY_INVALIDATION_SCOPES.shopkeepers],
    }
  )

  const { shopkeeper, deliveries, payments, returns, ledger } = data

  const handleRefetch = () => {
    startTransition(() => {
      refetch()
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-muted/50 rounded animate-pulse" />
        <CardGridSkeleton count={5} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    )
  }

  if (!shopkeeper) {
    return (
      <EmptyState
        title="Shopkeeper Profile Not Found"
        description="The requested shopkeeper could not be retrieved from the database."
        actionLabel="Back to Shopkeepers"
        onAction={() => window.history.back()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Back to List Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/shopkeepers"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Shopkeepers Directory
        </Link>
        <PrintButton />
      </div>

      {/* Header Info */}
      <PageHeader
        title={shopkeeper.shopName}
        description={`Wholesale partner in ${shopkeeper.marketName}. Ledger balance and transactional history.`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReturnOpen(true)}
              className="text-xs"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Process Return
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPaymentOpen(true)}
              className="text-xs"
            >
              <DollarSign className="mr-1.5 h-3.5 w-3.5" />
              Record Payment
            </Button>
            <Button
              size="sm"
              onClick={() => setDeliveryOpen(true)}
              className="bg-primary text-primary-foreground text-xs"
            >
              <Truck className="mr-1.5 h-3.5 w-3.5" />
              New Delivery Challan
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Outstanding Balance"
          value={formatBDT(shopkeeper.outstandingBalance)}
          subtitle="Net receivable balance"
          icon={DollarSign}
        />
        <SummaryCard
          title="Total Dispatched"
          value={formatBDT(shopkeeper.totalDeliveredValue)}
          subtitle="Gross delivery value"
          icon={Truck}
        />
        <SummaryCard
          title="Payments Received"
          value={formatBDT(shopkeeper.totalPaymentsReceived)}
          subtitle="Cash & bank settlements"
          icon={DollarSign}
        />
        <SummaryCard
          title="Return Adjustments"
          value={formatBDT(shopkeeper.totalReturnAdjustments)}
          subtitle="Credit given for returns"
          icon={RotateCcw}
        />
        <SummaryCard
          title="Consignment Stock"
          value={`${shopkeeper.consignmentPiecesHeld} pcs`}
          subtitle="Held pieces awaiting sale"
          icon={Package}
        />
      </div>

      {/* Profile Info */}
      <ShopkeeperProfileHeader shopkeeper={shopkeeper} />

      {/* Details Navigation Tabs */}
      <div className="flex border-b border-border gap-2">
        {[
          { id: 'ledger', label: 'Chronological Ledger', count: ledger.length },
          { id: 'deliveries', label: 'Product Deliveries', count: deliveries.length },
          { id: 'payments', label: 'Payments History', count: payments.length },
          { id: 'returns', label: 'Returns Adjusted', count: returns.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'ledger' && <ShopkeeperLedgerTab ledger={ledger} />}
      {activeTab === 'deliveries' && <ShopkeeperDeliveriesTab deliveries={deliveries} />}
      {activeTab === 'payments' && <ShopkeeperPaymentsTab payments={payments} />}
      {activeTab === 'returns' && <ShopkeeperReturnsTab returns={returns} />}

      {/* Action Dialogs */}
      <RecordDeliveryDialog
        shopkeeperId={shopkeeper.id}
        shopName={shopkeeper.shopName}
        open={deliveryOpen}
        onOpenChange={setDeliveryOpen}
        onSuccess={handleRefetch}
      />

      <RecordShopkeeperPaymentDialog
        shopkeeperId={shopkeeper.id}
        shopName={shopkeeper.shopName}
        outstandingBalance={shopkeeper.outstandingBalance}
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        onSuccess={handleRefetch}
      />

      <RecordShopkeeperReturnDialog
        shopkeeperId={shopkeeper.id}
        shopName={shopkeeper.shopName}
        deliveries={deliveries}
        open={returnOpen}
        onOpenChange={setReturnOpen}
        onSuccess={handleRefetch}
      />
    </div>
  )
}
