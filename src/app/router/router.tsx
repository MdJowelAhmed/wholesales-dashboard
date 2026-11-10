import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/app/layouts/AppLayout'

// Route-level code splitting via dynamic imports
const DashboardOverviewPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardOverviewPage').then((m) => ({
    default: m.DashboardOverviewPage,
  }))
)
const ProductsListPage = lazy(() =>
  import('@/features/products/pages/ProductsListPage').then((m) => ({
    default: m.ProductsListPage,
  }))
)
const ProductDetailsPage = lazy(() =>
  import('@/features/products/pages/ProductDetailsPage').then((m) => ({
    default: m.ProductDetailsPage,
  }))
)
const RawMaterialsListPage = lazy(() =>
  import('@/features/raw-materials/pages/RawMaterialsListPage').then((m) => ({
    default: m.RawMaterialsListPage,
  }))
)
const SuppliersListPage = lazy(() =>
  import('@/features/suppliers/pages/SuppliersListPage').then((m) => ({
    default: m.SuppliersListPage,
  }))
)
const SupplierDetailsPage = lazy(() =>
  import('@/features/suppliers/pages/SupplierDetailsPage').then((m) => ({
    default: m.SupplierDetailsPage,
  }))
)
const EmployeesListPage = lazy(() =>
  import('@/features/employees/pages/EmployeesListPage').then((m) => ({
    default: m.EmployeesListPage,
  }))
)
const EmployeeDetailsPage = lazy(() =>
  import('@/features/employees/pages/EmployeeDetailsPage').then((m) => ({
    default: m.EmployeeDetailsPage,
  }))
)
const ShopkeepersListPage = lazy(() =>
  import('@/features/shopkeepers/pages/ShopkeepersListPage').then((m) => ({
    default: m.ShopkeepersListPage,
  }))
)
const ShopkeeperDetailsPage = lazy(() =>
  import('@/features/shopkeepers/pages/ShopkeeperDetailsPage').then((m) => ({
    default: m.ShopkeeperDetailsPage,
  }))
)
const CustomersListPage = lazy(() =>
  import('@/features/customers/pages/CustomersListPage').then((m) => ({
    default: m.CustomersListPage,
  }))
)
const CustomerDetailsPage = lazy(() =>
  import('@/features/customers/pages/CustomerDetailsPage').then((m) => ({
    default: m.CustomerDetailsPage,
  }))
)
const ProductionDashboardPage = lazy(() =>
  import('@/features/production/pages/ProductionDashboardPage').then((m) => ({
    default: m.ProductionDashboardPage,
  }))
)
const InventoryManagementPage = lazy(() =>
  import('@/features/inventory/pages/InventoryManagementPage').then((m) => ({
    default: m.InventoryManagementPage,
  }))
)
const SalesListPage = lazy(() =>
  import('@/features/sales/pages/SalesListPage').then((m) => ({
    default: m.SalesListPage,
  }))
)
const SaleDetailsPage = lazy(() =>
  import('@/features/sales/pages/SaleDetailsPage').then((m) => ({
    default: m.SaleDetailsPage,
  }))
)
const DeliveriesListPage = lazy(() =>
  import('@/features/deliveries/pages/DeliveriesListPage').then((m) => ({
    default: m.DeliveriesListPage,
  }))
)
const ReturnsListPage = lazy(() =>
  import('@/features/returns/pages/ReturnsListPage').then((m) => ({
    default: m.ReturnsListPage,
  }))
)
const PaymentsListPage = lazy(() =>
  import('@/features/payments/pages/PaymentsListPage').then((m) => ({
    default: m.PaymentsListPage,
  }))
)
const PayrollListPage = lazy(() =>
  import('@/features/payroll/pages/PayrollListPage').then((m) => ({
    default: m.PayrollListPage,
  }))
)
const ExpensesListPage = lazy(() =>
  import('@/features/expenses/pages/ExpensesListPage').then((m) => ({
    default: m.ExpensesListPage,
  }))
)
const ReportsPage = lazy(() =>
  import('@/features/reports/pages/ReportsPage').then((m) => ({
    default: m.ReportsPage,
  }))
)
const SettingsPage = lazy(() =>
  import('@/features/settings/pages/SettingsPage').then((m) => ({
    default: m.SettingsPage,
  }))
)
const SubscriptionPage = lazy(() =>
  import('@/features/subscription/pages/SubscriptionPage').then((m) => ({
    default: m.SubscriptionPage,
  }))
)
const NotFoundPage = lazy(() =>
  import('@/features/common/NotFoundPage').then((m) => ({
    default: m.NotFoundPage,
  }))
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardOverviewPage />,
      },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: <ProductsListPage />,
          },
          {
            path: ':id',
            element: <ProductDetailsPage />,
          },
        ],
      },
      {
        path: 'raw-materials',
        children: [
          {
            index: true,
            element: <RawMaterialsListPage />,
          },
        ],
      },
      {
        path: 'suppliers',
        children: [
          {
            index: true,
            element: <SuppliersListPage />,
          },
          {
            path: ':id',
            element: <SupplierDetailsPage />,
          },
        ],
      },
      {
        path: 'production',
        children: [
          {
            index: true,
            element: <ProductionDashboardPage />,
          },
        ],
      },
      {
        path: 'inventory',
        children: [
          {
            index: true,
            element: <InventoryManagementPage />,
          },
        ],
      },
      {
        path: 'employees',
        children: [
          {
            index: true,
            element: <EmployeesListPage />,
          },
          {
            path: ':id',
            element: <EmployeeDetailsPage />,
          },
        ],
      },
      {
        path: 'shopkeepers',
        children: [
          {
            index: true,
            element: <ShopkeepersListPage />,
          },
          {
            path: ':id',
            element: <ShopkeeperDetailsPage />,
          },
        ],
      },
      {
        path: 'customers',
        children: [
          {
            index: true,
            element: <CustomersListPage />,
          },
          {
            path: ':id',
            element: <CustomerDetailsPage />,
          },
        ],
      },
      {
        path: 'sales',
        children: [
          {
            index: true,
            element: <SalesListPage />,
          },
          {
            path: ':id',
            element: <SaleDetailsPage />,
          },
        ],
      },
      {
        path: 'deliveries',
        children: [
          {
            index: true,
            element: <DeliveriesListPage />,
          },
        ],
      },
      {
        path: 'returns',
        children: [
          {
            index: true,
            element: <ReturnsListPage />,
          },
        ],
      },
      {
        path: 'payments',
        children: [
          {
            index: true,
            element: <PaymentsListPage />,
          },
        ],
      },
      {
        path: 'payroll',
        children: [
          {
            index: true,
            element: <PayrollListPage />,
          },
        ],
      },
      {
        path: 'expenses',
        children: [
          {
            index: true,
            element: <ExpensesListPage />,
          },
        ],
      },
      {
        path: 'reports',
        children: [
          {
            index: true,
            element: <ReportsPage />,
          },
        ],
      },
      {
        path: 'settings',
        children: [
          {
            index: true,
            element: <SettingsPage />,
          },
        ],
      },
      {
        path: 'subscription',
        children: [
          {
            index: true,
            element: <SubscriptionPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
