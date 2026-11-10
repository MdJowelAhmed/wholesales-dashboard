import { useState, useEffect, useMemo } from 'react'
import {
  Banknote,
  Plus,
  Search,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { financeRepository } from '@/mocks/repositories/financeRepository'
import { PayrollRecord } from '@/types/finance'
import { PaymentMethod } from '@/types/common'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { PayslipDialog } from '../components/PayslipDialog'
import { DisbursePayrollDialog } from '../components/DisbursePayrollDialog'
import { toast } from 'sonner'

export function PayrollListPage() {
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'pending'>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('all')

  const [activePayslip, setActivePayslip] = useState<PayrollRecord | null>(null)
  const [disburseTarget, setDisburseTarget] = useState<PayrollRecord | null>(null)
  const [generating, setGenerating] = useState(false)

  const loadPayroll = async () => {
    try {
      setLoading(true)
      const data = await financeRepository.listPayroll()
      setPayroll(data)
    } catch (err) {
      console.error('Failed to load payroll records', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayroll()
  }, [])

  const availablePeriods = useMemo(() => {
    const set = new Set<string>()
    payroll.forEach((p) => set.add(p.period))
    return Array.from(set)
  }, [payroll])

  const filteredPayroll = useMemo(() => {
    return payroll.filter((p) => {
      const matchSearch =
        p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.designation.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      const matchPeriod = periodFilter === 'all' || p.period === periodFilter

      return matchSearch && matchStatus && matchPeriod
    })
  }, [payroll, searchTerm, statusFilter, periodFilter])

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalPayable = payroll.reduce((sum, p) => sum + p.netPayable, 0)
    const totalPaid = payroll.reduce((sum, p) => sum + p.paidAmount, 0)
    const totalRemaining = payroll.reduce((sum, p) => sum + p.remainingPayable, 0)
    return { totalPayable, totalPaid, totalRemaining, count: payroll.length }
  }, [payroll])

  const handleGeneratePayroll = async () => {
    try {
      setGenerating(true)
      const currentPeriod = 'October 2026'
      await financeRepository.generatePayroll(currentPeriod)
      toast.success(`Generated payroll for ${currentPeriod}`)
      await loadPayroll()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate payroll'
      toast.error(msg)
    } finally {
      setGenerating(false)
    }
  }

  const handleDisburseConfirm = async (targetId: string, method: PaymentMethod, amount: number) => {
    try {
      await financeRepository.disbursePayroll(targetId, method, amount)
      const target = payroll.find((p) => p.id === targetId)
      toast.success(`Disbursed ${formatBDT(amount)} to ${target?.employeeName || 'employee'}`)
      setDisburseTarget(null)
      await loadPayroll()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Disbursement failed'
      toast.error(msg)
      throw err
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Banknote className="h-7 w-7 text-primary" />
            Worker Payroll & Wages
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automated piece-rate sewing wage calculation, monthly fixed salaries, advance recoveries, and pay slips.
          </p>
        </div>

        <Button
          onClick={handleGeneratePayroll}
          disabled={generating}
          className="bg-primary text-primary-foreground shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          {generating ? 'Calculating Wages...' : 'Generate Monthly Payroll'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card text-card-foreground border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Payroll Bill
              </p>
              <h3 className="text-xl font-bold text-foreground mt-1">
                {formatBDT(metrics.totalPayable)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Paid Wages
              </p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatBDT(metrics.totalPaid)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Wage Liabilities Due
              </p>
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {formatBDT(metrics.totalRemaining)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pay Slips Generated
              </p>
              <h3 className="text-xl font-bold text-foreground mt-1">{metrics.count} Workers</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
              <Banknote className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by worker name or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            aria-label="Period filter"
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Pay Periods</option>
            {availablePeriods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            aria-label="Status filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'paid' | 'partial' | 'pending')}
            className="rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
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
                        onClick={() => setActivePayslip(item)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Payslip
                      </Button>
                      {item.remainingPayable > 0 && (
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 px-2 text-xs bg-primary text-primary-foreground"
                          onClick={() => setDisburseTarget(item)}
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

      {/* Extracted Payslip Dialog */}
      <PayslipDialog
        record={activePayslip}
        open={!!activePayslip}
        onOpenChange={(open) => !open && setActivePayslip(null)}
      />

      {/* Extracted Disburse Dialog */}
      <DisbursePayrollDialog
        target={disburseTarget}
        open={!!disburseTarget}
        onOpenChange={(open) => !open && setDisburseTarget(null)}
        onConfirm={handleDisburseConfirm}
      />
    </div>
  )
}
