import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ExpenseRecord } from '@/types/finance'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface ExpensesTableProps {
  loading: boolean
  filteredExpenses: ExpenseRecord[]
}

export function ExpensesTable({ loading, filteredExpenses }: ExpensesTableProps): React.JSX.Element {
  return (
    <Card className="border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Voucher #</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Title / Description</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Payment Method</th>
              <th className="px-4 py-3">Ref / Memo #</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  Loading expenses...
                </td>
              </tr>
            ) : filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  No expense records found matching criteria.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground font-mono">
                    {exp.expenseNumber}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {exp.date}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {exp.title}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[11px] capitalize">
                      {exp.category.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    {formatBDT(exp.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className="bg-muted text-foreground text-xs uppercase"
                    >
                      {exp.paymentMethod.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                    {exp.reference || '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                    {exp.notes || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

