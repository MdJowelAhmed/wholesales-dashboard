import React, { useState, useMemo, useTransition } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Users, Eye, DollarSign, Banknote } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { StatusBadge } from '@/components/shared/StatusBadge/StatusBadge'
import { DataTable, ColumnDef } from '@/components/shared/DataTable/DataTable'
import { TableSkeleton, CardGridSkeleton } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { employeesRepository } from '@/mocks/repositories/employeesRepository'
import { useRepositoryQuery } from '@/lib/hooks'
import { Employee } from '@/types/employees'
import { AddEmployeeDialog } from '../components/AddEmployeeDialog'
import { RecordAdvanceDialog } from '../components/RecordAdvanceDialog'
import { RecordSalaryPaymentDialog } from '../components/RecordSalaryPaymentDialog'
import { formatBDT } from '@/lib/calculations/financialCalculations'

export function EmployeesListPage(): React.JSX.Element {
  const { data: employees = [], loading, refetch } = useRepositoryQuery(
    () => employeesRepository.listEmployees(),
    { initialData: [] }
  )
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [compensationFilter, setCompensationFilter] = useState('all')
  const [advanceEmp, setAdvanceEmp] = useState<Employee | null>(null)
  const [payEmp, setPayEmp] = useState<Employee | null>(null)
  const navigate = useNavigate()
  const [, startTransition] = useTransition()

  const handleRefetch = () => {
    startTransition(() => {
      refetch()
    })
  }

  const filtered = useMemo(() => {
    if (compensationFilter === 'all') return employees
    return employees.filter((e) => e.compensationMethod === compensationFilter)
  }, [employees, compensationFilter])

  const totalLiabilities = employees.reduce((sum, e) => sum + (e.currentPayableBalance ?? 0), 0)
  const totalEarned = employees.reduce((sum, e) => sum + (e.totalEarnedWages ?? 0), 0)

  const formatCompensation = (emp: Employee) => {
    switch (emp.compensationMethod) {
      case 'piece':
        return `Piece Rate (৳${emp.ratePerPiece}/pc)`
      case 'dozen':
        return `Dozen Rate (৳${emp.ratePerDozen}/dz)`
      case 'monthly_fixed':
        return `Monthly (${formatBDT(emp.monthlySalary || 0)})`
      case 'monthly_plus_incentive':
        return `Monthly+Incentive (${formatBDT(emp.monthlySalary || 0)})`
      default:
        return emp.compensationMethod
    }
  }

  const columns: ColumnDef<Employee>[] = [
    {
      key: 'name',
      header: 'Worker & Code',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <Link
              to={`/employees/${row.id}`}
              className="font-semibold text-foreground hover:underline"
            >
              {row.name}
            </Link>
            <div className="text-xs text-muted-foreground font-mono">{row.employeeCode}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'designation',
      header: 'Designation',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="text-xs font-semibold text-foreground">{row.designation}</div>
          <div className="text-[11px] text-muted-foreground">{row.phone}</div>
        </div>
      ),
    },
    {
      key: 'compensationMethod',
      header: 'Compensation Basis',
      cell: (row) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
          {formatCompensation(row)}
        </span>
      ),
    },
    {
      key: 'totalEarnedWages',
      header: 'Earned Wages',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {formatBDT(row.totalEarnedWages)}
        </span>
      ),
    },
    {
      key: 'currentPayableBalance',
      header: 'Payable Balance',
      sortable: true,
      cell: (row) => (
        <span
          className={`font-mono text-xs font-bold ${
            row.currentPayableBalance > 0 ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {formatBDT(row.currentPayableBalance)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/employees/${row.id}`)}
            className="h-8 px-2 text-xs"
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAdvanceEmp(row)}
            className="h-8 px-2 text-xs"
          >
            <DollarSign className="h-3.5 w-3.5 mr-1" /> Advance
          </Button>
          {row.currentPayableBalance > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPayEmp(row)}
              className="h-8 px-2 text-xs"
            >
              <Banknote className="h-3.5 w-3.5 mr-1" /> Pay
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factory Employees & Tailors"
        description="Master pattern cutters, sewing operators, overlock specialists, quality checkers, and piece-rate ledgers."
        actions={
          <Button onClick={() => setAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Employee
          </Button>
        }
      />

      {loading ? (
        <>
          <CardGridSkeleton count={3} />
          <TableSkeleton rows={5} cols={6} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              title="Wage Liabilities"
              value={formatBDT(totalLiabilities)}
              subtitle="Accrued wages & salaries payable"
              icon={Banknote}
            />
            <SummaryCard
              title="Total Wages Earned"
              value={formatBDT(totalEarned)}
              subtitle="Cumulative piece rate & monthly wages"
              icon={DollarSign}
            />
            <SummaryCard
              title="Active Workforce"
              value={`${employees.length} Workers`}
              subtitle="Cutting, sewing & finishing floor"
              icon={Users}
            />
          </div>

          <DataTable
            data={filtered}
            columns={columns}
            searchKey={(e) => `${e.name} ${e.employeeCode} ${e.designation} ${e.phone}`}
            searchPlaceholder="Search employee name, code, designation, or phone..."
            filterNode={
              <select
                value={compensationFilter}
                onChange={(e) => setCompensationFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Compensation Types</option>
                <option value="piece">Per-Piece Rate</option>
                <option value="dozen">Per-Dozen Rate</option>
                <option value="monthly_fixed">Fixed Monthly Salary</option>
                <option value="monthly_plus_incentive">Monthly + Incentive</option>
              </select>
            }
            emptyTitle="No employees found"
            emptyDescription="Register cutters or sewing machine operators to track wages."
          />
        </>
      )}

      <AddEmployeeDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleRefetch}
      />

      {advanceEmp && (
        <RecordAdvanceDialog
          employeeId={advanceEmp.id}
          employeeName={advanceEmp.name}
          open={!!advanceEmp}
          onOpenChange={(open) => !open && setAdvanceEmp(null)}
          onSuccess={handleRefetch}
        />
      )}

      {payEmp && (
        <RecordSalaryPaymentDialog
          employeeId={payEmp.id}
          employeeName={payEmp.name}
          currentPayableBalance={payEmp.currentPayableBalance}
          open={!!payEmp}
          onOpenChange={(open) => !open && setPayEmp(null)}
          onSuccess={handleRefetch}
        />
      )}
    </div>
  )
}
