import React from 'react'
import { Download } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sale } from '@/types/sales'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface SalesReportTabProps {
  sales: Sale[]
  onExportCsv: () => void
}

export function SalesReportTab({ sales, onExportCsv }: SalesReportTabProps): React.JSX.Element {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between p-5 pb-3">
        <div>
          <CardTitle className="text-lg text-foreground">Sales & Collections Realization</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Summary of retail receipts and wholesale invoices
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onExportCsv}
          className="text-xs"
          id="btn-export-sales-csv"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Download Sales CSV
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer / Shop</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3 text-right">Pieces Sold</th>
                <th className="px-4 py-3 text-right">Total Invoice</th>
                <th className="px-4 py-3 text-right">Collections</th>
                <th className="px-4 py-3 text-right">Receivable Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sales.map((s) => {
                const pieces = s.items.reduce((sum, i) => sum + i.quantityPieces, 0)
                return (
                  <tr key={s.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-semibold text-foreground font-mono">
                      {s.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.date}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{s.customerName}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px]">
                        {s.customerType === 'wholesale_shopkeeper' ? 'Wholesale' : 'Retail'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {pieces.toLocaleString()} pcs
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">
                      {formatBDT(s.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatBDT(s.paidAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {s.outstandingBalance > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400">
                          {formatBDT(s.outstandingBalance)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Settled</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

