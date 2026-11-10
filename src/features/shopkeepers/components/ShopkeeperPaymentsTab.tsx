import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ShopkeeperPayment } from '@/types/shopkeepers'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface ShopkeeperPaymentsTabProps {
  payments: ShopkeeperPayment[]
}

export function ShopkeeperPaymentsTab({
  payments,
}: ShopkeeperPaymentsTabProps): React.JSX.Element {
  return (
    <Card>
      <CardContent className="p-0">
        {payments.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No payments recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2.5 px-3 text-left">Date</th>
                  <th className="py-2.5 px-3 text-left">Receipt No.</th>
                  <th className="py-2.5 px-3 text-left">Payment Method</th>
                  <th className="py-2.5 px-3 text-left">Reference / Voucher</th>
                  <th className="py-2.5 px-3 text-right">Amount Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-3 font-mono text-xs text-muted-foreground">
                      {p.date}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs font-semibold text-foreground">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3 px-3 text-xs capitalize text-foreground">
                      {p.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">
                      {p.reference || 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs font-bold text-status-active-foreground dark:text-status-active">
                      {formatBDT(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

