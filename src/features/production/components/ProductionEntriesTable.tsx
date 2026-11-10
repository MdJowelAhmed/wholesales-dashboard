import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { DataTable, ColumnDef } from '@/components/shared/DataTable/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge/StatusBadge'
import { Button } from '@/components/ui/button'
import { ProductionEntry } from '@/types/production'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface ProductionEntriesTableProps {
  entries: ProductionEntry[]
  onApproveQC: (entryId: string) => void
}

export function ProductionEntriesTable({
  entries,
  onApproveQC,
}: ProductionEntriesTableProps): React.JSX.Element {
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
              onClick={() => onApproveQC(row.id)}
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
    <DataTable
      data={entries}
      columns={columns}
      searchKey={(e) => `${e.orderCode} ${e.productName} ${e.employeeName} ${e.sku}`}
      searchPlaceholder="Search order code, model name, tailor, or SKU..."
      emptyTitle="No production records logged"
      emptyDescription="Log daily completed sewing outputs to update finished goods inventory and operator piece-rate wages."
    />
  )
}

