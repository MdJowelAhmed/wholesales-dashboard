import { useState, useMemo, useTransition } from 'react'
import {
  Banknote,
  Search,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { financeRepository } from '@/mocks/repositories/financeRepository'
import { useRepositoryQuery } from '@/lib/hooks'
import { PayrollRecord } from '@/types/finance'
import { PaymentMethod } from '@/types/common'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { PayslipDialog } from '../components/PayslipDialog'
import { DisbursePayrollDialog } from '../components/DisbursePayrollDialog'
import { PayrollTable } from '../components/PayrollTable'
import { toast } from 'sonner'

export function PayrollListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'pending'>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('all')

  const [activePayslip, setActivePayslip] = useState<PayrollRecord | null>(null)
  const [disburseTarget, setDisburseTarget] = useState<PayrollRecord | null>(null)
  const [generating, setGenerating] = useState(false)
  const [, startTransition] = useTransition()

  const { data: payroll = [], loading, refetch } = useRepositoryQuery<PayrollRecord[]>(
    () => financeRepository.listPayroll(),
    { initialData: [] }
  )

  const handleRefetch = () => {
    startTransition(() => {
      refetch()
    })
  }

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

  const metrics = useMemo(() => {
    const totalGross = payroll.reduce(
      (sum, p) => sum + (p.netPayable ?? 0) + (p.advancesDeducted ?? 0),
      0
    )
    const totalPaid = payroll.reduce((sum, p) => sum + (p.paidAmount ?? 0), 0)
    const totalRemaining = payroll.reduce((sum, p) => sum + (p.remainingPayable ?? 0), 0)
    const totalEmployees = payroll.length

    return { totalGross, totalPaid, totalRemaining, totalEmployees }
  }, [payroll])

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      const currentPeriod = 'October 2026'
      await financeRepository.generatePayroll(currentPeriod)
      toast.success(`Generated payroll for ${currentPeriod}`)
      handleRefetch()
    } catch {
      toast.error('Failed to generate payroll')
    } finally {
      setGenerating(false)
    }
  }

  const handleDisburseConfirm = async (targetId: string, method: PaymentMethod, amount: number) => {
    try {
      await financeRepository.disbursePayroll(targetId, method, amount)
      toast.success('Wages disbursed and ledger updated successfully')
      handleRefetch()
    } catch {
      toast.error('Failed to disburse payroll')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Banknote className="h-6 w-6 text-primary" />
            Worker Payroll & Wages
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Factory tailor piece-rate earnings, monthly fixed salaries, and wage disbursement vouchers.
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-primary text-primary-foreground text-xs shadow-sm"
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          {generating ? 'Calculating Wages...' : 'Generate Monthly Payroll'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card text-card-foreground border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Payroll Bill</p>
              <h2 className="text-xl font-bold text-foreground mt-1">
                {formatBDT(metrics.totalGross)}
              </h2>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Across {metrics.totalEmployees} factory staff
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Paid Wages</p>
              <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatBDT(metrics.totalPaid)}
              </h2>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Disbursed to date
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Wage Liabilities Due</p>
              <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {formatBDT(metrics.totalRemaining)}
              </h2>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Awaiting disbursement
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Roster</p>
              <h2 className="text-xl font-bold text-foreground mt-1">
                {metrics.totalEmployees} Workers
              </h2>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Cutting, sewing & quality
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
              <Banknote className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

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

      <PayrollTable
        loading={loading}
        filteredPayroll={filteredPayroll}
        onViewPayslip={(record) => setActivePayslip(record)}
        onDisburse={(record) => setDisburseTarget(record)}
      />

      <PayslipDialog
        record={activePayslip}
        open={!!activePayslip}
        onOpenChange={(open) => !open && setActivePayslip(null)}
      />

      <DisbursePayrollDialog
        target={disburseTarget}
        open={!!disburseTarget}
        onOpenChange={(open) => !open && setDisburseTarget(null)}
        onConfirm={handleDisburseConfirm}
      />
    </div>
  )
}
