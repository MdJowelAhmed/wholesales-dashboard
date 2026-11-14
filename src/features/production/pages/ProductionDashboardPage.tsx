import React, { useState, useTransition } from 'react'
import {
  Factory,
  Plus,
  CheckCircle2,
  TrendingUp,
  Clock,
  Layers,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { TableSkeleton, CardGridSkeleton } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { productionRepository } from '@/mocks/repositories/productionRepository'
import { productsRepository } from '@/mocks/repositories/productsRepository'
import { employeesRepository } from '@/mocks/repositories/employeesRepository'
import { useRepositoryQuery, QUERY_INVALIDATION_SCOPES } from '@/lib/hooks'
import { ProductionEntry, ProductionOrder } from '@/types/production'
import { Product } from '@/types/products'
import { Employee } from '@/types/employees'
import {
  formatBDT,
  calculateProductionEfficiency,
} from '@/lib/calculations/financialCalculations'
import { CreateProductionOrderDialog } from '../components/CreateProductionOrderDialog'
import { LogProductionOutputDialog } from '../components/LogProductionOutputDialog'
import { ProductionOrdersCard } from '../components/ProductionOrdersCard'
import { ProductionEntriesTable } from '../components/ProductionEntriesTable'
import { toast } from 'sonner'

interface ProductionDashboardData {
  orders: ProductionOrder[]
  entries: ProductionEntry[]
  products: Product[]
  employees: Employee[]
}

export function ProductionDashboardPage(): React.JSX.Element {
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [outputDialogOpen, setOutputDialogOpen] = useState(false)
  const [, startTransition] = useTransition()

  const { data, loading, refetch } = useRepositoryQuery<ProductionDashboardData>(
    async () => {
      const [o, ent, p, emp] = await Promise.all([
        productionRepository.listOrders(),
        productionRepository.listEntries(),
        productsRepository.listProducts(),
        employeesRepository.listEmployees(),
      ])
      return { orders: o, entries: ent, products: p, employees: emp }
    },
    {
      initialData: {
        orders: [],
        entries: [],
        products: [],
        employees: [],
      },
      invalidationScopes: [...QUERY_INVALIDATION_SCOPES.production],
    }
  )

  const { orders, entries, products, employees } = data

  const handleRefetch = () => {
    startTransition(() => {
      refetch()
    })
  }

  const handleApproveQC = async (entryId: string) => {
    try {
      await productionRepository.approveEntry(entryId)
      toast.success('QC batch approved and restocked to finished goods')
      handleRefetch()
    } catch {
      toast.error('Failed to approve entry')
    }
  }

  const totalTargetPieces = orders.reduce((sum, o) => sum + (o.targetQuantityPieces ?? 0), 0)
  const totalCompletedPieces = entries
    .filter((e) => e.status === 'approved')
    .reduce((sum, e) => sum + (e.goodQuantityPieces ?? 0), 0)
  const totalDamagedPieces = entries.reduce((sum, e) => sum + (e.damagedQuantityPieces ?? 0), 0)
  const totalPiecesAttempted = totalCompletedPieces + totalDamagedPieces
  const efficiencyRate = calculateProductionEfficiency(totalCompletedPieces, totalPiecesAttempted)
  const totalWagesAccrued = entries.reduce((sum, e) => sum + (e.calculatedWage ?? 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Garments Production Floor"
        description="Cutting orders, tailor daily output tracking, QC inspection pass counters, and piece-rate wages."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOrderDialogOpen(true)}
              className="cursor-pointer"
            >
              <Factory className="h-4 w-4 mr-1.5" /> New Production Order
            </Button>
            <Button
              size="sm"
              onClick={() => setOutputDialogOpen(true)}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Log Daily Output
            </Button>
          </div>
        }
      />

      {loading ? (
        <>
          <CardGridSkeleton count={4} />
          <TableSkeleton rows={5} cols={7} />
        </>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Output Completed"
              value={`${totalCompletedPieces.toLocaleString()} pcs`}
              subtitle="Across approved cutting orders"
              icon={Layers}
            />
            <SummaryCard
              title="Scheduled Target"
              value={`${totalTargetPieces.toLocaleString()} pcs`}
              subtitle={`${orders.length} Active Production Batches`}
              icon={Clock}
            />
            <SummaryCard
              title="Floor QC Pass Rate"
              value={`${efficiencyRate}%`}
              subtitle={`${totalDamagedPieces} defective/rejected pieces`}
              icon={CheckCircle2}
            />
            <SummaryCard
              title="Piece Wages Accrued"
              value={formatBDT(totalWagesAccrued)}
              subtitle="Direct sewing & cutting liabilities"
              icon={TrendingUp}
            />
          </div>

          {/* Active Production Orders List */}
          <ProductionOrdersCard orders={orders} />

          {/* Daily Sewing Output & QC Log Table */}
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Daily Production Outputs & Piece Wages
              </h2>
              <p className="text-xs text-muted-foreground">
                Itemized operator shifts, inspection counters, and accrued tailor piece wages.
              </p>
            </div>

            <ProductionEntriesTable
              entries={entries}
              onApproveQC={handleApproveQC}
            />
          </div>
        </>
      )}

      <CreateProductionOrderDialog
        products={products}
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        onSuccess={handleRefetch}
      />

      <LogProductionOutputDialog
        orders={orders}
        products={products}
        employees={employees}
        open={outputDialogOpen}
        onOpenChange={setOutputDialogOpen}
        onSuccess={handleRefetch}
      />
    </div>
  )
}
