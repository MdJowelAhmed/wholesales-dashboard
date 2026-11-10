import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ShopkeeperLedgerEntry } from '@/types/shopkeepers'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface ShopkeeperLedgerTabProps {
  ledger: ShopkeeperLedgerEntry[]
}

export function ShopkeeperLedgerTab({ ledger }: ShopkeeperLedgerTabProps): React.JSX.Element {
  return (
    <Card>
      <CardContent className="p-0">
        {ledger.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No ledger transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2.5 px-3 text-left">Date</th>
                  <th className="py-2.5 px-3 text-left">Type</th>
                  <th className="py-2.5 px-3 text-left">Reference</th>
                  <th className="py-2.5 px-3 text-left">Description</th>
                  <th className="py-2.5 px-3 text-right">Debit (Delivery Due)</th>
                  <th className="py-2.5 px-3 text-right">Credit (Payment/Return)</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-muted-foreground">
                      {entry.date}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          entry.type === 'delivery_credit'
                            ? 'bg-primary/15 text-primary'
                            : entry.type === 'consignment_issue'
                            ? 'bg-secondary text-secondary-foreground'
                            : entry.type === 'return_credit'
                            ? 'bg-status-pending/15 text-status-pending-foreground dark:text-status-pending'
                            : 'bg-status-active/15 text-status-active-foreground dark:text-status-active'
                        }`}
                      >
                        {entry.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-foreground font-semibold">
                      {entry.reference}
                    </td>
                    <td className="py-3 px-3 text-xs text-foreground">{entry.description}</td>
                    <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-primary">
                      {entry.debit > 0 ? formatBDT(entry.debit) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-status-active-foreground dark:text-status-active">
                      {entry.credit > 0 ? formatBDT(entry.credit) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs font-bold text-foreground">
                      {formatBDT(entry.balance)}
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

