import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge/StatusBadge'
import { Sale } from '@/types/sales'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface RecentSalesTableProps {
  sales?: Sale[]
}

export function RecentSalesTable({ sales = [] }: RecentSalesTableProps): React.JSX.Element {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Recent Sales Transactions</CardTitle>
          <CardDescription>Latest customer invoices and delivery billing</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/sales" className="flex items-center gap-1 text-xs">
            View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground">
                <th className="pb-3">Invoice</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3 text-right">Items (Pieces)</th>
                <th className="pb-3 text-right">Total Amount</th>
                <th className="pb-3 text-right">Outstanding</th>
                <th className="pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sales.map((sale) => {
                const totalPieces = sale.items?.reduce((s, i) => s + (i.quantityPieces ?? 0), 0) ?? 0
                return (
                  <tr key={sale.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 font-medium text-foreground">{sale.invoiceNumber}</td>
                    <td className="py-3 text-muted-foreground">{sale.customerName}</td>
                    <td className="py-3 text-right text-foreground font-mono">
                      {totalPieces} pcs
                    </td>
                    <td className="py-3 text-right font-mono font-medium text-foreground">
                      {formatBDT(sale.totalAmount ?? 0)}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-destructive">
                      {formatBDT(sale.outstandingBalance ?? 0)}
                    </td>
                    <td className="py-3 text-center">
                      <StatusBadge status={sale.status} />
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
