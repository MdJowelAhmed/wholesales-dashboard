import React from 'react'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { DeliveryWithShopkeeper } from './ChallanPreviewDialog'

interface DeliveriesTableProps {
  loading: boolean
  filteredDeliveries: DeliveryWithShopkeeper[]
  onViewChallan: (delivery: DeliveryWithShopkeeper) => void
}

export function DeliveriesTable({
  loading,
  filteredDeliveries,
  onViewChallan,
}: DeliveriesTableProps): React.JSX.Element {
  return (
    <Card className="border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Challan #</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Shopkeeper & Market</th>
              <th className="px-4 py-3">Agreement</th>
              <th className="px-4 py-3 text-right">Pieces</th>
              <th className="px-4 py-3 text-right">Delivery Value</th>
              <th className="px-4 py-3 text-right">Outstanding</th>
              <th className="px-4 py-3">Items Summary</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-muted-foreground">
                  Loading wholesale dispatches...
                </td>
              </tr>
            ) : filteredDeliveries.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-muted-foreground">
                  No wholesale deliveries found.
                </td>
              </tr>
            ) : (
              filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground font-mono">
                    {delivery.deliveryNumber}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {delivery.date}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{delivery.shopkeeperName}</div>
                    <div className="text-xs text-muted-foreground">{delivery.marketName}</div>
                  </td>
                  <td className="px-4 py-3">
                    {delivery.transactionType === 'consignment' ? (
                      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                        Consignment
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                        Credit Sale
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {delivery.totalPieces.toLocaleString()} pcs
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {formatBDT(delivery.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {delivery.outstandingAmount > 0 ? (
                      <span className="text-rose-600 dark:text-rose-400">
                        {formatBDT(delivery.outstandingAmount)}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 text-xs">Settled</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {delivery.items
                        .map((i) => `${i.productName} (${i.size}) x ${i.quantityPieces} pcs`)
                        .join(', ')}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => onViewChallan(delivery)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Challan Slip
                    </Button>
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

