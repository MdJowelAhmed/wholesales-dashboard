import { useState, useEffect, useMemo } from 'react'
import {
  Truck,
  Plus,
  Search,
  Filter,
  Layers,
  DollarSign,
  PackageCheck,
  Building2,
  Printer,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { shopkeepersRepository } from '@/mocks/repositories/shopkeepersRepository'
import { ShopkeeperDelivery, Shopkeeper } from '@/types/shopkeepers'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { DispatchDeliveryDialog } from '../components/DispatchDeliveryDialog'

type DeliveryWithShopkeeper = ShopkeeperDelivery & {
  shopkeeperId: string
  shopkeeperName: string
  marketName: string
}

export function DeliveriesListPage() {
  const [deliveries, setDeliveries] = useState<DeliveryWithShopkeeper[]>([])
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit_sale' | 'consignment'>('all')
  const [dispatchOpen, setDispatchOpen] = useState(false)
  const [activeChallan, setActiveChallan] = useState<DeliveryWithShopkeeper | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [allDeliveries, skList] = await Promise.all([
        shopkeepersRepository.listAllDeliveries(),
        shopkeepersRepository.listShopkeepers(),
      ])
      setDeliveries(allDeliveries)
      setShopkeepers(skList)
    } catch (err) {
      console.error('Failed to load deliveries data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

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

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalValue = deliveries.reduce((sum, d) => sum + d.totalAmount, 0)
    const totalPieces = deliveries.reduce((sum, d) => sum + d.totalPieces, 0)
    const consignmentPieces = deliveries
      .filter((d) => d.transactionType === 'consignment')
      .reduce((sum, d) => sum + d.totalPieces, 0)
    const creditSaleValue = deliveries
      .filter((d) => d.transactionType === 'credit_sale')
      .reduce((sum, d) => sum + d.totalAmount, 0)

    return { totalValue, totalPieces, consignmentPieces, creditSaleValue }
  }, [deliveries])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            Shopkeeper Deliveries & Challans
          </h1>
          <p className="text-sm text-muted-foreground">
            Wholesale consignments, credit dispatches, piece counts, and gate pass challans
          </p>
        </div>
        <Button
          onClick={() => setDispatchOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          id="btn-dispatch-delivery"
        >
          <Plus className="mr-2 h-4 w-4" />
          Dispatch Delivery (Challan)
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Dispatched Value</span>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.totalValue)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across {deliveries.length} delivery shipments
            </p>
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
            <p className="mt-1 text-xs text-muted-foreground">Piece-based wholesale deliveries</p>
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
            <p className="mt-1 text-xs text-muted-foreground">Stock held at vendor partner shops</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Credit Sales Value</span>
              <Building2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.creditSaleValue)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Outright credit receivables</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by challan #, shop name, or market..."
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

      {/* Deliveries Table */}
      <Card className="border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Challan #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Shopkeeper & Market</th>
                <th className="px-4 py-3">Agreement</th>
                <th className="px-4 py-3 text-right">Pieces</th>
                <th className="px-4 py-3 text-right">Delivery Value</th>
                <th className="px-4 py-3 text-right">Outstanding</th>
                <th className="px-4 py-3">Items Summary</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    Loading wholesale dispatches...
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    No wholesale deliveries found.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground font-mono">
                      {delivery.deliveryNumber}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {delivery.date}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{delivery.shopkeeperName}</div>
                      <div className="text-xs text-muted-foreground">{delivery.marketName}</div>
                    </td>
                    <td className="px-4 py-3">
                      {delivery.transactionType === 'consignment' ? (
                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                          Consignment
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                          Credit Sale
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {delivery.totalPieces.toLocaleString()} pcs
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {formatBDT(delivery.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {delivery.outstandingAmount > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400">
                          {formatBDT(delivery.outstandingAmount)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs">Settled</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {delivery.items
                          .map((i) => `${i.productName} (${i.size}) x ${i.quantityPieces} pcs`)
                          .join(', ')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => setActiveChallan(delivery)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Challan Slip
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Challan Slip Modal */}
      {activeChallan && (
        <Dialog open={!!activeChallan} onOpenChange={() => setActiveChallan(null)}>
          <DialogContent className="max-w-xl bg-card text-card-foreground border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between text-foreground">
                <span className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Delivery Challan Slip
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {activeChallan.deliveryNumber}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              <div className="rounded-lg border border-border bg-muted/20 p-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Recipient Shop:</span>
                  <div className="font-semibold text-foreground">{activeChallan.shopkeeperName}</div>
                  <div className="text-muted-foreground">{activeChallan.marketName}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Dispatch Date:</span>
                  <div className="font-semibold text-foreground">{activeChallan.date}</div>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {activeChallan.transactionType.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Item / SKU</th>
                      <th className="px-3 py-2">Size</th>
                      <th className="px-3 py-2 text-right">Pcs</th>
                      <th className="px-3 py-2 text-right">Rate</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeChallan.items.map((it) => (
                      <tr key={it.id}>
                        <td className="px-3 py-2">
                          <div className="font-medium text-foreground">{it.productName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{it.sku}</div>
                        </td>
                        <td className="px-3 py-2 font-medium">Size {it.size}</td>
                        <td className="px-3 py-2 text-right font-semibold">{it.quantityPieces} pcs</td>
                        <td className="px-3 py-2 text-right text-muted-foreground">৳{it.pricePerPiece}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatBDT(it.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="space-y-1 text-xs text-right">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Pieces:</span>
                  <span className="font-bold text-foreground">{activeChallan.totalPieces} pcs</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Grand Total:</span>
                  <span className="font-bold text-foreground">{formatBDT(activeChallan.totalAmount)}</span>
                </div>
                {activeChallan.paidAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Upfront Paid:</span>
                    <span>{formatBDT(activeChallan.paidAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-foreground border-t border-border pt-1">
                  <span>Receivable Balance:</span>
                  <span className="text-rose-600 dark:text-rose-400">
                    {formatBDT(activeChallan.outstandingAmount)}
                  </span>
                </div>
              </div>

              {activeChallan.notes && (
                <p className="text-xs text-muted-foreground italic border-t border-border pt-2">
                  Challan Note: {activeChallan.notes}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Print Challan
              </Button>
              <Button size="sm" onClick={() => setActiveChallan(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dispatch Dialog */}
      <DispatchDeliveryDialog
        open={dispatchOpen}
        onOpenChange={setDispatchOpen}
        shopkeepers={shopkeepers}
        onSuccess={loadData}
      />
    </div>
  )
}
