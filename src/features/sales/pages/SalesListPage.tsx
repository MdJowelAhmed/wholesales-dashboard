import { useState, useMemo, useTransition } from 'react'
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { salesRepository } from '@/mocks/repositories/salesRepository'
import { productsRepository } from '@/mocks/repositories/productsRepository'
import { shopkeepersRepository } from '@/mocks/repositories/shopkeepersRepository'
import { useRepositoryQuery } from '@/lib/hooks'
import { Sale, Customer } from '@/types/sales'
import { Product } from '@/types/products'
import { Shopkeeper } from '@/types/shopkeepers'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { CreateSaleInvoiceDialog } from '../components/CreateSaleInvoiceDialog'
import { SalesTable } from '../components/SalesTable'

interface SalesData {
  sales: Sale[]
  products: Product[]
  customers: Customer[]
  shopkeepers: Shopkeeper[]
}

export function SalesListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'pending'>('all')
  const [customerTypeFilter, setCustomerTypeFilter] = useState<'all' | 'retail_customer' | 'wholesale_shopkeeper'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [, startTransition] = useTransition()

  const { data, loading, refetch } = useRepositoryQuery<SalesData>(
    async () => {
      const [salesData, productsData, customersData, shopkeepersData] = await Promise.all([
        salesRepository.listSales(),
        productsRepository.listProducts(),
        salesRepository.listCustomers(),
        shopkeepersRepository.listShopkeepers(),
      ])
      return {
        sales: salesData,
        products: productsData,
        customers: customersData,
        shopkeepers: shopkeepersData,
      }
    },
    {
      initialData: {
        sales: [],
        products: [],
        customers: [],
        shopkeepers: [],
      },
    }
  )

  const { sales, products, customers, shopkeepers } = data

  const handleRefetch = () => {
    startTransition(() => {
      refetch()
    })
  }

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchSearch =
        sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customerPhone && sale.customerPhone.includes(searchTerm))
      const matchStatus = statusFilter === 'all' || sale.status === statusFilter
      const matchCustomerType = customerTypeFilter === 'all' || sale.customerType === customerTypeFilter
      return matchSearch && matchStatus && matchCustomerType
    })
  }, [sales, searchTerm, statusFilter, customerTypeFilter])

  const metrics = useMemo(() => {
    const totalInvoiced = sales.reduce((sum, s) => sum + (s.totalAmount ?? 0), 0)
    const totalCollected = sales.reduce((sum, s) => sum + (s.paidAmount ?? 0), 0)
    const totalOutstanding = sales.reduce((sum, s) => sum + (s.outstandingBalance ?? 0), 0)
    const totalPiecesSold = sales.reduce(
      (sum, s) => sum + (s.items?.reduce((pSum, item) => pSum + (item.quantityPieces ?? 0), 0) ?? 0),
      0
    )

    return { totalInvoiced, totalCollected, totalOutstanding, totalPiecesSold }
  }, [sales])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Sales & Invoicing
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage finished garment sales, credit accounts, invoice generation, and receivables
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
            <p className="mt-1 text-xs text-muted-foreground">Gross sales billing</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Cash & Payments Collected</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.totalCollected)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Paid upfront and settled</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Credit Receivables Due</span>
              <AlertCircle className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.totalOutstanding)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Unpaid buyer balance</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Garments Sold</span>
              <Layers className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {metrics.totalPiecesSold.toLocaleString()} pcs
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Pieces across all invoices</p>
          </CardContent>
        </Card>
      </div>

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

      <SalesTable
        loading={loading}
        filteredSales={filteredSales}
      />

      <CreateSaleInvoiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        products={products}
        customers={customers}
        shopkeepers={shopkeepers}
        onSuccess={handleRefetch}
      />
    </div>
  )
}
