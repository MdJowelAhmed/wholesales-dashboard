import React, { useState, useTransition } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, DollarSign, Banknote, Phone, MapPin, Calendar, Award } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { StatusBadge } from '@/components/shared/StatusBadge/StatusBadge'
import { PrintButton } from '@/components/shared/PrintButton/PrintButton'
import { EmptyState, TableSkeleton, CardGridSkeleton } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { employeesRepository } from '@/mocks/repositories/employeesRepository'
import { useRepositoryQuery } from '@/lib/hooks'
import { Employee, EmployeeLedgerEntry } from '@/types/employees'
import { RecordAdvanceDialog } from '../components/RecordAdvanceDialog'
import { RecordSalaryPaymentDialog } from '../components/RecordSalaryPaymentDialog'
import { formatBDT } from '@/lib/calculations/financialCalculations'

export function EmployeeDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const [advanceOpen, setAdvanceOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [, startTransition] = useTransition()

  const { data, loading, refetch } = useRepositoryQuery(
    async () => {
      if (!id) return { employee: null as Employee | null, ledger: [] as EmployeeLedgerEntry[] }
      const [employee, ledger] = await Promise.all([
        employeesRepository.getEmployeeById(id),
        employeesRepository.getEmployeeLedger(id),
      ])
      return { employee, ledger }
    },
    { deps: [id], initialData: { employee: null, ledger: [] } }
  )

  const { employee, ledger } = data

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
    switch (employee.compensationMethod) {
      case 'piece':
        return `Per-Piece Rate: ৳${employee.ratePerPiece}/piece`
      case 'dozen':
        return `Per-Dozen Rate: ৳${employee.ratePerDozen}/dozen (৳${((employee.ratePerDozen || 0) / 12).toFixed(2)}/pc)`
      case 'monthly_fixed':
        return `Fixed Monthly Salary: ${formatBDT(employee.monthlySalary || 0)}`
      case 'monthly_plus_incentive':
        return `Monthly Salary: ${formatBDT(employee.monthlySalary || 0)} + Output Incentive`
      default:
        return employee.compensationMethod
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild size="sm" className="h-8 px-2">
          <Link to="/employees" className="text-xs">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Employees
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`${employee.name} (${employee.employeeCode})`}
        description={`${employee.designation} • Joined ${employee.joiningDate}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <PrintButton label="Print Wage Statement" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdvanceOpen(true)}
            >
              <DollarSign className="h-4 w-4 mr-1.5" /> Issue Advance
            </Button>
            <Button size="sm" onClick={() => setPaymentOpen(true)}>
              <Banknote className="h-4 w-4 mr-1.5" /> Disburse Payment
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <SummaryCard
          title="Current Payable Balance"
          value={formatBDT(employee.currentPayableBalance)}
          subtitle="Net wage/salary liability due"
          icon={Banknote}
        />
        <SummaryCard
          title="Total Earned Wages"
          value={formatBDT(employee.totalEarnedWages)}
          subtitle="All approved production work"
          icon={Award}
        />
        <SummaryCard
          title="Payments Disbursed"
          value={formatBDT(employee.totalPaymentsMade)}
          subtitle="Settled salary/wage vouchers"
          icon={DollarSign}
        />
        <SummaryCard
          title="Advances Outstanding"
          value={formatBDT(employee.totalAdvancesOutstanding)}
          subtitle="Cash advances subject to recovery"
          icon={DollarSign}
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

      {/* Chronological Worker Wage Ledger */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Worker Wage & Payment Ledger</CardTitle>
            <CardDescription>
              Chronological log of earned wages from approved production (credits) and
              disbursements/advances (debits).
            </CardDescription>
          </div>
          <StatusBadge status={employee.status} />
        </CardHeader>

        <CardContent>
          {ledger.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No ledger transactions recorded for this employee yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Date</th>
                    <th className="py-2.5 px-3 text-left">Transaction Type</th>
                    <th className="py-2.5 px-3 text-left">Description / Voucher</th>
                    <th className="py-2.5 px-3 text-right">Debit (Payment/Advance)</th>
                    <th className="py-2.5 px-3 text-right">Credit (Wage Earned)</th>
                    <th className="py-2.5 px-3 text-right">Payable Balance</th>
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
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            entry.type === 'wage_earned'
                              ? 'bg-primary/15 text-primary'
                              : entry.type === 'advance_given'
                              ? 'bg-status-pending/15 text-status-pending-foreground dark:text-status-pending'
                              : 'bg-status-active/15 text-status-active-foreground dark:text-status-active'
                          }`}
                        >
                          {entry.type === 'wage_earned'
                            ? 'Wage Earned'
                            : entry.type === 'advance_given'
                            ? 'Cash Advance'
                            : 'Payment Issued'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-foreground font-medium">
                        {entry.description}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-status-active-foreground dark:text-status-active">
                        {entry.debit > 0 ? formatBDT(entry.debit) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-primary">
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
