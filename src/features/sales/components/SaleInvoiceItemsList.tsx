import React from 'react'
import { Badge } from '@/components/ui/badge'
import { SaleItem } from '@/types/sales'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface SaleInvoiceItemsListProps {
  items?: SaleItem[]
}

export function SaleInvoiceItemsList({ items = [] }: SaleInvoiceItemsListProps): React.JSX.Element {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Sl</th>
            <th className="px-4 py-3">Product / SKU</th>
            <th className="px-4 py-3">Size</th>
            <th className="px-4 py-3 text-right">Quantity (Pcs)</th>
            <th className="px-4 py-3 text-right">Rate / Pc</th>
            <th className="px-4 py-3 text-right">Discount</th>
            <th className="px-4 py-3 text-right">Line Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item, idx) => (
            <tr key={item.id} className="hover:bg-muted/20">
              <td className="px-4 py-3 text-muted-foreground text-xs">{idx + 1}</td>
              <td className="px-4 py-3">
                <div className="font-medium text-foreground">{item.productName}</div>
                <div className="text-xs text-muted-foreground font-mono">{item.sku}</div>
              </td>
              <td className="px-4 py-3">
                <Badge variant="outline" className="text-xs">
                  Size {item.size}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right font-medium text-foreground">
                {item.quantityPieces} pcs
              </td>
              <td className="px-4 py-3 text-right text-muted-foreground">
                ৳{item.pricePerPiece}
              </td>
              <td className="px-4 py-3 text-right text-muted-foreground">
                {item.discount ? formatBDT(item.discount) : '-'}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-foreground">
                {formatBDT(item.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

