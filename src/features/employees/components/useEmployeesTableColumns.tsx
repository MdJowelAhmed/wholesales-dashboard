import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, Eye, DollarSign, Banknote } from 'lucide-react'
import { ColumnDef } from '@/components/shared/DataTable/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge/StatusBadge'
import { Button } from '@/components/ui/button'
import { Employee } from '@/types/employees'
import { formatBDT } from '@/lib/calculations/financialCalculations'

function formatCompensation(emp: Employee): string {
  switch (emp.compensationMethod) {
    case 'piece':
      return `Piece Rate (৳${emp.ratePerPiece}/pc)`
    case 'dozen':
      return `Dozen Rate (৳${emp.ratePerDozen}/dz)`
    case 'monthly_fixed':
      return `Monthly (${formatBDT(emp.monthlySalary || 0)})`
    default:
      return emp.compensationMethod
  }
}

export function useEmployeesTableColumns(
  setAdvanceEmp: (emp: Employee) => void,
  setPayEmp: (emp: Employee) => void
): ColumnDef<Employee>[] {
  const navigate = useNavigate()

  return useMemo(
    () => [
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
    ],
    [navigate, setAdvanceEmp, setPayEmp]
  )
}