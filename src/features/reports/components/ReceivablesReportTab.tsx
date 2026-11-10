import React from 'react'
import { Download } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shopkeeper } from '@/types/shopkeepers'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface ReceivablesReportTabProps {
  shopkeepers: Shopkeeper[]
  onExportCsv: () => void
}

export function ReceivablesReportTab({
  shopkeepers,
  onExportCsv,
}: ReceivablesReportTabProps): React.JSX.Element {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between p-5 pb-3">
        <div>
          <CardTitle className="text-lg text-foreground">
            Wholesale Shopkeepers Receivables Aging
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Outstanding balances by wholesale markets (Islampur, Keraniganj, Tanbazar)
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onExportCsv}
          className="text-xs"
          id="btn-export-receivables-csv"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Download Receivables CSV
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Shop & Proprietor</th>
                <th className="px-4 py-3">Market Hub</th>
                <th className="px-4 py-3 text-right">Delivered Value</th>
                <th className="px-4 py-3 text-right">Collections</th>
                <th className="px-4 py-3 text-right">Return Credits</th>
                <th className="px-4 py-3 text-right">Consignment Held</th>
                <th className="px-4 py-3 text-right">Outstanding Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shopkeepers.map((sk) => (
                <tr key={sk.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{sk.shopName}</div>
                    <div className="text-xs text-muted-foreground">
                      {sk.ownerName} • {sk.phone}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{sk.marketName}</td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {formatBDT(sk.totalDeliveredValue)}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                    {formatBDT(sk.totalPaymentsReceived)}
                  </td>
                  <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400 font-medium">
                    {formatBDT(sk.totalReturnAdjustments)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-amber-600 dark:text-amber-400">
                    {sk.consignmentPiecesHeld > 0 ? `${sk.consignmentPiecesHeld} pcs` : 'None'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    <span className="text-rose-600 dark:text-rose-400">
                      {formatBDT(sk.outstandingBalance)}
                    </span>
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

