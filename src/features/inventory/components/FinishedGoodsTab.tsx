import React from 'react'
import { DataTable, ColumnDef } from '@/components/shared/DataTable/DataTable'
import { FinishedGoodsStockItem } from '@/types/inventory'
import { formatBDT } from '@/lib/calculations/financialCalculations'

export type FinishedGoodsRow = FinishedGoodsStockItem & { id: string }

interface FinishedGoodsTabProps {
  finishedGoods: FinishedGoodsRow[]
}

export function FinishedGoodsTab({ finishedGoods }: FinishedGoodsTabProps): React.JSX.Element {
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

  return (
    <DataTable
      data={finishedGoods}
      columns={fgColumns}
      searchKey={(fg) => `${fg.productName} ${fg.sku} ${fg.size} ${fg.color || ''}`}
      searchPlaceholder="Search finished garments by model, SKU, size, or color..."
      emptyTitle="No finished garments in stock"
      emptyDescription="Finished goods appear here as production batches pass QC or stock is adjusted."
    />
  )
}

