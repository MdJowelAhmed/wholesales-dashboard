import React from 'react'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { PaymentRecord } from '@/types/finance'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface PaymentsTableProps {
  loading: boolean
  filteredPayments: PaymentRecord[]
}

export function PaymentsTable({ loading, filteredPayments }: PaymentsTableProps): React.JSX.Element {
  return (
    <Card className="border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Receipt / Voucher #</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Party Name</th>
              <th className="px-4 py-3">Party Category</th>
              <th className="px-4 py-3">Cash Direction</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Payment Method</th>
              <th className="px-4 py-3">Reference / Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  Loading payments...
                </td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  No payment records found.
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => {
                const isInflow = p.partyType === 'shopkeeper' || p.partyType === 'customer'
                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground font-mono">
                      {p.receiptNumber}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {p.date}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {p.partyName}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[11px] capitalize">
                        {p.partyType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {isInflow ? (
                        <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 gap-1">
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                          Collection In
                        </span>
                      ) : (
                        <span className="flex items-center text-xs font-semibold text-rose-600 dark:text-rose-400 gap-1">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          Disbursement Out
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">
                      <span className={isInflow ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {isInflow ? '+' : '-'} {formatBDT(p.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className="bg-muted text-foreground text-xs uppercase"
                      >
                        {p.paymentMethod.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div>{p.referenceTransactionCode || '-'}</div>
                      {p.notes && <div className="text-[11px] italic">{p.notes}</div>}
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

