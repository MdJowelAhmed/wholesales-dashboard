import React from 'react'
import { DataTable, ColumnDef } from '@/components/shared/DataTable/DataTable'
import { RawMaterial } from '@/types/rawMaterials'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface RawMaterialsTabProps {
  materials: RawMaterial[]
}

export function RawMaterialsTab({ materials }: RawMaterialsTabProps): React.JSX.Element {
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

  return (
    <DataTable
      data={materials}
      columns={rmColumns}
      searchKey={(m) => `${m.name} ${m.code} ${m.category} ${m.supplierName}`}
      searchPlaceholder="Search fabrics & accessories by name, code, or supplier..."
      emptyTitle="No raw materials in stock"
      emptyDescription="Register fabrics and trims in raw materials store."
    />
  )
}
