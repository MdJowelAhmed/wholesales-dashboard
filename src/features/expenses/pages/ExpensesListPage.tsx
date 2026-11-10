import { useState, useEffect, useMemo } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { financeRepository } from '@/mocks/repositories/financeRepository'
import { ExpenseRecord } from '@/types/finance'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { AddExpenseDialog } from '../components/AddExpenseDialog'

export function ExpensesListPage() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const data = await financeRepository.listExpenses()
      setExpenses(data)
    } catch (err) {
      console.error('Failed to load expense records', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [])

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

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0)
    const utilities = expenses
      .filter((e) => e.category === 'electricity')
      .reduce((sum, e) => sum + e.amount, 0)
    const transport = expenses
      .filter((e) => e.category === 'transport')
      .reduce((sum, e) => sum + e.amount, 0)
    const packaging = expenses
      .filter((e) => e.category === 'packaging')
      .reduce((sum, e) => sum + e.amount, 0)

    return { total, utilities, transport, packaging }
  }, [expenses])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            Factory & Operational Expenses
          </h1>
          <p className="text-sm text-muted-foreground">
            Factory rent, DESCO electricity bills, transport vans, packaging cartons, and generator fuel
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

      {/* KPI Cards */}
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
            <p className="mt-1 text-xs text-muted-foreground">Across {expenses.length} vouchers</p>
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
            <p className="mt-1 text-xs text-muted-foreground">DESCO bills & generator fuel</p>
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
            <p className="mt-1 text-xs text-muted-foreground">Wholesale delivery vans & fares</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Packaging & Cartons</span>
              <Box className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.packaging)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Corrugated boxes & poly packs</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by voucher #, title, or ref..."
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
                <option value="all">All Categories</option>
                <option value="rent">Factory Rent</option>
                <option value="electricity">Electricity / Power</option>
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

      {/* Expenses Table */}
      <Card className="border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Voucher #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Title / Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Ref / Memo #</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Loading expenses...
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No expense records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground font-mono">
                      {exp.expenseNumber}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {exp.title}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[11px] capitalize">
                        {exp.category.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">
                      {formatBDT(exp.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className="bg-muted text-foreground text-xs uppercase"
                      >
                        {exp.paymentMethod.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {exp.reference || '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                      {exp.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadExpenses}
      />
    </div>
  )
}
