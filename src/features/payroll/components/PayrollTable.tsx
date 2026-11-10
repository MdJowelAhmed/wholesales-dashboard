import React from 'react'
import { Eye, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { PayrollRecord } from '@/types/finance'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface PayrollTableProps {
  loading: boolean
  filteredPayroll: PayrollRecord[]
  onViewPayslip: (record: PayrollRecord) => void
  onDisburse: (record: PayrollRecord) => void
}

export function PayrollTable({
  loading,
  filteredPayroll,
  onViewPayslip,
  onDisburse,
}: PayrollTableProps): React.JSX.Element {
  return (
    <Card className="bg-card text-card-foreground border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold border-b border-border">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Compensation</th>
              <th className="px-4 py-3 text-right">Net Payable</th>
              <th className="px-4 py-3 text-right">Paid</th>
              <th className="px-4 py-3 text-right">Remaining</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  Loading payroll records...
                </td>
              </tr>
            ) : filteredPayroll.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  No payroll records found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredPayroll.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    <div>{item.employeeName}</div>
                    <div className="text-xs text-muted-foreground">{item.designation}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{item.period}</td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {item.compensationMethod.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {formatBDT(item.netPayable)}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                    {formatBDT(item.paidAmount)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {item.remainingPayable > 0 ? (
                      <span className="text-rose-600 dark:text-rose-400">
                        {formatBDT(item.remainingPayable)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Cleared</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.status === 'paid' && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                        Paid
                      </Badge>
                    )}
                    {item.status === 'partial' && (
                      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                        Partial
                      </Badge>
                    )}
                    {item.status === 'pending' && (
                      <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
                        Pending
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => onViewPayslip(item)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Payslip
                    </Button>
                    {item.remainingPayable > 0 && (
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 px-2 text-xs bg-primary text-primary-foreground"
                        onClick={() => onDisburse(item)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Pay
                      </Button>
                    )}
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

