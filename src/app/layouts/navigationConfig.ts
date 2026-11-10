import React from 'react'
import {
  LayoutDashboard,
  Shirt,
  Layers,
  Truck,
  Factory,
  Package,
  Users,
  Store,
  UserCheck,
  ShoppingBag,
  RotateCcw,
  CreditCard,
  Banknote,
  Receipt,
  BarChart3,
  Settings,
  Sparkles,
  Sliders,
} from 'lucide-react'

export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    title: 'Core Master Data',
    items: [
      { name: 'Overview', href: '/', icon: LayoutDashboard },
      { name: 'Products', href: '/products', icon: Shirt },
      { name: 'Variants', href: '/variants', icon: Sliders },
      { name: 'Raw Materials', href: '/raw-materials', icon: Layers },
      { name: 'Suppliers', href: '/suppliers', icon: Truck },
      { name: 'Workers & Staff', href: '/employees', icon: Users },
      { name: 'Wholesale Shopkeepers', href: '/shopkeepers', icon: Store },
      { name: 'Retail Customers', href: '/customers', icon: UserCheck },
    ],
  },
  {
    title: 'Manufacturing & Partners',
    items: [
      { name: 'Production Orders', href: '/production', icon: Factory },
      { name: 'Finished Inventory', href: '/inventory', icon: Package },
      { name: 'Wholesale Deliveries', href: '/deliveries', icon: Truck },
    ],
  },
  {
    title: 'Commerce & Orders',
    items: [
      { name: 'Sales & Invoicing', href: '/sales', icon: ShoppingBag },
      { name: 'Returns & Credit', href: '/returns', icon: RotateCcw },
      { name: 'Payments & Ledger', href: '/payments', icon: CreditCard },
      { name: 'Worker Payroll', href: '/payroll', icon: Banknote },
      { name: 'Factory Expenses', href: '/expenses', icon: Receipt },
    ],
  },
  {
    title: 'Finance & System',
    items: [
      { name: 'Executive Reports', href: '/reports', icon: BarChart3 },
      { name: 'SaaS Subscription', href: '/subscription', icon: Sparkles, badge: 'Active' },
      { name: 'System Settings', href: '/settings', icon: Settings },
    ],
  },
]

export const allNavItems = navSections.flatMap((s) => s.items)
