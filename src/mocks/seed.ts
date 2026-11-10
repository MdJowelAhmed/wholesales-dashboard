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
import {
  initialCustomers,
  initialCustomerLedger,
  initialExpenses,
  initialPayments,
  initialPayroll,
  initialSales,
} from './data/customersAndFinance.data'

export interface SeedDatabase {
  version: string
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
}

export function getFreshSeedData(): SeedDatabase {
  return JSON.parse(
    JSON.stringify({
      version: '1.0.0',
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
}
