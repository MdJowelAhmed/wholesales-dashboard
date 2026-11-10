import { formatBDT } from '@/lib/calculations/financialCalculations'

interface ProductionWageCalculationCardProps {
  estimatedWage: number
}

export function ProductionWageCalculationCard({
  estimatedWage,
}: ProductionWageCalculationCardProps) {
  return (
    <div className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between text-xs">
      <span className="text-muted-foreground font-medium">
        Calculated Wage (Good Output):
      </span>
      <span className="font-bold font-mono text-primary text-sm">
        {formatBDT(estimatedWage)}
      </span>
    </div>
  )
}

