import React from 'react'
import { Link } from 'react-router-dom'
import { Eye, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Sale } from '@/types/sales'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface SalesTableProps {
  loading: boolean
  filteredSales: Sale[]
}

export function SalesTable({ loading, filteredSales }: SalesTableProps): React.JSX.Element {
  return (
    <Card className="border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer / Party</th>
              <th className="px-4 py-3">Garments & Items</th>
              <th className="px-4 py-3 text-right">Total Invoice</th>
              <th className="px-4 py-3 text-right">Paid</th>
              <th className="px-4 py-3 text-right">Due Balance</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-muted-foreground">
                  Loading sales records...
                </td>
              </tr>
            ) : filteredSales.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-muted-foreground">
                  No sales invoices found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => {
                const piecesCount = sale.items?.reduce(
                  (sum, item) => sum + (item.quantityPieces ?? 0),
                  0
                ) ?? 0
                return (
                  <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      <Link
                        to={`/sales/${sale.id}`}
                        className="hover:text-primary transition-colors hover:underline flex items-center gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        {sale.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {sale.date}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{sale.customerName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge
                          variant="outline"
                          className={
                            sale.customerType === 'wholesale_shopkeeper'
                              ? 'bg-primary/10 text-primary border-primary/20 text-[10px]'
                              : 'bg-muted text-muted-foreground text-[10px]'
                          }
                        >
                          {sale.customerType === 'wholesale_shopkeeper' ? 'Wholesale' : 'Retail'}
                        </Badge>
                        {sale.customerPhone && (
                          <span className="text-xs text-muted-foreground">
                            {sale.customerPhone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {piecesCount} pcs
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sale.items?.length ?? 0} {sale.items?.length === 1 ? 'line item' : 'line items'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {formatBDT(sale.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatBDT(sale.paidAmount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {sale.outstandingBalance > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">
                          {formatBDT(sale.outstandingBalance)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Settled</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {sale.status === 'paid' && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                          Paid
                        </Badge>
                      )}
                      {sale.status === 'partial' && (
                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                          Partial
                        </Badge>
                      )}
                      {sale.status === 'pending' && (
                        <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
                          Pending
                        </Badge>
                      )}
                      {sale.status === 'returned' && (
                        <Badge className="bg-muted text-muted-foreground">
                          Returned
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/sales/${sale.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

