import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ShopkeeperReturnRecord } from '@/types/shopkeepers'
import { formatBDT } from '@/lib/calculations/financialCalculations'

export type ReturnWithShopkeeper = ShopkeeperReturnRecord & {
  shopkeeperId: string
  shopkeeperName: string
  marketName: string
}

interface ReturnsTableProps {
  loading: boolean
  filteredReturns: ReturnWithShopkeeper[]
}

export function ReturnsTable({ loading, filteredReturns }: ReturnsTableProps): React.JSX.Element {
  return (
    <Card className="border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Return #</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Shopkeeper & Market</th>
              <th className="px-4 py-3">Delivery Ref</th>
              <th className="px-4 py-3">Garment & Size</th>
              <th className="px-4 py-3 text-right">Quantity</th>
              <th className="px-4 py-3 text-right">Credit Value</th>
              <th className="px-4 py-3">Condition</th>
              <th className="px-4 py-3">Reason / Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-muted-foreground">
                  Loading return records...
                </td>
              </tr>
            ) : filteredReturns.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-muted-foreground">
                  No returns found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredReturns.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground font-mono">
                    {r.returnNumber}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {r.date}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{r.shopkeeperName}</div>
                    <div className="text-xs text-muted-foreground">{r.marketName}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {r.deliveryNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{r.productName}</div>
                    <div className="text-xs text-muted-foreground">Size {r.size}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {r.returnQuantityPieces} pcs
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {formatBDT(r.creditAmount)}
                  </td>
                  <td className="px-4 py-3">
                    {r.condition === 'sellable' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                        Sellable (Restocked)
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
                        Damaged (Quarantine)
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                    {r.reason}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

