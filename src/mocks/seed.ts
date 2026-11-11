import { initialProducts } from './data/products.data'
import { initialMaterials, initialMaterialMovements } from './data/materials.data'
import { initialSuppliers, initialSupplierLedger } from './data/suppliers.data'
import { initialEmployees, initialEmployeeLedger } from './data/employees.data'
import { initialProductionEntries, initialProductionOrders } from './data/production.data'
import { initialFinishedGoodsStock, initialInventoryMovements } from './data/inventory.data'
import {
  initialShopkeepers,
  initialShopkeeperDeliveries,
  initialShopkeeperLedger,
  initialShopkeeperPayments,
  initialShopkeeperReturns,
} from './data/shopkeepers.data'
import { DEFAULT_PRODUCT_CATEGORIES, DEFAULT_PRODUCT_SIZES } from '@/types/products'
import {
  CategoryItem,
  SizeItem,
  ColorItem,
  INITIAL_CATEGORY_ITEMS,
  INITIAL_SIZE_ITEMS,
  INITIAL_COLOR_ITEMS,
} from '@/types/variants'
import {
  initialCustomers,
  initialCustomerLedger,
  initialExpenses,
  initialPayments,
  initialPayroll,
  initialSales,
} from './data/customersAndFinance.data'
import { LedgerEntry } from '@/types/ledger'

export interface SeedDatabase {
  version: string
  categories?: string[]
  productSizes?: string[]
  categoryItems?: CategoryItem[]
  sizeItems?: SizeItem[]
  colorItems?: ColorItem[]
  products: typeof initialProducts
  materials: typeof initialMaterials
  materialMovements: typeof initialMaterialMovements
  suppliers: typeof initialSuppliers
  supplierLedger: typeof initialSupplierLedger
  employees: typeof initialEmployees
  employeeLedger: typeof initialEmployeeLedger
  productionOrders: typeof initialProductionOrders
  productionEntries: typeof initialProductionEntries
  finishedGoodsStock: typeof initialFinishedGoodsStock
  inventoryMovements: typeof initialInventoryMovements
  shopkeepers: typeof initialShopkeepers
  shopkeeperDeliveries: typeof initialShopkeeperDeliveries
  shopkeeperPayments: typeof initialShopkeeperPayments
  shopkeeperReturns: typeof initialShopkeeperReturns
  shopkeeperLedger: typeof initialShopkeeperLedger
  customers: typeof initialCustomers
  customerLedger: typeof initialCustomerLedger
  sales: typeof initialSales
  payments: typeof initialPayments
  expenses: typeof initialExpenses
  payroll: typeof initialPayroll
  ledgerEntries?: LedgerEntry[]
}

export function getFreshSeedData(): SeedDatabase {
  const data: SeedDatabase = JSON.parse(
    JSON.stringify({
      version: '1.0.0',
      categories: [...DEFAULT_PRODUCT_CATEGORIES],
      productSizes: [...DEFAULT_PRODUCT_SIZES],
      categoryItems: INITIAL_CATEGORY_ITEMS,
      sizeItems: INITIAL_SIZE_ITEMS,
      colorItems: INITIAL_COLOR_ITEMS,
      products: initialProducts,
      materials: initialMaterials,
      materialMovements: initialMaterialMovements,
      suppliers: initialSuppliers,
      supplierLedger: initialSupplierLedger,
      employees: initialEmployees,
      employeeLedger: initialEmployeeLedger,
      productionOrders: initialProductionOrders,
      productionEntries: initialProductionEntries,
      finishedGoodsStock: initialFinishedGoodsStock,
      inventoryMovements: initialInventoryMovements,
      shopkeepers: initialShopkeepers,
      shopkeeperDeliveries: initialShopkeeperDeliveries,
      shopkeeperPayments: initialShopkeeperPayments,
      shopkeeperReturns: initialShopkeeperReturns,
      shopkeeperLedger: initialShopkeeperLedger,
      customers: initialCustomers,
      customerLedger: initialCustomerLedger,
      sales: initialSales,
      payments: initialPayments,
      expenses: initialExpenses,
      payroll: initialPayroll,
    })
  )

  // Ensure current day & current month sales exist for real-time dashboard responsiveness
  const today = new Date().toISOString().split('T')[0]
  if (data.sales && data.sales.length > 0) {
    data.sales[0].date = today
  }
  const skDeliveries = Object.values(data.shopkeeperDeliveries || {}).flat()
  if (skDeliveries.length > 0) {
    skDeliveries[0].date = today
  }

  return data
}
