import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Truck,
  DollarSign,
  RotateCcw,
  Store,
  Phone,
  MapPin,
  Package,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { PrintButton } from '@/components/shared/PrintButton/PrintButton'
import { LoadingState, EmptyState } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { shopkeepersRepository } from '@/mocks/repositories/shopkeepersRepository'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'
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
import { formatBDT } from '@/lib/calculations/financialCalculations'

export function ShopkeeperDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const [shopkeeper, setShopkeeper] = useState<Shopkeeper | null>(null)
  const [deliveries, setDeliveries] = useState<ShopkeeperDelivery[]>([])
  const [payments, setPayments] = useState<ShopkeeperPayment[]>([])
  const [returns, setReturns] = useState<ShopkeeperReturnRecord[]>([])
  const [ledger, setLedger] = useState<ShopkeeperLedgerEntry[]>([])
  const [activeTab, setActiveTab] = useState<'ledger' | 'deliveries' | 'payments' | 'returns'>(
    'ledger'
  )
  const [loading, setLoading] = useState(true)

  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)

  const loadData = async () => {
    if (!id) return
    try {
      const [sk, d, p, r, l] = await Promise.all([
        shopkeepersRepository.getShopkeeperById(id),
        shopkeepersRepository.getDeliveries(id),
        shopkeepersRepository.getPayments(id),
        shopkeepersRepository.getReturns(id),
        shopkeepersRepository.getLedger(id),
      ])
      setShopkeeper(sk)
      setDeliveries(d)
      setPayments(p)
      setReturns(r)
      setLedger(l)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const unsubscribe = mockStorage.subscribe(() => {
      loadData()
    })
    return () => unsubscribe()
  }, [id])

  if (loading) {
    return <LoadingState message="Loading shopkeeper ledger and history..." />
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
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{shopkeeper.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{shopkeeper.address}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Store className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{shopkeeper.marketName}</span>
          </div>
        </CardContent>
      </Card>

      {/* Details Navigation Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'ledger'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Chronological Ledger ({ledger.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('deliveries')}
          className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'deliveries'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Product Deliveries ({deliveries.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'payments'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Payments History ({payments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('returns')}
          className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'returns'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Returns Adjusted ({returns.length})
        </button>
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
        onSuccess={loadData}
      />

      <RecordShopkeeperPaymentDialog
        shopkeeperId={shopkeeper.id}
        shopName={shopkeeper.shopName}
        outstandingBalance={shopkeeper.outstandingBalance}
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        onSuccess={loadData}
      />

      <RecordShopkeeperReturnDialog
        shopkeeperId={shopkeeper.id}
        shopName={shopkeeper.shopName}
        deliveries={deliveries}
        open={returnOpen}
        onOpenChange={setReturnOpen}
        onSuccess={loadData}
      />
    </div>
  )
}
