import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ShopkeeperDelivery } from '@/types/shopkeepers'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface ShopkeeperDeliveriesTabProps {
  deliveries: ShopkeeperDelivery[]
}

export function ShopkeeperDeliveriesTab({
  deliveries,
}: ShopkeeperDeliveriesTabProps): React.JSX.Element {
  if (deliveries.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="py-8 text-center text-xs text-muted-foreground">
            No deliveries logged for this shopkeeper.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {deliveries.map((deliv) => (
        <Card key={deliv.id}>
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="font-bold text-sm text-foreground">
                {deliv.deliveryNumber}
              </span>
              <span className="text-xs text-muted-foreground ml-3">Date: {deliv.date}</span>
              <span className="ml-3 text-[11px] font-semibold px-2 py-0.5 rounded bg-secondary text-secondary-foreground uppercase">
                {deliv.transactionType === 'consignment' ? 'Consignment' : 'Credit Sale'}
              </span>
            </div>
            <div className="text-right text-xs">
              <span className="text-muted-foreground">Delivery Total: </span>
              <span className="font-bold font-mono text-foreground text-sm">
                {formatBDT(deliv.totalAmount)}
              </span>
              <span className="text-muted-foreground ml-3">Outstanding: </span>
              <span className="font-bold font-mono text-primary text-sm">
                {formatBDT(deliv.outstandingAmount)}
              </span>
            </div>
          </div>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 px-3 text-left">Garment Product</th>
                  <th className="py-2 px-3 text-left">Size</th>
                  <th className="py-2 px-3 text-right">Quantity (Pieces)</th>
                  <th className="py-2 px-3 text-right">Per-Piece Price</th>
                  <th className="py-2 px-3 text-right">Line Total</th>
                  <th className="py-2 px-3 text-right">Returned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deliv.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      {item.productName}
                    </td>
                    <td className="py-2.5 px-3 font-bold font-mono">{item.size}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      {item.quantityPieces} pcs
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {formatBDT(item.pricePerPiece)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      {formatBDT(item.lineTotal)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {item.returnedPieces > 0 ? (
                        <span className="text-destructive font-bold">
                          {item.returnedPieces} pcs returned
                        </span>
                      ) : (
                        '0'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

