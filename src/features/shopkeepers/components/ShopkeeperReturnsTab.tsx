import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ShopkeeperReturnRecord } from '@/types/shopkeepers'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface ShopkeeperReturnsTabProps {
  returns: ShopkeeperReturnRecord[]
}

export function ShopkeeperReturnsTab({
  returns,
}: ShopkeeperReturnsTabProps): React.JSX.Element {
  return (
    <Card>
      <CardContent className="p-0">
        {returns.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No returns recorded for this shopkeeper.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2.5 px-3 text-left">Date</th>
                  <th className="py-2.5 px-3 text-left">Return No.</th>
                  <th className="py-2.5 px-3 text-left">Delivery Ref</th>
                  <th className="py-2.5 px-3 text-left">Product & Size</th>
                  <th className="py-2.5 px-3 text-right">Return Pieces</th>
                  <th className="py-2.5 px-3 text-left">Condition</th>
                  <th className="py-2.5 px-3 text-left">Reason</th>
                  <th className="py-2.5 px-3 text-right">Credit Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {returns.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-3 font-mono text-xs text-muted-foreground">
                      {r.date}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs font-semibold text-foreground">
                      {r.returnNumber}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-muted-foreground">
                      {r.deliveryNumber}
                    </td>
                    <td className="py-3 px-3 text-xs font-medium text-foreground">
                      {r.productName} (Size {r.size})
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs font-bold text-foreground">
                      {r.returnQuantityPieces} pcs
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                          r.condition === 'sellable'
                            ? 'bg-status-active/15 text-status-active-foreground dark:text-status-active'
                            : 'bg-destructive/15 text-destructive'
                        }`}
                      >
                        {r.condition}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{r.reason}</td>
                    <td className="py-3 px-3 text-right font-mono text-xs font-bold text-primary">
                      {formatBDT(r.creditAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

