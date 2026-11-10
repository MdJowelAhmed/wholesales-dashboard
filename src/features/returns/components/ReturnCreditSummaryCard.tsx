import { formatBDT } from '@/lib/calculations/financialCalculations'

interface ReturnCreditSummaryCardProps {
  creditAmount: number
  unitPrice: number
  returnQuantityPieces: number
  condition: string
}

export function ReturnCreditSummaryCard({
  creditAmount,
  unitPrice,
  returnQuantityPieces,
  condition,
}: ReturnCreditSummaryCardProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5 text-xs">
      <div className="flex justify-between font-medium">
        <span className="text-muted-foreground">Credit Adjustment to Ledger:</span>
        <span className="text-foreground font-semibold">{formatBDT(creditAmount)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>Return Rate:</span>
        <span>
          {formatBDT(unitPrice)} / piece ({returnQuantityPieces} pcs)
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground italic">
        {condition === 'sellable'
          ? 'ℹ️ Good condition pieces are immediately returned to warehouse stock.'
          : 'ℹ️ Damaged items are flagged and quarantined away from wholesale sellable stock.'}
      </p>
    </div>
  )
}

