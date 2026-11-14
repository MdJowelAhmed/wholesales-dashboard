import React, { useState, useTransition } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  DollarSign,
  Banknote,
  Phone,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { PrintButton } from '@/components/shared/PrintButton/PrintButton'
import { EmptyState, TableSkeleton, CardGridSkeleton } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { employeesRepository } from '@/mocks/repositories/employeesRepository'
import { useRepositoryQuery, QUERY_INVALIDATION_SCOPES } from '@/lib/hooks'
import { Employee, EmployeePaymentItem } from '@/types/employees'
import { ProductionEntry } from '@/types/production'
import { RecordAdvanceDialog } from '../components/RecordAdvanceDialog'
import { RecordSalaryPaymentDialog } from '../components/RecordSalaryPaymentDialog'
import { LogWorkerWorkDialog } from '../components/LogWorkerWorkDialog'
import { WorkerWorkHistoryTab } from '../components/WorkerWorkHistoryTab'
import { WorkerPaymentHistoryTab } from '../components/WorkerPaymentHistoryTab'
import { formatBDT } from '@/lib/calculations/financialCalculations'

export function EmployeeDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<'work' | 'payment'>('work')
  const [advanceOpen, setAdvanceOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [logWorkOpen, setLogWorkOpen] = useState(false)
  const [, startTransition] = useTransition()

  const { data, loading, refetch } = useRepositoryQuery(
    async () => {
      if (!id) {
        return {
          employee: null as Employee | null,
          workEntries: [] as ProductionEntry[],
          paymentHistory: [] as EmployeePaymentItem[],
        }
      }
      const [employee, workEntries, paymentHistory] = await Promise.all([
        employeesRepository.getEmployeeById(id),
        employeesRepository.getEmployeeWorkHistory(id),
        employeesRepository.getEmployeePaymentHistory(id),
      ])
      return { employee, workEntries, paymentHistory }
    },
    {
      deps: [id],
      initialData: { employee: null, workEntries: [], paymentHistory: [] },
      invalidationScopes: [...QUERY_INVALIDATION_SCOPES.employees],
    }
  )

  const { employee, workEntries, paymentHistory } = data

  const handleRefetch = () => {
    startTransition(() => {
      refetch()
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-muted/50 rounded animate-pulse" />
        <CardGridSkeleton count={4} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild size="sm">
          <Link to="/employees">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Employees
          </Link>
        </Button>
        <EmptyState
          title="Employee not found"
          description="The requested factory employee or operator could not be found."
        />
      </div>
    )
  }

  const formatCompensationDetails = () => {
    if (employee.compensationMethod === 'piece') return `Per-Piece Rate: ৳${employee.ratePerPiece}/piece`
    if (employee.compensationMethod === 'dozen') {
      return `Per-Dozen Rate: ৳${employee.ratePerDozen}/dozen (৳${((employee.ratePerDozen || 0) / 12).toFixed(2)}/pc)`
    }
    if (employee.compensationMethod === 'monthly_fixed') {
      return `Fixed Monthly Salary: ${formatBDT(employee.monthlySalary || 0)}`
    }
    return employee.compensationMethod
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild size="sm" className="h-8 px-2">
        <Link to="/employees" className="text-xs flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Employees
        </Link>
      </Button>

      <PageHeader
        title={`${employee.name} (${employee.employeeCode})`}
        description={`${employee.designation} • Joined ${employee.joiningDate}`}
        actions={
          <div className="flex items-center gap-2">
            <PrintButton label="Print Wage Statement" />
          </div>
        }
      />

      {/* Top Balance Summary Cards: Total Earned - Total Paid = Net Payable */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Earned Wages (মোট আয়)"
          value={formatBDT(employee.totalEarnedWages)}
          subtitle="Cumulative piece/dozen work earnings"
          icon={TrendingUp}
        />
        <SummaryCard
          title="Total Payments (মোট নিয়েছে)"
          value={formatBDT(employee.totalPaymentsMade)}
          subtitle="Disbursed salary & cash advances"
          icon={DollarSign}
        />
        <SummaryCard
          title="Current Balance (অবশিষ্ট পাওনা)"
          value={formatBDT(employee.currentPayableBalance)}
          subtitle={
            employee.currentPayableBalance >= 0
              ? 'Net wage liability due to worker'
              : 'Advance amount due from worker'
          }
          icon={Banknote}
        />
        <SummaryCard
          title="Advances Due (বকেয়া অগ্রিম)"
          value={formatBDT(employee.totalAdvancesOutstanding)}
          subtitle="Subject to salary deduction"
          icon={Award}
        />
      </div>

      {/* Profile & Compensation Details */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{employee.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{employee.address}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Joined: {employee.joiningDate}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Award className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground truncate">
              {formatCompensationDetails()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Two Dedicated Tabs: Work History & Payment History */}
      <div className="flex border-b border-border gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('work')}
          className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'work'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Work History / কাজের বিবরণ ({workEntries.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('payment')}
          className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'payment'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Payment History / পেমেন্টের হিসাব ({paymentHistory.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'work' && (
        <WorkerWorkHistoryTab
          entries={workEntries}
          totalEarnedAllTime={employee.totalEarnedWages}
          onLogWork={() => setLogWorkOpen(true)}
        />
      )}

      {activeTab === 'payment' && (
        <WorkerPaymentHistoryTab
          payments={paymentHistory}
          totalPaymentsMade={employee.totalPaymentsMade}
          totalAdvancesOutstanding={employee.totalAdvancesOutstanding}
          totalEarnedWages={employee.totalEarnedWages}
          currentPayableBalance={employee.currentPayableBalance}
          onIssueAdvance={() => setAdvanceOpen(true)}
          onDisbursePayment={() => setPaymentOpen(true)}
        />
      )}

      {/* Action Dialogs */}
      <LogWorkerWorkDialog
        employee={employee}
        open={logWorkOpen}
        onOpenChange={setLogWorkOpen}
        onSuccess={handleRefetch}
      />

      <RecordAdvanceDialog
        employeeId={employee.id}
        employeeName={employee.name}
        open={advanceOpen}
        onOpenChange={setAdvanceOpen}
        onSuccess={handleRefetch}
      />

      <RecordSalaryPaymentDialog
        employeeId={employee.id}
        employeeName={employee.name}
        currentPayableBalance={employee.currentPayableBalance}
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        onSuccess={handleRefetch}
      />
    </div>
  )
}
