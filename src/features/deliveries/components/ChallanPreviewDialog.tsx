import React from 'react'
import { Truck, Printer } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShopkeeperDelivery } from '@/types/shopkeepers'
import { formatBDT } from '@/lib/calculations/financialCalculations'

export type DeliveryWithShopkeeper = ShopkeeperDelivery & {
  shopkeeperId: string
  shopkeeperName: string
  marketName: string
}

interface ChallanPreviewDialogProps {
  challan: DeliveryWithShopkeeper | null
  onClose: () => void
}

export function ChallanPreviewDialog({
  challan,
  onClose,
}: ChallanPreviewDialogProps): React.JSX.Element | null {
  if (!challan) return null

  return (
    <Dialog open={!!challan} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-xl bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-foreground">
            <span className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Delivery Challan Slip
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {challan.deliveryNumber}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div className="rounded-lg border border-border bg-muted/20 p-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Recipient Shop:</span>
              <div className="font-semibold text-foreground">{challan.shopkeeperName}</div>
              <div className="text-muted-foreground">{challan.marketName}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Dispatch Date:</span>
              <div className="font-semibold text-foreground">{challan.date}</div>
              <Badge variant="outline" className="mt-1 capitalize">
                {challan.transactionType.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Items List */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Item / SKU</th>
                  <th className="px-3 py-2">Size</th>
                  <th className="px-3 py-2 text-right">Pcs</th>
                  <th className="px-3 py-2 text-right">Rate</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {challan.items.map((it) => (
                  <tr key={it.id}>
                    <td className="px-3 py-2">
                      <div className="font-medium text-foreground">{it.productName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{it.sku}</div>
                    </td>
                    <td className="px-3 py-2 font-medium">Size {it.size}</td>
                    <td className="px-3 py-2 text-right font-semibold">{it.quantityPieces} pcs</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">৳{it.pricePerPiece}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatBDT(it.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="space-y-1 text-xs text-right">
            <div className="flex justify-between text-muted-foreground">
              <span>Total Pieces:</span>
              <span className="font-bold text-foreground">{challan.totalPieces} pcs</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Grand Total:</span>
              <span className="font-bold text-foreground">{formatBDT(challan.totalAmount)}</span>
            </div>
            {challan.paidAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Upfront Paid:</span>
                <span>{formatBDT(challan.paidAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-foreground border-t border-border pt-1">
              <span>Receivable Balance:</span>
              <span className="text-rose-600 dark:text-rose-400">
                {formatBDT(challan.outstandingAmount)}
              </span>
            </div>
          </div>

          {challan.notes && (
            <p className="text-xs text-muted-foreground italic border-t border-border pt-2">
              Challan Note: {challan.notes}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Print Challan
          </Button>
          <Button size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

