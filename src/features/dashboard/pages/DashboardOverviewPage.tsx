import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Package,
  Layers,
  Store,
  Truck,
  Users,
  AlertTriangle,
  PlusCircle,
  FileText,
  RotateCcw,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { LoadingState } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { financeRepository, DashboardMetrics } from '@/mocks/repositories/financeRepository'
import { productsRepository } from '@/mocks/repositories/productsRepository'
import { shopkeepersRepository } from '@/mocks/repositories/shopkeepersRepository'
import { salesRepository } from '@/mocks/repositories/salesRepository'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'
import { Product } from '@/types/products'
import { Shopkeeper } from '@/types/shopkeepers'
import { Sale } from '@/types/sales'
import { DashboardCharts } from '../components/DashboardCharts'
import { RecentSalesTable } from '../components/RecentSalesTable'
import { TopShopkeepersCard } from '../components/TopShopkeepersCard'

const monthlyTrendData = [
  { month: 'May', sales: 180000, production: 195000 },
  { month: 'Jun', sales: 220000, production: 210000 },
  { month: 'Jul', sales: 260000, production: 275000 },
  { month: 'Aug', sales: 310000, production: 330000 },
  { month: 'Sep', sales: 345000, production: 360000 },
  { month: 'Oct', sales: 395000, production: 380000 },
]

const categoryDistribution = [
  { category: "Kids' Wear", pieces: 790, valuation: 234400 },
  { category: "Boys' Wear", pieces: 940, valuation: 345000 },
  { category: "Girls' Wear", pieces: 355, valuation: 143300 },
  { category: "Infants' Wear", pieces: 920, valuation: 210800 },
]

export function DashboardOverviewPage(): React.JSX.Element {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [topShopkeepers, setTopShopkeepers] = useState<Shopkeeper[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const loadData = async () => {
    try {
      const [m, s, sk, p] = await Promise.all([
        financeRepository.getDashboardMetrics(),
        salesRepository.listSales(),
        shopkeepersRepository.listShopkeepers(),
        productsRepository.listProducts(),
      ])
      setMetrics(m)
      setRecentSales(s.slice(0, 5))
      setTopShopkeepers(sk.slice(0, 4))
      setProducts(p)
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
  }, [])

  if (loading || !metrics) {
    return <LoadingState message="Loading manufacturing KPIs and financial summary..." />
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Business & Factory Overview"
        description="Daily manufacturing output, finished goods inventory, wholesale credit ledger, and financial status."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" asChild className="bg-primary text-primary-foreground text-xs shadow-sm">
              <Link to="/sales">
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                New Invoice
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="text-xs">
              <Link to="/production">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Log Production
              </Link>
            </Button>
          </div>
        }
      />

      {/* Row 1: Key Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Today's Sales"
          value={formatBDT(metrics.todaySales ?? 0)}
          subtitle="Realized wholesale & retail"
          icon={TrendingUp}
        />
        <SummaryCard
          title="Finished Goods Stock"
          value={`${(metrics.totalFinishedGoodsPieces ?? 0).toLocaleString()} pcs`}
          subtitle={`Valuation: ${formatBDT(metrics.finishedGoodsStockValue ?? 0)}`}
          icon={Package}
        />
        <SummaryCard
          title="Shopkeeper Receivables"
          value={formatBDT(metrics.outstandingShopkeeperBalances ?? 0)}
          subtitle="Wholesale market dues"
          icon={Store}
        />
        <SummaryCard
          title="Supplier Payables"
          value={formatBDT(metrics.supplierPayables ?? 0)}
          subtitle="Fabrics & trims dues"
          icon={Layers}
        />
        <SummaryCard
          title="Wage Liabilities"
          value={formatBDT(metrics.employeeWageLiabilities ?? 0)}
          subtitle="Operator & cutter pending wages"
          icon={Users}
        />
      </div>

      {/* Recharts Visualizations Grid */}
      <DashboardCharts
        monthlyTrendData={monthlyTrendData}
        categoryDistribution={categoryDistribution}
      />

      {/* Main Grid: Recent Sales & Top Wholesale Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentSalesTable sales={recentSales} />
        <TopShopkeepersCard shopkeepers={topShopkeepers} />
      </div>

      {/* Bottom Row: Production Watchlist & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-status-pending" />
              Garment Model Inventory Watchlist
            </CardTitle>
            <CardDescription>Finished stock levels by model code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {products.slice(0, 4).map((prod) => {
              const totalStock = prod.variants.reduce((s, v) => s + v.stockPieces, 0)
              return (
                <div
                  key={prod.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <Link to={`/products/${prod.id}`} className="font-medium text-sm text-foreground hover:underline">
                      {prod.name}
                    </Link>
                    <span className="text-xs text-muted-foreground ml-2 font-mono">
                      ({prod.code})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-foreground">
                      {totalStock} pieces
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">in stock</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Quick Master Actions
            </CardTitle>
            <CardDescription>Immediate factory operational shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" asChild className="h-16 flex flex-col items-center justify-center gap-1.5 p-2">
              <Link to="/deliveries">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold">Dispatch Challan</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16 flex flex-col items-center justify-center gap-1.5 p-2">
              <Link to="/returns">
                <RotateCcw className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold">Process Return</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16 flex flex-col items-center justify-center gap-1.5 p-2">
              <Link to="/inventory">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold">Adjust Stock</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16 flex flex-col items-center justify-center gap-1.5 p-2">
              <Link to="/reports">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold">P&L Report</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
