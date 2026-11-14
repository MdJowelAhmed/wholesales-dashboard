import { useState, useMemo } from 'react'
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
import { FinishedGoodsStockItem, InventoryMovement } from '@/types/inventory'
import { Shopkeeper } from '@/types/shopkeepers'
import { ExpenseRecord, PayrollRecord } from '@/types/finance'
import { RawMaterial } from '@/types/rawMaterials'
import {
  calculatePnLMetrics,
  calculateRawMaterialConsumptionCost,
  calculateRawMaterialInventoryValuation,
} from '@/lib/calculations/financialCalculations'
import { exportToCsv } from '@/lib/utils/csvExport'
import { toast } from 'sonner'
import { useRepositoryQuery, QUERY_INVALIDATION_SCOPES } from '@/lib/hooks'
import { SalesReportTab } from '../components/SalesReportTab'
import { InventoryReportTab } from '../components/InventoryReportTab'
import { ReceivablesReportTab } from '../components/ReceivablesReportTab'
import { PnlReportTab } from '../components/PnlReportTab'

interface ReportsData {
  sales: Sale[]
  stock: FinishedGoodsStockItem[]
  materials: RawMaterial[]
  movements: InventoryMovement[]
  shopkeepers: Shopkeeper[]
  expenses: ExpenseRecord[]
  payroll: PayrollRecord[]
}

export function ReportsPage() {
  const [activeReport, setActiveReport] = useState<'sales' | 'inventory' | 'receivables' | 'pnl'>('sales')

  const { data, loading } = useRepositoryQuery<ReportsData>(
    async () => {
      const [salesData, stockData, matData, movementData, skData, expData, pyrData] =
        await Promise.all([
          salesRepository.listSales(),
          inventoryRepository.getFinishedGoodsStock(),
          inventoryRepository.getRawMaterialsStock(),
          inventoryRepository.getStockMovements(),
          shopkeepersRepository.listShopkeepers(),
          financeRepository.listExpenses(),
          financeRepository.listPayroll(),
        ])
      return {
        sales: salesData,
        stock: stockData,
        materials: matData,
        movements: movementData,
        shopkeepers: skData,
        expenses: expData,
        payroll: pyrData,
      }
    },
    {
      initialData: {
        sales: [],
        stock: [],
        materials: [],
        movements: [],
        shopkeepers: [],
        expenses: [],
        payroll: [],
      },
      invalidationScopes: [...QUERY_INVALIDATION_SCOPES.reports],
    }
  )

  const { sales, stock, materials, movements, shopkeepers, expenses, payroll } = data

  const pnl = useMemo(() => {
    const totalSalesRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0)
    const actualMaterialCost = calculateRawMaterialConsumptionCost(movements, materials)
    const rawMaterialInventoryValuation = calculateRawMaterialInventoryValuation(materials)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalWages = payroll.reduce((sum, p) => sum + p.netPayable, 0)
    const finishedGoodsValuation = stock.reduce((sum, item) => sum + item.valuation, 0)

    const baseMetrics = calculatePnLMetrics({
      salesRevenue: totalSalesRevenue,
      actualMaterialCost,
      expenses: totalExpenses,
      wages: totalWages,
    })

    return {
      ...baseMetrics,
      finishedGoodsValuation,
      rawMaterialInventoryValuation,
    }
  }, [sales, materials, movements, stock, expenses, payroll])

  const handleExportSalesCsv = () => {
    const rows = sales.map((s) => ({
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
    exportToCsv('aparajita-sales-collections-report.csv', rows)
    toast.success('Downloaded Sales & Collections CSV')
  }

  const handleExportInventoryCsv = () => {
    const rows = stock.map((st) => ({
      SKU: st.sku,
      Product: st.productName,
      Size: st.size,
      'Pieces in Stock': st.currentPieces,
      'Price Per Piece (BDT)': st.pricePerPiece,
      'Total Asset Valuation (BDT)': st.valuation,
      ReorderThreshold: st.reorderLevel,
    }))
    exportToCsv('aparajita-warehouse-inventory-valuation.csv', rows)
    toast.success('Downloaded Inventory Asset Valuation CSV')
  }

  const handleExportReceivablesCsv = () => {
    const rows = shopkeepers.map((sk) => ({
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
    exportToCsv('aparajita-wholesale-receivables-aging.csv', rows)
    toast.success('Downloaded Wholesale Receivables CSV')
  }

  const handleExportPnlCsv = () => {
    const rows = [
      { Metric: 'Gross Commercial Revenue (Sales)', 'Amount (BDT)': pnl.grossRevenue },
      { Metric: 'Cost of Raw Materials Consumed (from production issues)', 'Amount (BDT)': -pnl.actualMaterialCost },
      {
        Metric: 'Raw Material Inventory Asset (on-hand valuation)',
        'Amount (BDT)': pnl.rawMaterialInventoryValuation,
      },
      { Metric: 'Gross Manufacturing Margin', 'Amount (BDT)': pnl.grossRevenue - pnl.actualMaterialCost },
      { Metric: 'Worker Payroll & Tailor Wages', 'Amount (BDT)': -pnl.totalWages },
      { Metric: 'Factory Overhead Expenses', 'Amount (BDT)': -pnl.totalExpenses },
      { Metric: 'Net Operating Profit (EBITDA)', 'Amount (BDT)': pnl.netOperatingProfit },
      { Metric: 'Finished Goods Inventory Asset Valuation', 'Amount (BDT)': pnl.finishedGoodsValuation },
    ]
    exportToCsv('aparajita-factory-pnl-summary.csv', rows)
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