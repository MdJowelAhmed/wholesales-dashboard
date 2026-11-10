import React from 'react'
import { Download } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FinishedGoodsStockItem } from '@/types/inventory'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface InventoryReportTabProps {
  stock: FinishedGoodsStockItem[]
  onExportCsv: () => void
}

export function InventoryReportTab({ stock, onExportCsv }: InventoryReportTabProps): React.JSX.Element {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between p-5 pb-3">
        <div>
          <CardTitle className="text-lg text-foreground">Warehouse Finished Goods Valuation</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Piece quantities, sizes, and capital valuation
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onExportCsv}
          className="text-xs"
          id="btn-export-inventory-csv"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Download Inventory CSV
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Garment Model</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3 text-right">Pieces in Stock</th>
                <th className="px-4 py-3 text-right">Rate / Pc</th>
                <th className="px-4 py-3 text-right">Asset Valuation</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stock.map((st) => (
                <tr key={st.variantId} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{st.sku}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{st.productName}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">
                      Size {st.size}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    {st.currentPieces.toLocaleString()} pcs
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatBDT(st.pricePerPiece)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    {formatBDT(st.valuation)}
                  </td>
                  <td className="px-4 py-3">
                    {st.currentPieces <= st.reorderLevel ? (
                      <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px]">
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                        Healthy
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

