import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  DollarSign,
  Layers,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { salesRepository } from '@/mocks/repositories/salesRepository'
import { productsRepository } from '@/mocks/repositories/productsRepository'
import { shopkeepersRepository } from '@/mocks/repositories/shopkeepersRepository'
import { Sale, Customer } from '@/types/sales'
import { Product } from '@/types/products'
import { Shopkeeper } from '@/types/shopkeepers'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { CreateSaleInvoiceDialog } from '../components/CreateSaleInvoiceDialog'

export function SalesListPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'pending'>('all')
  const [customerTypeFilter, setCustomerTypeFilter] = useState<'all' | 'retail_customer' | 'wholesale_shopkeeper'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [salesData, productsData, customersData, shopkeepersData] = await Promise.all([
        salesRepository.listSales(),
        productsRepository.listProducts(),
        salesRepository.listCustomers(),
        shopkeepersRepository.listShopkeepers(),
      ])
      setSales(salesData)
      setProducts(productsData)
      setCustomers(customersData)
      setShopkeepers(shopkeepersData)
    } catch (err) {
      console.error('Failed to load sales data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchSearch =
        sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customerPhone && sale.customerPhone.includes(searchTerm))

      const matchStatus = statusFilter === 'all' || sale.status === statusFilter
      const matchType = customerTypeFilter === 'all' || sale.customerType === customerTypeFilter

      return matchSearch && matchStatus && matchType
    })
  }, [sales, searchTerm, statusFilter, customerTypeFilter])

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalInvoiced = sales.reduce((sum, s) => sum + s.totalAmount, 0)
    const totalPaid = sales.reduce((sum, s) => sum + s.paidAmount, 0)
    const totalDue = sales.reduce((sum, s) => sum + s.outstandingBalance, 0)
    const totalPieces = sales.reduce(
      (sum, s) => sum + s.items.reduce((itemSum, item) => itemSum + item.quantityPieces, 0),
      0
    )
    return { totalInvoiced, totalPaid, totalDue, totalPieces }
  }, [sales])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Sales & Invoicing
          </h1>
          <p className="text-sm text-muted-foreground">
            Retail shop receipts, wholesale credit invoices, and real-time piece-based billing
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          id="btn-new-sale-invoice"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Sales Invoice
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Invoiced</span>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.totalInvoiced)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Across {sales.length} invoices</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Paid Collections</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.totalPaid)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {metrics.totalInvoiced > 0
                ? `${Math.round((metrics.totalPaid / metrics.totalInvoiced) * 100)}% realization rate`
                : 'No sales recorded'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Receivables Due</span>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.totalDue)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Pending customer collection</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Garments Sold</span>
              <Layers className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {metrics.totalPieces.toLocaleString()} pcs
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Individual piece count</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice #, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
              id="input-search-sales"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                aria-label="Filter by customer type"
                value={customerTypeFilter}
                onChange={(e) =>
                  setCustomerTypeFilter(e.target.value as 'all' | 'retail_customer' | 'wholesale_shopkeeper')
                }
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Clients</option>
                <option value="retail_customer">Retail Customers</option>
                <option value="wholesale_shopkeeper">Wholesale Shopkeepers</option>
              </select>
            </div>

            <select
              aria-label="Filter by payment status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'paid' | 'partial' | 'pending')
              }
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Sales Invoices Table */}
      <Card className="border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer / Party</th>
                <th className="px-4 py-3">Garments & Items</th>
                <th className="px-4 py-3 text-right">Total Invoice</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Due Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    Loading sales records...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    No sales invoices found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const piecesCount = sale.items.reduce(
                    (sum, item) => sum + item.quantityPieces,
                    0
                  )
                  return (
                    <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        <Link
                          to={`/sales/${sale.id}`}
                          className="hover:text-primary transition-colors hover:underline flex items-center gap-1.5"
                        >
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          {sale.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {sale.date}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{sale.customerName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge
                            variant="outline"
                            className={
                              sale.customerType === 'wholesale_shopkeeper'
                                ? 'bg-primary/10 text-primary border-primary/20 text-[10px]'
                                : 'bg-muted text-muted-foreground text-[10px]'
                            }
                          >
                            {sale.customerType === 'wholesale_shopkeeper' ? 'Wholesale' : 'Retail'}
                          </Badge>
                          {sale.customerPhone && (
                            <span className="text-xs text-muted-foreground">
                              {sale.customerPhone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {piecesCount} pcs
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {sale.items.length} {sale.items.length === 1 ? 'line item' : 'line items'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {formatBDT(sale.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatBDT(sale.paidAmount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {sale.outstandingBalance > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            {formatBDT(sale.outstandingBalance)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">Settled</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {sale.status === 'paid' && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                            Paid
                          </Badge>
                        )}
                        {sale.status === 'partial' && (
                          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                            Partial
                          </Badge>
                        )}
                        {sale.status === 'pending' && (
                          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
                            Pending
                          </Badge>
                        )}
                        {sale.status === 'returned' && (
                          <Badge className="bg-muted text-muted-foreground">
                            Returned
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/sales/${sale.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Invoice Dialog */}
      <CreateSaleInvoiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        products={products}
        customers={customers}
        shopkeepers={shopkeepers}
        onSuccess={loadData}
      />
    </div>
  )
}
