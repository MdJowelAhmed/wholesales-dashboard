import React, { useState, useTransition } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, UserCheck, Eye, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { StatusBadge } from '@/components/shared/StatusBadge/StatusBadge'
import { DataTable, ColumnDef } from '@/components/shared/DataTable/DataTable'
import { TableSkeleton, CardGridSkeleton } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { salesRepository } from '@/mocks/repositories/salesRepository'
import { useRepositoryQuery, QUERY_INVALIDATION_SCOPES } from '@/lib/hooks'
import { Customer } from '@/types/sales'
import { AddCustomerDialog } from '../components/AddCustomerDialog'
import { RecordCustomerPaymentDialog } from '../components/RecordCustomerPaymentDialog'
import { formatBDT } from '@/lib/calculations/financialCalculations'

export function CustomersListPage(): React.JSX.Element {
  const { data: customers = [], loading, refetch } = useRepositoryQuery(
    () => salesRepository.listCustomers(),
    { initialData: [], invalidationScopes: [...QUERY_INVALIDATION_SCOPES.customers] }
  )
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [payCust, setPayCust] = useState<Customer | null>(null)
  const navigate = useNavigate()
  const [, startTransition] = useTransition()

  const handleRefetch = () => {
    startTransition(() => {
      refetch()
    })
  }

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstandingBalance ?? 0), 0)
  const totalPurchases = customers.reduce((sum, c) => sum + (c.totalPurchases ?? 0), 0)

  const columns: ColumnDef<Customer>[] = [
    {
      key: 'name',
      header: 'Customer / Boutique Name',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <Link
              to={`/customers/${row.id}`}
              className="font-semibold text-foreground hover:underline"
            >
              {row.name}
            </Link>
            <div className="text-xs text-muted-foreground">{row.address || 'Direct Showroom'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone Number',
      cell: (row) => <span className="font-mono text-xs">{row.phone}</span>,
    },
    {
      key: 'totalPurchases',
      header: 'Total Purchases',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {formatBDT(row.totalPurchases)}
        </span>
      ),
    },
    {
      key: 'totalPayments',
      header: 'Total Payments',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-status-active-foreground dark:text-status-active">
          {formatBDT(row.totalPayments)}
        </span>
      ),
    },
    {
      key: 'outstandingBalance',
      header: 'Outstanding Balance',
      sortable: true,
      cell: (row) => (
        <span
          className={`font-mono text-xs font-bold ${
            row.outstandingBalance > 0 ? 'text-destructive' : 'text-foreground'
          }`}
        >
          {formatBDT(row.outstandingBalance)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <StatusBadge
          status={row.status === 'active' ? 'active' : 'inactive'}
          label={row.status.toUpperCase()}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.outstandingBalance > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-medium"
              onClick={() => setPayCust(row)}
            >
              Receive Pay
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => navigate(`/customers/${row.id}`)}
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retail & Boutique Customers"
        description="Showroom buyers, local boutiques, and retail garments credit sales accounts."
        actions={
          <Button onClick={() => setAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Customer
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
              title="Customer Receivables"
              value={formatBDT(totalOutstanding)}
              subtitle="Net retail/boutique dues"
              icon={DollarSign}
            />
            <SummaryCard
              title="Total Sales Value"
              value={formatBDT(totalPurchases)}
              subtitle="All retail orders & invoices"
              icon={UserCheck}
            />
            <SummaryCard
              title="Registered Clients"
              value={`${customers.length} Boutiques`}
              subtitle="Uttara, Dhanmondi, Gulshan"
              icon={UserCheck}
            />
          </div>

          <DataTable
            data={customers}
            columns={columns}
            searchKey={(c) => `${c.name} ${c.phone} ${c.address || ''}`}
            searchPlaceholder="Search customer name, phone, or address..."
            emptyTitle="No customers found"
            emptyDescription="Add retail boutique accounts to track showroom sales and payments."
          />
        </>
      )}

      <AddCustomerDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleRefetch}
      />

      {payCust && (
        <RecordCustomerPaymentDialog
          customerId={payCust.id}
          customerName={payCust.name}
          outstandingBalance={payCust.outstandingBalance}
          open={!!payCust}
          onOpenChange={(open) => !open && setPayCust(null)}
          onSuccess={handleRefetch}
        />
      )}
    </div>
  )
}
