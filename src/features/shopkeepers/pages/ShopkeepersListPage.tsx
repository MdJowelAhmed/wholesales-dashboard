import React, { useState, useTransition } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Store, Eye, Truck, DollarSign, Package } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { StatusBadge } from '@/components/shared/StatusBadge/StatusBadge'
import { DataTable, ColumnDef } from '@/components/shared/DataTable/DataTable'
import { TableSkeleton, CardGridSkeleton } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { shopkeepersRepository } from '@/mocks/repositories/shopkeepersRepository'
import { useRepositoryQuery, QUERY_INVALIDATION_SCOPES } from '@/lib/hooks'
import { Shopkeeper } from '@/types/shopkeepers'
import { AddShopkeeperDialog } from '../components/AddShopkeeperDialog'
import { RecordDeliveryDialog } from '../components/RecordDeliveryDialog'
import { RecordShopkeeperPaymentDialog } from '../components/RecordShopkeeperPaymentDialog'
import { formatBDT } from '@/lib/calculations/financialCalculations'

export function ShopkeepersListPage(): React.JSX.Element {
  const { data: shopkeepers = [], loading, refetch } = useRepositoryQuery(
    () => shopkeepersRepository.listShopkeepers(),
    { initialData: [], invalidationScopes: [...QUERY_INVALIDATION_SCOPES.shopkeepers] }
  )
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deliveryShop, setDeliveryShop] = useState<Shopkeeper | null>(null)
  const [paymentShop, setPaymentShop] = useState<Shopkeeper | null>(null)
  const navigate = useNavigate()
  const [, startTransition] = useTransition()

  const handleRefetch = () => {
    startTransition(() => {
      refetch()
    })
  }

  const totalOutstanding = shopkeepers.reduce((sum, s) => sum + (s.outstandingBalance ?? 0), 0)
  const totalDelivered = shopkeepers.reduce((sum, s) => sum + (s.totalDeliveredValue ?? 0), 0)
  const totalConsignmentHeld = shopkeepers.reduce(
    (sum, s) => sum + (s.consignmentPiecesHeld ?? 0),
    0
  )

  const columns: ColumnDef<Shopkeeper>[] = [
    {
      key: 'shopName',
      header: 'Shop & Market',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs">
            <Store className="h-4 w-4" />
          </div>
          <div>
            <Link
              to={`/shopkeepers/${row.id}`}
              className="font-semibold text-foreground hover:underline"
            >
              {row.shopName}
            </Link>
            <div className="text-xs text-muted-foreground">
              {row.marketName} • {row.ownerName}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone / Contact',
      cell: (row) => <span className="font-mono text-xs">{row.phone}</span>,
    },
    {
      key: 'outstandingBalance',
      header: 'Receivables Due',
      sortable: true,
      cell: (row) => (
        <span
          className={`font-mono text-xs font-bold ${
            row.outstandingBalance > 0 ? 'text-destructive' : 'text-foreground'
          }`}
        >
          {formatBDT(row.outstandingBalance)}
        </span>
      ),
    },
    {
      key: 'consignmentPiecesHeld',
      header: 'Consignment Stock',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {row.consignmentPiecesHeld > 0 ? `${row.consignmentPiecesHeld.toLocaleString()} pcs` : '—'}
        </span>
      ),
    },
    {
      key: 'totalDeliveredValue',
      header: 'Total Delivered',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground font-medium">
          {formatBDT(row.totalDeliveredValue)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/shopkeepers/${row.id}`)}
            className="h-8 px-2 text-xs"
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> Ledger
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeliveryShop(row)}
            className="h-8 px-2 text-xs"
          >
            <Truck className="h-3.5 w-3.5 mr-1" /> Delivery
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPaymentShop(row)}
            className="h-8 px-2 text-xs"
          >
            <DollarSign className="h-3.5 w-3.5 mr-1" /> Payment
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wholesale Shopkeepers"
        description="Wholesale merchant clients in Islampur, Keraniganj, Chittagong Terribazar, and regional garment hubs."
        actions={
          <Button onClick={() => setAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Register Shopkeeper
          </Button>
        }
      />

      {loading ? (
        <>
          <CardGridSkeleton count={4} />
          <TableSkeleton rows={5} cols={6} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Receivables"
              value={formatBDT(totalOutstanding)}
              subtitle="Net wholesale dues outstanding"
              icon={DollarSign}
            />
            <SummaryCard
              title="Total Delivered Value"
              value={formatBDT(totalDelivered)}
              subtitle="All invoiced dispatches"
              icon={Truck}
            />
            <SummaryCard
              title="Consignment Pieces Held"
              value={`${totalConsignmentHeld.toLocaleString()} pcs`}
              subtitle="Stock held on consignment terms"
              icon={Package}
            />
            <SummaryCard
              title="Active Wholesale Shops"
              value={`${shopkeepers.length} Shops`}
              subtitle="Dhaka & Chittagong wholesale"
              icon={Store}
            />
          </div>

          <DataTable
            data={shopkeepers}
            columns={columns}
            searchKey={(s) => `${s.shopName} ${s.ownerName} ${s.marketName} ${s.phone}`}
            searchPlaceholder="Search shop name, owner, market, or phone..."
            emptyTitle="No shopkeepers found"
            emptyDescription="Register wholesale shopkeepers to track credit sales, deliveries, and consignment stock."
          />
        </>
      )}

      <AddShopkeeperDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleRefetch}
      />

      {deliveryShop && (
        <RecordDeliveryDialog
          shopkeeperId={deliveryShop.id}
          shopName={deliveryShop.shopName}
          open={!!deliveryShop}
          onOpenChange={(open) => !open && setDeliveryShop(null)}
          onSuccess={handleRefetch}
        />
      )}

      {paymentShop && (
        <RecordShopkeeperPaymentDialog
          shopkeeperId={paymentShop.id}
          shopName={paymentShop.shopName}
          outstandingBalance={paymentShop.outstandingBalance}
          open={!!paymentShop}
          onOpenChange={(open) => !open && setPaymentShop(null)}
          onSuccess={handleRefetch}
        />
      )}
    </div>
  )
}
