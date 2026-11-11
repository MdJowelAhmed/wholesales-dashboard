import React from 'react'
import { DollarSign, Banknote, Calendar, CreditCard, ArrowDownRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmployeePaymentItem } from '@/types/employees'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface WorkerPaymentHistoryTabProps {
  payments: EmployeePaymentItem[]
  totalPaymentsMade: number
  totalAdvancesOutstanding: number
  totalEarnedWages: number
  currentPayableBalance: number
  onIssueAdvance: () => void
  onDisbursePayment: () => void
}

export function WorkerPaymentHistoryTab({
  payments,
  totalPaymentsMade,
  totalAdvancesOutstanding,
  totalEarnedWages,
  currentPayableBalance,
  onIssueAdvance,
  onDisbursePayment,
}: WorkerPaymentHistoryTabProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      {/* Top Action & Subtraction Formula Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" /> Wage Settlement Balance Breakdown / হিসাব নিকাশ
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                <span className="font-semibold text-foreground">
                  মোট আয়: <span className="text-primary font-mono">{formatBDT(totalEarnedWages)}</span>
                </span>
                <span className="text-muted-foreground font-bold">−</span>
                <span className="font-semibold text-foreground">
                  মোট নিয়েছে: <span className="text-destructive font-mono">{formatBDT(totalPaymentsMade)}</span>
                </span>
                <span className="text-muted-foreground font-bold">=</span>
                <span className="font-bold text-foreground">
                  অবশিষ্ট পাওনা:{' '}
                  <span
                    className={`font-mono text-sm px-2 py-0.5 rounded font-extrabold ${
                      currentPayableBalance >= 0
                        ? 'bg-status-active/15 text-status-active-foreground dark:text-status-active'
                        : 'bg-destructive/15 text-destructive'
                    }`}
                  >
                    {formatBDT(currentPayableBalance)}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onIssueAdvance}>
                <DollarSign className="h-3.5 w-3.5 mr-1" /> Issue Advance
              </Button>
              <Button size="sm" className="h-8 text-xs" onClick={onDisbursePayment}>
                <Banknote className="h-3.5 w-3.5 mr-1" /> Disburse Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
            Total Paid Out / মোট পরিশোধিত টাকা
          </div>
          <div className="text-xl font-bold font-mono text-destructive mt-0.5">
            {formatBDT(totalPaymentsMade)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            All settled cash/bank salary & wage payments
          </div>
        </div>

        <div className="bg-status-pending/5 border border-status-pending/20 rounded-lg p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-status-pending" />
            Outstanding Advances / বকেয়া অগ্রিম
          </div>
          <div className="text-xl font-bold font-mono text-status-pending-foreground dark:text-status-pending mt-0.5">
            {formatBDT(totalAdvancesOutstanding)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Emergency cash advances pending recovery
          </div>
        </div>

        <div className="bg-muted/40 border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            Total Payment Transactions
          </div>
          <div className="text-xl font-bold font-mono text-foreground mt-0.5">
            {payments.length} <span className="text-xs font-normal">vouchers</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Recorded receipts and disbursement vouchers
          </div>
        </div>
      </div>

      {/* Payment Records Table */}
      <Card>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              No payments or advances recorded for this worker yet. Click &quot;Disburse Payment&quot; or &quot;Issue Advance&quot; above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Date / তারিখ</th>
                    <th className="py-2.5 px-3 text-left">Type / ধরন</th>
                    <th className="py-2.5 px-3 text-left">Voucher / Description</th>
                    <th className="py-2.5 px-3 text-right">Amount Taken / গৃহীত টাকা</th>
                    <th className="py-2.5 px-3 text-right">Remaining Balance / অবশিষ্ট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs text-foreground font-semibold">
                        {p.date}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            p.type === 'cash_advance'
                              ? 'bg-status-pending/15 text-status-pending-foreground dark:text-status-pending'
                              : 'bg-status-active/15 text-status-active-foreground dark:text-status-active'
                          }`}
                        >
                          {p.type === 'cash_advance' ? 'Cash Advance' : 'Salary Payment'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-foreground font-medium">
                        {p.notes || p.reference}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-bold text-destructive">
                        {formatBDT(p.amount)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-bold text-foreground">
                        {formatBDT(p.runningBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

