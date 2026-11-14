import React, { useState, useMemo, useTransition } from 'react'
import { Plus, Users, DollarSign, Banknote } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { DataTable } from '@/components/shared/DataTable/DataTable'
import { TableSkeleton, CardGridSkeleton } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { employeesRepository } from '@/mocks/repositories/employeesRepository'
import { useRepositoryQuery, QUERY_INVALIDATION_SCOPES } from '@/lib/hooks'
import { Employee } from '@/types/employees'
import { AddEmployeeDialog } from '../components/AddEmployeeDialog'
import { RecordAdvanceDialog } from '../components/RecordAdvanceDialog'
import { RecordSalaryPaymentDialog } from '../components/RecordSalaryPaymentDialog'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { useEmployeesTableColumns } from '../components/useEmployeesTableColumns'

export function EmployeesListPage(): React.JSX.Element {
  const { data: employees = [], loading, refetch } = useRepositoryQuery(
    () => employeesRepository.listEmployees(),
    { initialData: [], invalidationScopes: [...QUERY_INVALIDATION_SCOPES.employees] }
  )
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [compensationFilter, setCompensationFilter] = useState('all')
  const [advanceEmp, setAdvanceEmp] = useState<Employee | null>(null)
  const [payEmp, setPayEmp] = useState<Employee | null>(null)
  const [, startTransition] = useTransition()
  const columns = useEmployeesTableColumns(setAdvanceEmp, setPayEmp)

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
