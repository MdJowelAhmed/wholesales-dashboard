import { formatBDT } from '@/lib/calculations/financialCalculations'

interface DeliveryItemValuationCardProps {
  lineTotal: number
  productName?: string
  variantSize?: string
  quantityPieces: number
  transactionType: string
}

export function DeliveryItemValuationCard({
  lineTotal,
  productName,
  variantSize,
  quantityPieces,
  transactionType,
}: DeliveryItemValuationCardProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5 text-xs">
      <div className="flex justify-between font-medium">
        <span className="text-muted-foreground">Delivery Total:</span>
        <span className="text-foreground font-semibold">{formatBDT(lineTotal)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>Selected Item:</span>
        <span>
          {productName} {variantSize ? `(Size ${variantSize})` : ''} • {quantityPieces} pcs
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground italic">
        {transactionType === 'consignment'
          ? 'ℹ️ Consignment pieces remain factory asset until sold; no debt is added immediately.'
          : 'ℹ️ Credit sale is added directly to the shopkeeper ledger and accounts receivable balance.'}
      </p>
    </div>
  )
}

