import React, { useState, useTransition } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Truck, Eye, CreditCard, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { StatusBadge } from '@/components/shared/StatusBadge/StatusBadge'
import { DataTable, ColumnDef } from '@/components/shared/DataTable/DataTable'
import { TableSkeleton, CardGridSkeleton } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { suppliersRepository } from '@/mocks/repositories/suppliersRepository'
import { useRepositoryQuery, QUERY_INVALIDATION_SCOPES } from '@/lib/hooks'
import { Supplier } from '@/types/suppliers'
import { AddSupplierDialog } from '../components/AddSupplierDialog'
import { RecordSupplierPaymentDialog } from '../components/RecordSupplierPaymentDialog'
import { formatBDT } from '@/lib/calculations/financialCalculations'

export function SuppliersListPage(): React.JSX.Element {
  const { data: suppliers = [], loading, refetch } = useRepositoryQuery(
    () => suppliersRepository.listSuppliers(),
    { initialData: [], invalidationScopes: [...QUERY_INVALIDATION_SCOPES.suppliers] }
  )
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [paySupplier, setPaySupplier] = useState<Supplier | null>(null)
  const navigate = useNavigate()
  const [, startTransition] = useTransition()

  const handleRefetch = () => {
    startTransition(() => {
      refetch()
    })
  }

  const totalOutstanding = suppliers.reduce((sum, s) => sum + (s.outstandingPayable ?? 0), 0)
  const totalPurchases = suppliers.reduce((sum, s) => sum + (s.totalPurchases ?? 0), 0)

  const columns: ColumnDef<Supplier>[] = [
    {
      key: 'name',
      header: 'Supplier & Contact',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <Link
              to={`/suppliers/${row.id}`}
              className="font-semibold text-foreground hover:underline"
            >
              {row.name}
            </Link>
            <div className="text-xs text-muted-foreground">{row.contactPerson}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'materialsSupplied',
      header: 'Primary Materials',
      cell: (row) => (
        <div className="text-xs text-muted-foreground max-w-xs truncate">
          {row.materialsSupplied?.join(', ') || 'Various Materials'}
        </div>
      ),
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
      header: 'Total Paid',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-status-active-foreground dark:text-status-active">
          {formatBDT(row.totalPayments)}
        </span>
      ),
    },
    {
      key: 'outstandingPayable',
      header: 'Outstanding Payable',
      sortable: true,
      cell: (row) => (
        <span
          className={`font-mono text-xs font-bold ${
            row.outstandingPayable > 0 ? 'text-destructive' : 'text-foreground'
          }`}
        >
          {formatBDT(row.outstandingPayable)}
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
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => navigate(`/suppliers/${row.id}`)}
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
          </Button>
          {row.outstandingPayable > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-medium"
              onClick={() => setPaySupplier(row)}
            >
              <CreditCard className="h-3.5 w-3.5 mr-1" /> Pay
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers & Fabric Mills"
        description="Spinning mills, fabric weavers, dye houses, and sewing accessory vendors."
        actions={
          <Button onClick={() => setAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Supplier
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
              title="Total Outstanding Payables"
              value={formatBDT(totalOutstanding)}
              subtitle="Liabilities owed to fabric/trims mills"
              icon={DollarSign}
            />
            <SummaryCard
              title="Cumulative Purchases"
              value={formatBDT(totalPurchases)}
              subtitle="Total material procurements"
              icon={Truck}
            />
            <SummaryCard
              title="Active Suppliers"
              value={`${suppliers.length} Mills & Traders`}
              subtitle="Square, Beximco, Rahim & partners"
              icon={Truck}
            />
          </div>

          <DataTable
            data={suppliers}
            columns={columns}
            searchKey={(s) => `${s.name} ${s.contactPerson} ${s.phone} ${s.address}`}
            searchPlaceholder="Search supplier name, contact person, or location..."
            emptyTitle="No suppliers found"
            emptyDescription="Add spinning mills or accessory traders to record transactions."
          />
        </>
      )}

      <AddSupplierDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleRefetch}
      />

      {paySupplier && (
        <RecordSupplierPaymentDialog
          supplierId={paySupplier.id}
          supplierName={paySupplier.name}
          outstandingPayable={paySupplier.outstandingPayable}
          open={!!paySupplier}
          onOpenChange={(open) => !open && setPaySupplier(null)}
          onSuccess={handleRefetch}
        />
      )}
    </div>
  )
}
