import React, { useState, useTransition } from 'react'
import {
  Package,
  Layers,
  AlertTriangle,
  Sliders,
  DollarSign,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { TableSkeleton, CardGridSkeleton } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { inventoryRepository } from '@/mocks/repositories/inventoryRepository'
import { useRepositoryQuery } from '@/lib/hooks'
import { InventoryMovement } from '@/types/inventory'
import { RawMaterial } from '@/types/rawMaterials'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { AdjustStockDialog } from '../components/AdjustStockDialog'
import { FinishedGoodsTab, FinishedGoodsRow } from '../components/FinishedGoodsTab'
import { RawMaterialsTab } from '../components/RawMaterialsTab'
import { StockMovementsTab } from '../components/StockMovementsTab'

interface InventoryData {
  finishedGoods: FinishedGoodsRow[]
  materials: RawMaterial[]
  movements: InventoryMovement[]
}

export function InventoryManagementPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'finished_goods' | 'raw_materials' | 'movements'>('finished_goods')
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [, startTransition] = useTransition()

  const { data, loading, refetch } = useRepositoryQuery<InventoryData>(
    async () => {
      const [fg, m, mov] = await Promise.all([
        inventoryRepository.getFinishedGoodsStock(),
        inventoryRepository.getRawMaterialsStock(),
        inventoryRepository.getStockMovements(),
      ])
      return {
        finishedGoods: fg.map((item) => ({ ...item, id: item.variantId })),
        materials: m,
        movements: mov,
      }
    },
    {
      initialData: {
        finishedGoods: [],
        materials: [],
        movements: [],
      },
    }
  )

  const { finishedGoods, materials, movements } = data

  const handleRefetch = () => {
    startTransition(() => {
      refetch()
    })
  }

  const totalFGPieces = finishedGoods.reduce((sum, item) => sum + (item.currentPieces ?? 0), 0)
  const totalFGValuation = finishedGoods.reduce((sum, item) => sum + (item.valuation ?? 0), 0)
  const totalMaterialValuation = materials.reduce(
    (sum, m) => sum + (m.availableQuantity ?? 0) * (m.averageCost ?? 0),
    0
  )
  const lowStockFGCount = finishedGoods.filter((fg) => (fg.currentPieces ?? 0) <= (fg.reorderLevel ?? 0)).length
  const lowStockRMCount = materials.filter((m) => (m.availableQuantity ?? 0) <= (m.reorderThreshold ?? 0)).length

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

      {loading ? (
        <>
          <CardGridSkeleton count={4} />
          <TableSkeleton rows={5} cols={6} />
        </>
      ) : (
        <>
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
            <FinishedGoodsTab finishedGoods={finishedGoods} />
          )}

          {activeTab === 'raw_materials' && (
            <RawMaterialsTab materials={materials} />
          )}

          {activeTab === 'movements' && (
            <StockMovementsTab movements={movements} />
          )}
        </>
      )}

      <AdjustStockDialog
        finishedGoods={finishedGoods}
        materials={materials}
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        onSuccess={handleRefetch}
      />
    </div>
  )
}
