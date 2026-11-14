import React from 'react'
import { Download, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PnLMetrics, formatBDT } from '@/lib/calculations/financialCalculations'

interface PnlReportTabProps {
  pnl: PnLMetrics & {
    finishedGoodsValuation: number
    rawMaterialInventoryValuation: number
  }
  onExportCsv: () => void
}

export function PnlReportTab({ pnl, onExportCsv }: PnlReportTabProps): React.JSX.Element {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between p-5 pb-3">
        <div>
          <CardTitle className="text-lg text-foreground">
            Factory Profit & Loss Statement (EBITDA)
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Consolidated income, cost of goods sold, labor payroll, and operational overheads
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onExportCsv}
          className="text-xs"
          id="btn-export-pnl-csv"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Download P&L CSV
        </Button>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="rounded-lg border border-border divide-y divide-border text-sm">
          <div className="p-3 bg-muted/20 flex justify-between font-bold text-foreground">
            <span>Gross Commercial Revenue (Sales):</span>
            <span>{formatBDT(pnl.grossRevenue)}</span>
          </div>
          <div className="p-3 flex justify-between text-muted-foreground">
            <span>Cost of Raw Materials Consumed (Fabric, Yarn, Trims):</span>
            <span className="text-rose-600 dark:text-rose-400">
              - {formatBDT(pnl.actualMaterialCost)}
            </span>
          </div>
          <div className="p-3 bg-muted/10 flex justify-between font-semibold text-foreground">
            <span>Gross Manufacturing Margin:</span>
            <span>{formatBDT(pnl.grossRevenue - pnl.actualMaterialCost)}</span>
          </div>
          <div className="p-3 flex justify-between text-muted-foreground">
            <span>Worker Payroll & Tailor Piece-Rate Wages:</span>
            <span className="text-rose-600 dark:text-rose-400">- {formatBDT(pnl.totalWages)}</span>
          </div>
          <div className="p-3 flex justify-between text-muted-foreground">
            <span>Factory Overheads (Rent, DESCO, Logistics, Boxes):</span>
            <span className="text-rose-600 dark:text-rose-400">
              - {formatBDT(pnl.totalExpenses)}
            </span>
          </div>
          <div className="p-4 bg-muted/30 flex justify-between font-bold text-base text-foreground">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Net Operating Profit (EBITDA):
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {formatBDT(pnl.netOperatingProfit)} ({pnl.profitMargin.toFixed(1)}% margin)
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/10 p-4 text-xs space-y-1">
          <div className="font-semibold text-foreground">
            Current Factory Balance Sheet Position:
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Raw Material Stores (on-hand valuation):</span>
            <span className="font-medium text-foreground">
              {formatBDT(pnl.rawMaterialInventoryValuation)}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Finished Goods Warehouse Inventory Valuation:</span>
            <span className="font-medium text-foreground">
              {formatBDT(pnl.finishedGoodsValuation)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

