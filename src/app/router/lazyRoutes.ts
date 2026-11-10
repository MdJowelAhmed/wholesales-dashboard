import { lazy } from 'react'

export const DashboardOverviewPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardOverviewPage').then((m) => ({
    default: m.DashboardOverviewPage,
  }))
)

export const ProductsListPage = lazy(() =>
  import('@/features/products/pages/ProductsListPage').then((m) => ({
    default: m.ProductsListPage,
  }))
)

export const VariantsPage = lazy(() =>
  import('@/features/variants/pages/VariantsPage').then((m) => ({
    default: m.VariantsPage,
  }))
)

export const ProductDetailsPage = lazy(() =>
  import('@/features/products/pages/ProductDetailsPage').then((m) => ({
    default: m.ProductDetailsPage,
  }))
)

export const RawMaterialsListPage = lazy(() =>
  import('@/features/raw-materials/pages/RawMaterialsListPage').then((m) => ({
    default: m.RawMaterialsListPage,
  }))
)

export const SuppliersListPage = lazy(() =>
  import('@/features/suppliers/pages/SuppliersListPage').then((m) => ({
    default: m.SuppliersListPage,
  }))
)

export const SupplierDetailsPage = lazy(() =>
  import('@/features/suppliers/pages/SupplierDetailsPage').then((m) => ({
    default: m.SupplierDetailsPage,
  }))
)

export const EmployeesListPage = lazy(() =>
  import('@/features/employees/pages/EmployeesListPage').then((m) => ({
    default: m.EmployeesListPage,
  }))
)

export const EmployeeDetailsPage = lazy(() =>
  import('@/features/employees/pages/EmployeeDetailsPage').then((m) => ({
    default: m.EmployeeDetailsPage,
  }))
)

export const ShopkeepersListPage = lazy(() =>
  import('@/features/shopkeepers/pages/ShopkeepersListPage').then((m) => ({
    default: m.ShopkeepersListPage,
  }))
)

export const ShopkeeperDetailsPage = lazy(() =>
  import('@/features/shopkeepers/pages/ShopkeeperDetailsPage').then((m) => ({
    default: m.ShopkeeperDetailsPage,
  }))
)

export const CustomersListPage = lazy(() =>
  import('@/features/customers/pages/CustomersListPage').then((m) => ({
    default: m.CustomersListPage,
  }))
)

export const CustomerDetailsPage = lazy(() =>
  import('@/features/customers/pages/CustomerDetailsPage').then((m) => ({
    default: m.CustomerDetailsPage,
  }))
)

export const ProductionDashboardPage = lazy(() =>
  import('@/features/production/pages/ProductionDashboardPage').then((m) => ({
    default: m.ProductionDashboardPage,
  }))
)

export const InventoryManagementPage = lazy(() =>
  import('@/features/inventory/pages/InventoryManagementPage').then((m) => ({
    default: m.InventoryManagementPage,
  }))
)

export const SalesListPage = lazy(() =>
  import('@/features/sales/pages/SalesListPage').then((m) => ({
    default: m.SalesListPage,
  }))
)

export const SaleDetailsPage = lazy(() =>
  import('@/features/sales/pages/SaleDetailsPage').then((m) => ({
    default: m.SaleDetailsPage,
  }))
)

export const DeliveriesListPage = lazy(() =>
  import('@/features/deliveries/pages/DeliveriesListPage').then((m) => ({
    default: m.DeliveriesListPage,
  }))
)

export const ReturnsListPage = lazy(() =>
  import('@/features/returns/pages/ReturnsListPage').then((m) => ({
    default: m.ReturnsListPage,
  }))
)

export const PaymentsListPage = lazy(() =>
  import('@/features/payments/pages/PaymentsListPage').then((m) => ({
    default: m.PaymentsListPage,
  }))
)

export const PayrollListPage = lazy(() =>
  import('@/features/payroll/pages/PayrollListPage').then((m) => ({
    default: m.PayrollListPage,
  }))
)

export const ExpensesListPage = lazy(() =>
  import('@/features/expenses/pages/ExpensesListPage').then((m) => ({
    default: m.ExpensesListPage,
  }))
)

export const ReportsPage = lazy(() =>
  import('@/features/reports/pages/ReportsPage').then((m) => ({
    default: m.ReportsPage,
  }))
)

export const SettingsPage = lazy(() =>
  import('@/features/settings/pages/SettingsPage').then((m) => ({
    default: m.SettingsPage,
  }))
)

export const SubscriptionPage = lazy(() =>
  import('@/features/subscription/pages/SubscriptionPage').then((m) => ({
    default: m.SubscriptionPage,
  }))
)

export const NotFoundPage = lazy(() =>
  import('@/features/common/NotFoundPage').then((m) => ({
    default: m.NotFoundPage,
  }))
)

