import React, { useEffect, useState } from 'react'
import {
  Package,
  Layers,
  AlertTriangle,
  Sliders,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { DataTable, ColumnDef } from '@/components/shared/DataTable/DataTable'
import { LoadingState } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { inventoryRepository } from '@/mocks/repositories/inventoryRepository'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'
import { FinishedGoodsStockItem, InventoryMovement } from '@/types/inventory'
import { RawMaterial } from '@/types/rawMaterials'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { AdjustStockDialog } from '../components/AdjustStockDialog'

export type FinishedGoodsRow = FinishedGoodsStockItem & { id: string }

export function InventoryManagementPage(): React.JSX.Element {
  const [finishedGoods, setFinishedGoods] = useState<FinishedGoodsRow[]>([])
  const [materials, setMaterials] = useState<RawMaterial[]>([])
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [activeTab, setActiveTab] = useState<'finished_goods' | 'raw_materials' | 'movements'>('finished_goods')
  const [loading, setLoading] = useState(true)
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)

  const loadData = async () => {
    try {
      const [fg, m, mov] = await Promise.all([
        inventoryRepository.getFinishedGoodsStock(),
        inventoryRepository.getRawMaterialsStock(),
        inventoryRepository.getStockMovements(),
      ])
      setFinishedGoods(fg.map((item) => ({ ...item, id: item.variantId })))
      setMaterials(m)
      setMovements(mov)
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

  if (loading) {
    return <LoadingState message="Loading warehouse inventory balances..." />
  }

  const totalFGPieces = finishedGoods.reduce((sum, item) => sum + item.currentPieces, 0)
  const totalFGValuation = finishedGoods.reduce((sum, item) => sum + item.valuation, 0)
  const totalMaterialValuation = materials.reduce(
    (sum, m) => sum + m.availableQuantity * m.averageCost,
    0
  )
  const lowStockFGCount = finishedGoods.filter((fg) => fg.currentPieces <= fg.reorderLevel).length
  const lowStockRMCount = materials.filter((m) => m.availableQuantity <= m.reorderThreshold).length

  // Finished Goods Columns
  const fgColumns: ColumnDef<FinishedGoodsRow>[] = [
    {
      key: 'productName',
      header: 'Garment Model & SKU',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-foreground text-xs">{row.productName}</span>
          <div className="font-mono text-[11px] text-muted-foreground">{row.sku}</div>
        </div>
      ),
    },
    {
      key: 'size',
      header: 'Size & Color',
      sortable: true,
      cell: (row) => (
        <div className="text-xs">
          <span className="font-bold text-foreground">Size {row.size}</span>
          {row.color && <span className="text-muted-foreground ml-1.5">({row.color})</span>}
        </div>
      ),
    },
    {
      key: 'currentPieces',
      header: 'Stock Pieces',
      sortable: true,
      cell: (row) => {
        const isLow = row.currentPieces <= row.reorderLevel
        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs font-bold ${
                isLow ? 'text-status-error' : 'text-foreground'
              }`}
            >
              {row.currentPieces.toLocaleString()} pcs
            </span>
            {isLow && (
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-status-error/10 text-status-error">
                LOW
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'pricePerPiece',
      header: 'Wholesale / Piece',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {formatBDT(row.pricePerPiece)}
        </span>
      ),
    },
    {
      key: 'valuation',
      header: 'Inventory Valuation',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {formatBDT(row.valuation)}
        </span>
      ),
    },
    {
      key: 'reorderLevel',
      header: 'Threshold',
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{row.reorderLevel} pcs</span>
      ),
    },
  ]

  // Raw Materials Columns
  const rmColumns: ColumnDef<RawMaterial>[] = [
    {
      key: 'name',
      header: 'Raw Material',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-foreground text-xs">{row.name}</span>
          <div className="font-mono text-[11px] text-muted-foreground">{row.code}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{row.category}</span>
      ),
    },
    {
      key: 'availableQuantity',
      header: 'Available Stock',
      sortable: true,
      cell: (row) => {
        const isLow = row.availableQuantity <= row.reorderThreshold
        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs font-bold ${
                isLow ? 'text-status-error' : 'text-foreground'
              }`}
            >
              {row.availableQuantity.toLocaleString()} {row.baseUnit}
            </span>
            {isLow && (
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-status-error/10 text-status-error">
                LOW
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'averageCost',
      header: 'Avg Cost / Unit',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-foreground font-semibold">
          {formatBDT(row.averageCost)}
        </span>
      ),
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{row.supplierName}</span>
      ),
    },
  ]

  // Stock Movements Columns
  const movColumns: ColumnDef<InventoryMovement>[] = [
    {
      key: 'date',
      header: 'Date & Type',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-foreground text-xs">{row.date}</span>
          <div className="text-[11px] text-muted-foreground uppercase">
            {row.itemType.replace('_', ' ')}
          </div>
        </div>
      ),
    },
    {
      key: 'itemName',
      header: 'Stock Item',
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-foreground text-xs">{row.itemName}</span>
      ),
    },
    {
      key: 'movementType',
      header: 'Movement Event',
      cell: (row) => {
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium uppercase">
            {row.movementType.replace('_', ' ')}
          </span>
        )
      },
    },
    {
      key: 'quantityChange',
      header: 'Quantity Change',
      sortable: true,
      cell: (row) => {
        const isPositive = row.quantityChange > 0
        return (
          <div className="flex items-center gap-1 font-mono text-xs font-bold">
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-status-success" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-status-error" />
            )}
            <span className={isPositive ? 'text-status-success' : 'text-status-error'}>
              {isPositive ? `+${row.quantityChange}` : row.quantityChange} {row.unit}
            </span>
          </div>
        )
      },
    },
    {
      key: 'notes',
      header: 'Audit Notes',
      cell: (row) => (
        <span className="text-xs text-muted-foreground line-clamp-1">{row.notes || '—'}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse & Finished Goods Inventory"
        description="Piece-level finished garment stocks per size/model, fabric store levels, and comprehensive audit logs."
        actions={
          <Button
            size="sm"
            onClick={() => setAdjustDialogOpen(true)}
            className="cursor-pointer"
          >
            <Sliders className="h-4 w-4 mr-1.5" /> Adjust Stock
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <SummaryCard
          title="Finished Garments Stock"
          value={`${totalFGPieces.toLocaleString()} pcs`}
          subtitle="Ready for wholesale & retail dispatch"
          icon={Package}
        />
        <SummaryCard
          title="Finished Goods Valuation"
          value={formatBDT(totalFGValuation)}
          subtitle="Based on per-piece wholesale prices"
          icon={DollarSign}
        />
        <SummaryCard
          title="Raw Material Valuation"
          value={formatBDT(totalMaterialValuation)}
          subtitle="Fabrics, yarns, and accessories"
          icon={Layers}
        />
        <SummaryCard
          title="Low Stock Alerts"
          value={`${lowStockFGCount + lowStockRMCount} Items`}
          subtitle={`${lowStockFGCount} garments • ${lowStockRMCount} fabrics`}
          icon={AlertTriangle}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('finished_goods')}
          className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'finished_goods'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Finished Garments Stock ({finishedGoods.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('raw_materials')}
          className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'raw_materials'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Raw Materials & Fabric Store ({materials.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('movements')}
          className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'movements'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Stock Movements Audit Log ({movements.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'finished_goods' && (
        <DataTable
          data={finishedGoods}
          columns={fgColumns}
          searchKey={(fg) => `${fg.productName} ${fg.sku} ${fg.size} ${fg.color || ''}`}
          searchPlaceholder="Search finished garments by model, SKU, size, or color..."
          emptyTitle="No finished garments in stock"
          emptyDescription="Finished goods appear here as production batches pass QC or stock is adjusted."
        />
      )}

      {activeTab === 'raw_materials' && (
        <DataTable
          data={materials}
          columns={rmColumns}
          searchKey={(m) => `${m.name} ${m.code} ${m.category} ${m.supplierName}`}
          searchPlaceholder="Search fabrics & accessories by name, code, or supplier..."
          emptyTitle="No raw materials in stock"
          emptyDescription="Register fabrics and trims in raw materials store."
        />
      )}

      {activeTab === 'movements' && (
        <DataTable
          data={movements}
          columns={movColumns}
          searchKey={(mov) => `${mov.itemName} ${mov.movementType} ${mov.notes || ''}`}
          searchPlaceholder="Search stock audit movements..."
          emptyTitle="No movements recorded"
          emptyDescription="Every production receipt, sale dispatch, return, and adjustment is recorded here."
        />
      )}

      <AdjustStockDialog
        finishedGoods={finishedGoods}
        materials={materials}
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        onSuccess={loadData}
      />
    </div>
  )
}
