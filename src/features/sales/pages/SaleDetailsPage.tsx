import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Printer,
  FileText,
  Calendar,
  User,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { salesRepository } from '@/mocks/repositories/salesRepository'
import { useRepositoryQuery, QUERY_INVALIDATION_SCOPES } from '@/lib/hooks'
import { Sale } from '@/types/sales'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { SaleInvoiceItemsList } from '../components/SaleInvoiceItemsList'

export function SaleDetailsPage() {
  const { id } = useParams<{ id: string }>()

  const { data: sale, loading } = useRepositoryQuery<Sale | null>(
    async () => {
      if (!id) return null
      return salesRepository.getSaleById(id)
    },
    { deps: [id], initialData: null, invalidationScopes: [...QUERY_INVALIDATION_SCOPES.sales] }
  )

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
        Loading invoice details...
      </div>
    )
  }

  if (!sale) {
    return (
      <div className="space-y-4">
        <Link to="/sales">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sales
          </Button>
        </Link>
        <Card className="border-border bg-card p-8 text-center">
          <h2 className="text-lg font-semibold text-foreground">Invoice Not Found</h2>
          <p className="text-sm text-muted-foreground mt-1">
            The requested sales invoice could not be located.
          </p>
        </Card>
      </div>
    )
  }

  const totalPieces = sale.items?.reduce((sum, item) => sum + (item.quantityPieces ?? 0), 0) ?? 0

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/sales">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="border-border text-foreground"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card shadow-sm print:border-none print:shadow-none">
        <CardHeader className="border-b border-border p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {sale.invoiceNumber}
                </h1>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Aparajita Garments & Wholesale ERP • Invoice Reference
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1.5">
              {sale.status === 'paid' && (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  Paid in Full
                </Badge>
              )}
              {sale.status === 'partial' && (
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs">
                  <AlertCircle className="mr-1 h-3.5 w-3.5" />
                  Partially Paid
                </Badge>
              )}
              {sale.status === 'pending' && (
                <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-xs">
                  <AlertCircle className="mr-1 h-3.5 w-3.5" />
                  Payment Due
                </Badge>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {sale.date}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                Billed To
              </span>
              <div className="font-semibold text-foreground text-base">{sale.customerName}</div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>
                  Type:{' '}
                  <span className="capitalize font-medium text-foreground">
                    {sale.customerType === 'wholesale_shopkeeper'
                      ? 'Wholesale Shopkeeper'
                      : 'Retail Customer'}
                  </span>
                </p>
                {sale.customerPhone && <p>Phone: {sale.customerPhone}</p>}
                <p>
                  Channel:{' '}
                  <span className="font-medium text-foreground">
                    {sale.saleType === 'own_shop' ? 'Own Factory Outlet' : 'Wholesale Credit'}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                Payment Settlement
              </span>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>
                  Method:{' '}
                  <span className="font-semibold text-foreground uppercase">
                    {sale.paymentMethod}
                  </span>
                </p>
                <p>
                  Total Pieces:{' '}
                  <span className="font-semibold text-foreground">{totalPieces} pcs</span>
                </p>
                {sale.notes && (
                  <p className="mt-2 text-xs italic text-muted-foreground">
                    Note: {sale.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          <SaleInvoiceItemsList items={sale.items} />

          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2 rounded-lg border border-border bg-muted/10 p-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({totalPieces} pcs):</span>
                <span className="font-medium text-foreground">{formatBDT(sale.subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>Order Discount:</span>
                  <span>- {formatBDT(sale.discount)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground text-base">
                <span>Net Invoice Total:</span>
                <span>{formatBDT(sale.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Amount Paid:</span>
                <span>{formatBDT(sale.paidAmount)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
                <span>Balance Due:</span>
                <span
                  className={
                    sale.outstandingBalance > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-muted-foreground'
                  }
                >
                  {formatBDT(sale.outstandingBalance)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
