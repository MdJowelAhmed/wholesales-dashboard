import { useState, useMemo, useTransition } from 'react'
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  Zap,
  Truck,
  Box,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { financeRepository } from '@/mocks/repositories/financeRepository'
import { useRepositoryQuery } from '@/lib/hooks'
import { ExpenseRecord } from '@/types/finance'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { AddExpenseDialog } from '../components/AddExpenseDialog'
import { ExpensesTable } from '../components/ExpensesTable'

export function ExpensesListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [, startTransition] = useTransition()

  const { data: expenses = [], loading, refetch } = useRepositoryQuery<ExpenseRecord[]>(
    () => financeRepository.listExpenses(),
    { initialData: [] }
  )

  const handleRefetch = () => {
    startTransition(() => {
      refetch()
    })
  }

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        e.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.reference && e.reference.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchCategory = categoryFilter === 'all' || e.category === categoryFilter
      const matchMethod = methodFilter === 'all' || e.paymentMethod === methodFilter

      return matchSearch && matchCategory && matchMethod
    })
  }, [expenses, searchTerm, categoryFilter, methodFilter])

  const metrics = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0)
    const utilities = expenses
      .filter((e) => e.category === 'electricity')
      .reduce((sum, e) => sum + (e.amount ?? 0), 0)
    const transport = expenses
      .filter((e) => e.category === 'transport')
      .reduce((sum, e) => sum + (e.amount ?? 0), 0)
    const packaging = expenses
      .filter((e) => e.category === 'packaging')
      .reduce((sum, e) => sum + (e.amount ?? 0), 0)

    return { total, utilities, transport, packaging }
  }, [expenses])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            Factory & Operational Expenses
          </h1>
          <p className="text-sm text-muted-foreground">
            Track manufacturing utilities, machine maintenance, packaging trims, and logistic overheads
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          id="btn-log-expense"
        >
          <Plus className="mr-2 h-4 w-4" />
          Log Expense Voucher
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Factory Overheads</span>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.total)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Direct overhead costs</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Power & Electricity</span>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.utilities)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Factory power & generator</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Logistics & Transport</span>
              <Truck className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.transport)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Cartage & shop dispatches</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Packaging & Poly Bags</span>
              <Box className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.packaging)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Finished garment boxes & poly</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by voucher #, title, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
              id="input-search-expenses"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                aria-label="Filter expenses by category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Expense Categories</option>
                <option value="electricity">Electricity / Power</option>
                <option value="rent">Factory / Showroom Rent</option>
                <option value="transport">Transport / Logistics</option>
                <option value="packaging">Packaging Materials</option>
                <option value="maintenance">Machine Maintenance</option>
                <option value="food_entertainment">Staff Refreshment</option>
                <option value="other">Other Overheads</option>
              </select>
            </div>

            <select
              aria-label="Filter expenses by payment method"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <ExpensesTable
        loading={loading}
        filteredExpenses={filteredExpenses}
      />

      <AddExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleRefetch}
      />
    </div>
  )
}
