import { useState, useEffect, useMemo } from 'react'
import {
  BarChart3,
  Printer,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { salesRepository } from '@/mocks/repositories/salesRepository'
import { inventoryRepository } from '@/mocks/repositories/inventoryRepository'
import { shopkeepersRepository } from '@/mocks/repositories/shopkeepersRepository'
import { financeRepository } from '@/mocks/repositories/financeRepository'
import { Sale } from '@/types/sales'
import { FinishedGoodsStockItem } from '@/types/inventory'
import { Shopkeeper } from '@/types/shopkeepers'
import { ExpenseRecord, PayrollRecord } from '@/types/finance'
import { calculatePnLMetrics } from '@/lib/calculations/financialCalculations'
import { exportToCsv } from '@/lib/utils/csvExport'
import { toast } from 'sonner'
import { SalesReportTab } from '../components/SalesReportTab'
import { InventoryReportTab } from '../components/InventoryReportTab'
import { ReceivablesReportTab } from '../components/ReceivablesReportTab'
import { PnlReportTab } from '../components/PnlReportTab'

export function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [stock, setStock] = useState<FinishedGoodsStockItem[]>([])
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([])
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [activeReport, setActiveReport] = useState<'sales' | 'inventory' | 'receivables' | 'pnl'>('sales')

  useEffect(() => {
    async function loadReportData() {
      try {
        setLoading(true)
        const [salesData, stockData, skData, expData, pyrData] = await Promise.all([
          salesRepository.listSales(),
          inventoryRepository.getFinishedGoodsStock(),
          shopkeepersRepository.listShopkeepers(),
          financeRepository.listExpenses(),
          financeRepository.listPayroll(),
        ])
        setSales(salesData)
        setStock(stockData)
        setShopkeepers(skData)
        setExpenses(expData)
        setPayroll(pyrData)
      } catch (err) {
        console.error('Failed to load reports data', err)
      } finally {
        setLoading(false)
      }
    }
    loadReportData()
  }, [])

  // Centralized P&L calculation from financialCalculations
  const pnl = useMemo(() => {
    const totalSalesRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0)
    const totalDispatchedValue = shopkeepers.reduce((sum, sk) => sum + sk.totalDeliveredValue, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalWages = payroll.reduce((sum, p) => sum + p.netPayable, 0)
    const finishedGoodsValuation = stock.reduce((sum, item) => sum + item.valuation, 0)

    const baseMetrics = calculatePnLMetrics({
      salesRevenue: totalSalesRevenue,
      dispatchedValue: totalDispatchedValue,
      expenses: totalExpenses,
      wages: totalWages,
    })

    return {
      ...baseMetrics,
      finishedGoodsValuation,
    }
  }, [sales, shopkeepers, stock, expenses, payroll])

  // CSV Export Handlers
  const handleExportSalesCsv = () => {
    const data = sales.map((s) => ({
      'Invoice #': s.invoiceNumber,
      Date: s.date,
      Customer: s.customerName,
      Type: s.customerType === 'wholesale_shopkeeper' ? 'Wholesale' : 'Retail',
      'Pieces Count': s.items.reduce((sum, i) => sum + i.quantityPieces, 0),
      'Invoiced Amount (BDT)': s.totalAmount,
      'Paid Amount (BDT)': s.paidAmount,
      'Outstanding Balance (BDT)': s.outstandingBalance,
      Status: s.status,
    }))
    exportToCsv('aparajita-sales-collections-report.csv', data)
    toast.success('Downloaded Sales & Collections CSV')
  }

  const handleExportInventoryCsv = () => {
    const data = stock.map((st) => ({
      SKU: st.sku,
      Product: st.productName,
      Size: st.size,
      'Pieces in Stock': st.currentPieces,
      'Price Per Piece (BDT)': st.pricePerPiece,
      'Total Asset Valuation (BDT)': st.valuation,
      ReorderThreshold: st.reorderLevel,
    }))
    exportToCsv('aparajita-warehouse-inventory-valuation.csv', data)
    toast.success('Downloaded Inventory Asset Valuation CSV')
  }

  const handleExportReceivablesCsv = () => {
    const data = shopkeepers.map((sk) => ({
      Shop: sk.shopName,
      Owner: sk.ownerName,
      Market: sk.marketName,
      Phone: sk.phone,
      'Delivered Value (BDT)': sk.totalDeliveredValue,
      'Payments Received (BDT)': sk.totalPaymentsReceived,
      'Returns Adjustments (BDT)': sk.totalReturnAdjustments,
      'Outstanding Balance (BDT)': sk.outstandingBalance,
      'Consignment Held': sk.consignmentPiecesHeld,
    }))
    exportToCsv('aparajita-wholesale-receivables-aging.csv', data)
    toast.success('Downloaded Wholesale Receivables CSV')
  }

  const handleExportPnlCsv = () => {
    const data = [
      { Metric: 'Gross Commercial Revenue (Sales + Wholesale Dispatches)', 'Amount (BDT)': pnl.grossRevenue },
      { Metric: 'Estimated Cost of Goods Sold (Fabric/Trims @ ~45%)', 'Amount (BDT)': -pnl.estimatedMaterialCost },
      { Metric: 'Gross Manufacturing Margin', 'Amount (BDT)': pnl.grossRevenue - pnl.estimatedMaterialCost },
      { Metric: 'Worker Payroll & Tailor Wages', 'Amount (BDT)': -pnl.totalWages },
      { Metric: 'Factory Overhead Expenses', 'Amount (BDT)': -pnl.totalExpenses },
      { Metric: 'Net Operating Profit (EBITDA)', 'Amount (BDT)': pnl.netOperatingProfit },
      { Metric: 'Finished Goods Inventory Asset Valuation', 'Amount (BDT)': pnl.finishedGoodsValuation },
    ]
    exportToCsv('aparajita-factory-pnl-summary.csv', data)
    toast.success('Downloaded Factory P&L CSV')
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Loading reports & financial statements...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Executive Reports & Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Financial statements, inventory asset valuation, receivables aging, and downloadable CSV audits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="border-border text-foreground"
            id="btn-print-report"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Report Sheet
          </Button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <Button
          variant={activeReport === 'sales' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveReport('sales')}
          className="text-xs"
          id="tab-report-sales"
        >
          <DollarSign className="mr-1.5 h-3.5 w-3.5" />
          Sales & Realization
        </Button>
        <Button
          variant={activeReport === 'inventory' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveReport('inventory')}
          className="text-xs"
          id="tab-report-inventory"
        >
          <Package className="mr-1.5 h-3.5 w-3.5" />
          Stock Valuation & Assets
        </Button>
        <Button
          variant={activeReport === 'receivables' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveReport('receivables')}
          className="text-xs"
          id="tab-report-receivables"
        >
          <Layers className="mr-1.5 h-3.5 w-3.5" />
          Wholesale Receivables Aging
        </Button>
        <Button
          variant={activeReport === 'pnl' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveReport('pnl')}
          className="text-xs"
          id="tab-report-pnl"
        >
          <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
          Profit & Loss Statement (P&L)
        </Button>
      </div>

      {/* Tab Contents */}
      {activeReport === 'sales' && (
        <SalesReportTab sales={sales} onExportCsv={handleExportSalesCsv} />
      )}
      {activeReport === 'inventory' && (
        <InventoryReportTab stock={stock} onExportCsv={handleExportInventoryCsv} />
      )}
      {activeReport === 'receivables' && (
        <ReceivablesReportTab shopkeepers={shopkeepers} onExportCsv={handleExportReceivablesCsv} />
      )}
      {activeReport === 'pnl' && (
        <PnlReportTab pnl={pnl} onExportCsv={handleExportPnlCsv} />
      )}
    </div>
  )
}
