import React from 'react'
import { Banknote, Printer } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PayrollRecord } from '@/types/finance'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface PayslipDialogProps {
  record: PayrollRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PayslipDialog({ record, open, onOpenChange }: PayslipDialogProps): React.JSX.Element | null {
  if (!record) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-foreground">
            <span className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" />
              Worker Salary Pay Slip
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {record.period}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div className="rounded-lg border border-border bg-muted/20 p-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Employee:</span>
              <div className="font-semibold text-foreground text-sm">
                {record.employeeName}
              </div>
              <div className="text-muted-foreground">{record.designation}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Compensation Mode:</span>
              <div className="font-semibold text-foreground capitalize">
                {record.compensationMethod}
              </div>
              <Badge variant="outline" className="mt-1 uppercase text-[10px]">
                Status: {record.status}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 text-xs border border-border rounded-lg p-3">
            <div className="font-semibold text-foreground uppercase border-b border-border pb-1">
              Earnings Breakdown
            </div>
            {record.monthlySalary > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Basic Monthly Salary:</span>
                <span className="font-medium text-foreground">
                  {formatBDT(record.monthlySalary)}
                </span>
              </div>
            )}
            {record.pieceRateEarnings > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Piece-Rate Sewing Wages:</span>
                <span className="font-medium text-foreground">
                  {formatBDT(record.pieceRateEarnings)}
                </span>
              </div>
            )}
            {record.incentives > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Overtime & Attendance Incentive:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  +{formatBDT(record.incentives)}
                </span>
              </div>
            )}
            {record.advancesDeducted > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salary Advance Recovery:</span>
                <span className="font-medium text-rose-600 dark:text-rose-400">
                  -{formatBDT(record.advancesDeducted)}
                </span>
              </div>
            )}
            <div className="border-t border-border pt-1 flex justify-between font-bold text-sm text-foreground">
              <span>Net Payable Amount:</span>
              <span>{formatBDT(record.netPayable)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Disbursed so far:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {formatBDT(record.paidAmount)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-foreground">
              <span>Outstanding Wage Balance:</span>
              <span className="text-rose-600 dark:text-rose-400">
                {formatBDT(record.remainingPayable)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Print Pay Slip
          </Button>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

