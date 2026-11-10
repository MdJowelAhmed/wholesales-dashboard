import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/app/layouts/AppLayout'
import {
  DashboardOverviewPage,
  ProductsListPage,
  ProductDetailsPage,
  RawMaterialsListPage,
  SuppliersListPage,
  SupplierDetailsPage,
  EmployeesListPage,
  EmployeeDetailsPage,
  ShopkeepersListPage,
  ShopkeeperDetailsPage,
  CustomersListPage,
  CustomerDetailsPage,
  ProductionDashboardPage,
  InventoryManagementPage,
  SalesListPage,
  SaleDetailsPage,
  DeliveriesListPage,
  ReturnsListPage,
  PaymentsListPage,
  PayrollListPage,
  ExpensesListPage,
  ReportsPage,
  SettingsPage,
  SubscriptionPage,
  NotFoundPage,
} from './lazyRoutes'

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
