import React, { useEffect, useState, useMemo } from 'react'
import { Plus, Layers, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { StatusBadge } from '@/components/shared/StatusBadge/StatusBadge'
import { DataTable, ColumnDef } from '@/components/shared/DataTable/DataTable'
import { LoadingState } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { rawMaterialsRepository } from '@/mocks/repositories/rawMaterialsRepository'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'
import { RawMaterial } from '@/types/rawMaterials'
import { AddRawMaterialDialog } from '../components/AddRawMaterialDialog'
import { formatBDT } from '@/lib/calculations/financialCalculations'

export function RawMaterialsListPage(): React.JSX.Element {
  const [materials, setMaterials] = useState<RawMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')

  const loadMaterials = async () => {
    try {
      const data = await rawMaterialsRepository.listRawMaterials()
      setMaterials(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMaterials()
    const unsubscribe = mockStorage.subscribe(() => {
      loadMaterials()
    })
    return () => unsubscribe()
  }, [])

  const filteredMaterials = useMemo(() => {
    if (categoryFilter === 'all') return materials
    return materials.filter((m) => m.category === categoryFilter)
  }, [materials, categoryFilter])

  const totalValuation = materials.reduce(
    (sum, m) => sum + m.availableQuantity * m.averageCost,
    0
  )
  const lowStockCount = materials.filter(
    (m) => m.availableQuantity <= m.reorderThreshold
  ).length

  const columns: ColumnDef<RawMaterial>[] = [
    {
      key: 'name',
      header: 'Material Name & Code',
      sortable: true,
      cell: (row) => {
        const isLow = row.availableQuantity <= row.reorderThreshold
        return (
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-md flex items-center justify-center font-bold text-xs ${
                isLow
                  ? 'bg-status-pending/20 text-status-pending-foreground dark:text-status-pending'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <span>{row.name}</span>
                {isLow && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-status-pending/20 text-status-pending-foreground dark:text-status-pending">
                    <AlertTriangle className="h-3 w-3" /> LOW
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground font-mono">{row.code}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
          {row.category}
        </span>
      ),
    },
    {
      key: 'availableQuantity',
      header: 'Current Stock',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-foreground">
            {row.availableQuantity.toLocaleString()} {row.baseUnit}
          </span>
          <div className="text-[10px] text-muted-foreground">
            Reorder at: {row.reorderThreshold} {row.baseUnit}
          </div>
        </div>
      ),
    },
    {
      key: 'averageCost',
      header: 'Unit Cost',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {formatBDT(row.averageCost)} / {row.baseUnit}
        </span>
      ),
    },
    {
      key: 'valuation',
      header: 'Stock Valuation',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {formatBDT(row.availableQuantity * row.averageCost)}
        </span>
      ),
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      cell: (row) => (
        <span className="text-xs text-muted-foreground font-medium">
          {row.supplierName}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ]

  if (loading) {
    return <LoadingState message="Loading factory raw materials inventory..." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raw Materials & Fabric Store"
        description="Fabrics (knitted & woven), sewing threads, metal snap buttons, zippers, and trims inventory."
        actions={
          <Button onClick={() => setAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Raw Material
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Stock Value"
          value={formatBDT(totalValuation)}
          subtitle="Fabrics, accessories & trims in store"
          icon={DollarSign}
        />
        <SummaryCard
          title="Cataloged Materials"
          value={materials.length}
          subtitle="Distinct materials & units"
          icon={Layers}
        />
        <SummaryCard
          title="Low Stock Watchlist"
          value={`${lowStockCount} items`}
          subtitle={lowStockCount > 0 ? 'Requires supplier reorder' : 'Healthy inventory'}
          icon={lowStockCount > 0 ? AlertTriangle : ShieldCheck}
          trend={
            lowStockCount > 0
              ? { value: 'Reorder needed', isPositive: false }
              : { value: 'Optimal', isPositive: true }
          }
        />
      </div>

      <DataTable
        data={filteredMaterials}
        columns={columns}
        searchKey={(m) => `${m.name} ${m.code} ${m.supplierName}`}
        searchPlaceholder="Search material name, code, or supplier..."
        filterNode={
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Categories</option>
            <option value="Knitted Fabrics">Knitted Fabrics</option>
            <option value="Woven Fabrics">Woven Fabrics</option>
            <option value="Sewing Accessories">Sewing Accessories</option>
            <option value="Buttons & Fasteners">Buttons & Fasteners</option>
          </select>
        }
        emptyTitle="No raw materials found"
        emptyDescription="Add new fabrics or trims to track inventory."
      />

      <AddRawMaterialDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={loadMaterials}
      />
    </div>
  )
}
