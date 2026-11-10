import React, { useEffect, useState } from 'react'
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
import { StatusBadge } from '@/components/shared/StatusBadge/StatusBadge'
import { DataTable, ColumnDef } from '@/components/shared/DataTable/DataTable'
import { LoadingState } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { productionRepository } from '@/mocks/repositories/productionRepository'
import { productsRepository } from '@/mocks/repositories/productsRepository'
import { employeesRepository } from '@/mocks/repositories/employeesRepository'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'
import { ProductionEntry, ProductionOrder } from '@/types/production'
import { Product } from '@/types/products'
import { Employee } from '@/types/employees'
import {
  formatBDT,
  calculateProductionEfficiency,
} from '@/lib/calculations/financialCalculations'
import { CreateProductionOrderDialog } from '../components/CreateProductionOrderDialog'
import { LogProductionOutputDialog } from '../components/LogProductionOutputDialog'
import { toast } from 'sonner'

export function ProductionDashboardPage(): React.JSX.Element {
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [entries, setEntries] = useState<ProductionEntry[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [outputDialogOpen, setOutputDialogOpen] = useState(false)

  const loadData = async () => {
    try {
      const [o, ent, p, emp] = await Promise.all([
        productionRepository.listOrders(),
        productionRepository.listEntries(),
        productsRepository.listProducts(),
        employeesRepository.listEmployees(),
      ])
      setOrders(o)
      setEntries(ent)
      setProducts(p)
      setEmployees(emp)
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

  const handleApproveQC = async (entryId: string) => {
    try {
      await productionRepository.approveEntry(entryId)
      toast.success('QC batch approved and restocked to finished goods')
      loadData()
    } catch {
      toast.error('Failed to approve entry')
    }
  }

  if (loading) {
    return <LoadingState message="Loading garments production floor operations..." />
  }

  const totalTargetPieces = orders.reduce((sum, o) => sum + o.targetQuantityPieces, 0)
  const totalCompletedPieces = entries
    .filter((e) => e.status === 'approved')
    .reduce((sum, e) => sum + e.goodQuantityPieces, 0)
  const totalDamagedPieces = entries.reduce((sum, e) => sum + e.damagedQuantityPieces, 0)
  const totalPiecesAttempted = totalCompletedPieces + totalDamagedPieces
  const efficiencyRate = calculateProductionEfficiency(totalCompletedPieces, totalPiecesAttempted)
  const totalWagesAccrued = entries.reduce((sum, e) => sum + e.calculatedWage, 0)

  const columns: ColumnDef<ProductionEntry>[] = [
    {
      key: 'productionDate',
      header: 'Date & Order',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-foreground text-xs">{row.productionDate}</span>
          <div className="font-mono text-[11px] text-muted-foreground">{row.orderCode}</div>
        </div>
      ),
    },
    {
      key: 'productName',
      header: 'Model & Size',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-medium text-foreground text-xs">{row.productName}</span>
          <div className="text-[11px] text-muted-foreground">
            Size: <span className="font-bold text-foreground">{row.size}</span> • SKU: {row.sku}
          </div>
        </div>
      ),
    },
    {
      key: 'employeeName',
      header: 'Tailor / Operator',
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-semibold text-foreground">{row.employeeName}</span>
      ),
    },
    {
      key: 'goodQuantityPieces',
      header: 'Output Pieces',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-status-success">
            {row.goodQuantityPieces} passed
          </span>
          {row.damagedQuantityPieces > 0 && (
            <div className="text-[10px] text-status-error font-medium">
              {row.damagedQuantityPieces} rejected
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'calculatedWage',
      header: 'Wage Earned',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-foreground">
            {formatBDT(row.calculatedWage)}
          </span>
          <div className="text-[10px] text-muted-foreground">
            @{formatBDT(row.applicableWageRate)}/{row.inputUnit}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'QC Inspection',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'id',
      header: 'Action',
      cell: (row) => (
        <div>
          {row.status === 'pending_inspection' ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
              onClick={() => handleApproveQC(row.id)}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve QC
            </Button>
          ) : (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-status-success" /> Verified
            </span>
          )}
        </div>
      ),
    },
  ]

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Output Completed"
          value={`${totalCompletedPieces.toLocaleString()} pcs`}
          subtitle={`Across approved cutting orders`}
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
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Factory className="h-4 w-4 text-primary" />
                Active Cutting & Sewing Orders
              </CardTitle>
              <CardDescription>
                Progress towards batch target quantity in finished pieces
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {orders.map((order) => {
              const progress = Math.min(
                100,
                Math.round((order.completedPieces / order.targetQuantityPieces) * 100)
              )
              return (
                <div
                  key={order.id}
                  className="p-4 rounded-lg border border-border bg-card/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {order.orderCode}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                      {order.productName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Due: {order.dueDate}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-mono font-bold text-foreground">
                        {order.completedPieces} / {order.targetQuantityPieces} pcs ({progress}%)
                      </span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

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

        <DataTable
          data={entries}
          columns={columns}
          searchKey={(e) => `${e.orderCode} ${e.productName} ${e.employeeName} ${e.sku}`}
          searchPlaceholder="Search order code, model name, tailor, or SKU..."
          emptyTitle="No production records logged"
          emptyDescription="Log daily completed sewing outputs to update finished goods inventory and operator piece-rate wages."
        />
      </div>

      <CreateProductionOrderDialog
        products={products}
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        onSuccess={loadData}
      />

      <LogProductionOutputDialog
        orders={orders}
        products={products}
        employees={employees}
        open={outputDialogOpen}
        onOpenChange={setOutputDialogOpen}
        onSuccess={loadData}
      />
    </div>
  )
}
