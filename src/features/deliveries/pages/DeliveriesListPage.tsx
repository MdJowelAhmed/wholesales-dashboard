import { useState, useMemo, useTransition } from 'react'
import {
  Truck,
  Plus,
  Search,
  Filter,
  Layers,
  DollarSign,
  PackageCheck,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { shopkeepersRepository } from '@/mocks/repositories/shopkeepersRepository'
import { useRepositoryQuery, QUERY_INVALIDATION_SCOPES } from '@/lib/hooks'
import { Shopkeeper } from '@/types/shopkeepers'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { DispatchDeliveryDialog } from '../components/DispatchDeliveryDialog'
import { ChallanPreviewDialog, DeliveryWithShopkeeper } from '../components/ChallanPreviewDialog'
import { DeliveriesTable } from '../components/DeliveriesTable'

interface DeliveriesData {
  deliveries: DeliveryWithShopkeeper[]
  shopkeepers: Shopkeeper[]
}

export function DeliveriesListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit_sale' | 'consignment'>('all')
  const [dispatchOpen, setDispatchOpen] = useState(false)
  const [activeChallan, setActiveChallan] = useState<DeliveryWithShopkeeper | null>(null)
  const [, startTransition] = useTransition()

  const { data, loading, refetch } = useRepositoryQuery<DeliveriesData>(
    async () => {
      const [allDeliveries, skList] = await Promise.all([
        shopkeepersRepository.listAllDeliveries(),
        shopkeepersRepository.listShopkeepers(),
      ])
      return { deliveries: allDeliveries, shopkeepers: skList }
    },
    {
      initialData: {
        deliveries: [],
        shopkeepers: [],
      },
      invalidationScopes: [...QUERY_INVALIDATION_SCOPES.deliveries],
    }
  )

  const { deliveries, shopkeepers } = data

  const handleRefetch = () => {
    startTransition(() => {
      refetch()
    })
  }

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const matchSearch =
        d.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.shopkeeperName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.marketName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchType = typeFilter === 'all' || d.transactionType === typeFilter
      return matchSearch && matchType
    })
  }, [deliveries, searchTerm, typeFilter])

  const metrics = useMemo(() => {
    const totalAmount = deliveries.reduce((sum, d) => sum + (d.totalAmount ?? 0), 0)
    const totalPieces = deliveries.reduce((sum, d) => sum + (d.totalPieces ?? 0), 0)
    const consignmentPieces = deliveries
      .filter((d) => d.transactionType === 'consignment')
      .reduce((sum, d) => sum + (d.totalPieces ?? 0), 0)
    const creditSaleAmount = deliveries
      .filter((d) => d.transactionType === 'credit_sale')
      .reduce((sum, d) => sum + (d.totalAmount ?? 0), 0)

    return { totalAmount, totalPieces, consignmentPieces, creditSaleAmount }
  }, [deliveries])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            Shopkeeper Deliveries & Challans
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage wholesale consignments, credit deliveries, dispatch challans, and stock transfers
          </p>
        </div>
        <Button
          onClick={() => setDispatchOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          id="btn-dispatch-delivery"
        >
          <Plus className="mr-2 h-4 w-4" />
          Dispatch Delivery
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Dispatched Value</span>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.totalAmount)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Across wholesale deliveries</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Garments Dispatched</span>
              <Layers className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {metrics.totalPieces.toLocaleString()} pcs
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Finished goods shipped</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Consignment Stock Held</span>
              <PackageCheck className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {metrics.consignmentPieces.toLocaleString()} pcs
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Held at wholesale shops</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Credit Sales Invoiced</span>
              <Building2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.creditSaleAmount)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Direct shopkeeper debit</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by challan #, shop, or market..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
              id="input-search-deliveries"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              aria-label="Filter deliveries by agreement type"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as 'all' | 'credit_sale' | 'consignment')
              }
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Agreements</option>
              <option value="credit_sale">Credit Sale</option>
              <option value="consignment">Consignment</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <DeliveriesTable
        loading={loading}
        filteredDeliveries={filteredDeliveries}
        onViewChallan={(delivery) => setActiveChallan(delivery)}
      />

      <ChallanPreviewDialog
        challan={activeChallan}
        onClose={() => setActiveChallan(null)}
      />

      <DispatchDeliveryDialog
        open={dispatchOpen}
        onOpenChange={setDispatchOpen}
        shopkeepers={shopkeepers}
        onSuccess={handleRefetch}
      />
    </div>
  )
}
