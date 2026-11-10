import React from 'react'
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
import { CardGridSkeleton } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { financeRepository, DashboardMetrics } from '@/mocks/repositories/financeRepository'
import { productsRepository } from '@/mocks/repositories/productsRepository'
import { shopkeepersRepository } from '@/mocks/repositories/shopkeepersRepository'
import { salesRepository } from '@/mocks/repositories/salesRepository'
import { useRepositoryQuery } from '@/lib/hooks'
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

interface DashboardData {
  metrics: DashboardMetrics | null
  recentSales: Sale[]
  topShopkeepers: Shopkeeper[]
  products: Product[]
}

export function DashboardOverviewPage(): React.JSX.Element {
  const { data, loading } = useRepositoryQuery<DashboardData>(
    async () => {
      const [m, s, sk, p] = await Promise.all([
        financeRepository.getDashboardMetrics(),
        salesRepository.listSales(),
        shopkeepersRepository.listShopkeepers(),
        productsRepository.listProducts(),
      ])
      return {
        metrics: m,
        recentSales: s.slice(0, 5),
        topShopkeepers: sk.slice(0, 4),
        products: p,
      }
    },
    {
      initialData: {
        metrics: null,
        recentSales: [],
        topShopkeepers: [],
        products: [],
      },
    }
  )

  const { metrics, recentSales, topShopkeepers, products } = data

  const lowStockProducts = products.filter((p) =>
    p.variants?.some((v) => (v.stockPieces ?? 0) <= 50)
  )

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

      {loading || !metrics ? (
        <div className="space-y-6">
          <CardGridSkeleton count={5} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-72 bg-muted/40 rounded-lg animate-pulse" />
            <div className="h-72 bg-muted/40 rounded-lg animate-pulse" />
          </div>
        </div>
      ) : (
        <>
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
              subtitle="Liabilities to fabric mills"
              icon={Truck}
            />
            <SummaryCard
              title="Wage Liabilities"
              value={formatBDT(metrics.employeeWageLiabilities ?? 0)}
              subtitle="Due to factory tailors"
              icon={Users}
            />
          </div>

          {/* Row 2: Charts */}
          <DashboardCharts
            monthlyTrendData={monthlyTrendData}
            categoryDistribution={categoryDistribution}
          />

          {/* Row 3: Tables and Operational Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentSalesTable sales={recentSales} />
            </div>
            <div>
              <TopShopkeepersCard shopkeepers={topShopkeepers} />
            </div>
          </div>

          {/* Row 4: Low Stock Warnings & Quick Operations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <CardTitle className="text-base text-foreground">
                    Finished Goods Low Stock Alert
                  </CardTitle>
                </div>
                <CardDescription>
                  Products with variant stocks below safe threshold (50 pcs).
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lowStockProducts.length === 0 ? (
                  <p className="text-xs text-muted-foreground">All finished stock levels are optimal.</p>
                ) : (
                  <div className="space-y-3">
                    {lowStockProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-md bg-muted/40 text-xs border border-border"
                      >
                        <div>
                          <div className="font-semibold text-foreground">{p.name}</div>
                          <div className="text-muted-foreground font-mono">{p.code}</div>
                        </div>
                        <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                          <Link to="/production">Issue Job Order</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Master Actions</CardTitle>
                <CardDescription>Standard everyday garments workflow entries.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Button variant="outline" asChild className="h-12 justify-start px-3">
                    <Link to="/deliveries" className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">Dispatch Delivery</div>
                        <div className="text-[10px] text-muted-foreground">Challan generation</div>
                      </div>
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-12 justify-start px-3">
                    <Link to="/payments" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">Record Payment</div>
                        <div className="text-[10px] text-muted-foreground">bKash/Cash/Bank</div>
                      </div>
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-12 justify-start px-3">
                    <Link to="/raw-materials" className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">Stock In Fabric</div>
                        <div className="text-[10px] text-muted-foreground">Raw store addition</div>
                      </div>
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-12 justify-start px-3">
                    <Link to="/returns" className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">Customer Return</div>
                        <div className="text-[10px] text-muted-foreground">Credit adjustments</div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
