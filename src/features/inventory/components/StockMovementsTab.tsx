import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { DataTable, ColumnDef } from '@/components/shared/DataTable/DataTable'
import { InventoryMovement } from '@/types/inventory'

interface StockMovementsTabProps {
  movements: InventoryMovement[]
}

export function StockMovementsTab({ movements }: StockMovementsTabProps): React.JSX.Element {
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
      cell: (row) => (
        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium uppercase">
          {row.movementType.replace('_', ' ')}
        </span>
      ),
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
    <DataTable
      data={movements}
      columns={movColumns}
      searchKey={(mov) => `${mov.itemName} ${mov.movementType} ${mov.notes || ''}`}
      searchPlaceholder="Search stock audit movements..."
      emptyTitle="No movements recorded"
      emptyDescription="Every production receipt, sale dispatch, return, and adjustment is recorded here."
    />
  )
}

