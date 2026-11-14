import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Package, Store, Users, PlusCircle, FileText, Truck } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { CardGridSkeleton } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { financeRepository, DashboardMetrics } from '@/mocks/repositories/financeRepository'
import { productsRepository } from '@/mocks/repositories/productsRepository'
import { shopkeepersRepository } from '@/mocks/repositories/shopkeepersRepository'
import { salesRepository } from '@/mocks/repositories/salesRepository'
import { productionRepository } from '@/mocks/repositories/productionRepository'
import { ProductionEntry } from '@/types/production'
import { useRepositoryQuery, QUERY_INVALIDATION_SCOPES } from '@/lib/hooks'
import { Product } from '@/types/products'
import { Shopkeeper } from '@/types/shopkeepers'
import { Sale } from '@/types/sales'
import { DashboardCharts } from '../components/DashboardCharts'
import { RecentSalesTable } from '../components/RecentSalesTable'
import { TopShopkeepersCard } from '../components/TopShopkeepersCard'
import { DashboardLowStockAlertCard } from '../components/DashboardLowStockAlertCard'
import { DashboardQuickActionsCard } from '../components/DashboardQuickActionsCard'
import {
  buildCategoryDistribution,
  buildMonthlyOperationsTrend,
} from '../lib/dashboardAggregations'

interface DashboardData {
  metrics: DashboardMetrics | null
  sales: Sale[]
  productionEntries: ProductionEntry[]
  topShopkeepers: Shopkeeper[]
  products: Product[]
}

export function DashboardOverviewPage(): React.JSX.Element {
  const { data, loading } = useRepositoryQuery<DashboardData>(
    async () => {
      const [m, sales, sk, p, productionEntries] = await Promise.all([
        financeRepository.getDashboardMetrics(),
        salesRepository.listSales(),
        shopkeepersRepository.listShopkeepers(),
        productsRepository.listProducts(),
        productionRepository.listEntries(),
      ])
      return {
        metrics: m,
        sales,
        productionEntries,
        topShopkeepers: sk.slice(0, 4),
        products: p,
      }
    },
    {
      initialData: {
        metrics: null,
        sales: [],
        productionEntries: [],
        topShopkeepers: [],
        products: [],
      },
      invalidationScopes: [...QUERY_INVALIDATION_SCOPES.dashboard],
    }
  )

  const { metrics, sales, productionEntries, topShopkeepers, products } = data

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.variants?.some((v) => (v.stockPieces ?? 0) <= 50)),
    [products]
  )

  const categoryDistribution = useMemo(() => buildCategoryDistribution(products), [products])
  const monthlyTrendData = useMemo(
    () => buildMonthlyOperationsTrend(sales, productionEntries),
    [sales, productionEntries]
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
              <RecentSalesTable sales={sales.slice(0, 5)} />
            </div>
            <div>
              <TopShopkeepersCard shopkeepers={topShopkeepers} />
            </div>
          </div>

          {/* Row 4: Low Stock Warnings & Quick Operations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardLowStockAlertCard lowStockProducts={lowStockProducts} />
            <DashboardQuickActionsCard />
          </div>
        </>
      )}
    </div>
  )
}
