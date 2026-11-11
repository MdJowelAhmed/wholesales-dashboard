import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface WorkerWorkCalculationCardProps {
  totalPieces: number
  rate: number
  unit: string
  lineTotal: number
}

export function WorkerWorkCalculationCard({
  totalPieces,
  rate,
  unit,
  lineTotal,
}: WorkerWorkCalculationCardProps): React.JSX.Element {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-1.5">
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Equivalent Pieces (মোট পিস):</span>
        <span className="font-mono font-semibold text-foreground">{totalPieces} pcs</span>
      </div>
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Rate applied (দর):</span>
        <span className="font-mono text-foreground">
          ৳{rate}/{unit}
        </span>
      </div>
      <div className="flex justify-between items-center border-t border-border/60 pt-1.5 text-sm">
        <span className="font-medium text-foreground flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          This Entry Total / মোট আয়:
        </span>
        <span className="font-mono font-bold text-primary text-base">
          {formatBDT(lineTotal)}
        </span>
      </div>
    </div>
  )
}

