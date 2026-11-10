import React, { useState, Suspense } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
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
  Menu,
  X,
  Sun,
  Moon,
  Laptop,
  Building2,
  Search,
  ChevronRight,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import {
  toggleSidebar,
  toggleMobileMenu,
  setMobileMenuOpen,
  setActiveBusiness,
} from '@/app/store/slices/uiSlice'
import { setThemeMode } from '@/app/store/slices/themeSlice'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { GlobalSearchDialog } from './components/GlobalSearchDialog'
import { NotificationMenu } from './components/NotificationMenu'
import { UserMenu } from './components/UserMenu'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary/ErrorBoundary'
import { LoadingState } from '@/components/shared/StateFeedbacks'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'Core Master Data',
    items: [
      { name: 'Overview', href: '/', icon: LayoutDashboard },
      { name: 'Products', href: '/products', icon: Shirt },
      { name: 'Raw Materials', href: '/raw-materials', icon: Layers },
      { name: 'Suppliers', href: '/suppliers', icon: Truck },
    ],
  },
  {
    title: 'Manufacturing & Partners',
    items: [
      { name: 'Production', href: '/production', icon: Factory },
      { name: 'Inventory', href: '/inventory', icon: Package },
      { name: 'Employees', href: '/employees', icon: Users },
      { name: 'Shopkeepers', href: '/shopkeepers', icon: Store, badge: 'Wholesale' },
      { name: 'Customers', href: '/customers', icon: UserCheck },
    ],
  },
  {
    title: 'Commerce & Orders',
    items: [
      { name: 'Sales', href: '/sales', icon: ShoppingBag },
      { name: 'Deliveries', href: '/deliveries', icon: Truck, badge: 'Challan' },
      { name: 'Returns', href: '/returns', icon: RotateCcw },
      { name: 'Payments', href: '/payments', icon: CreditCard },
    ],
  },
  {
    title: 'Finance & System',
    items: [
      { name: 'Payroll', href: '/payroll', icon: Banknote },
      { name: 'Expenses', href: '/expenses', icon: Receipt },
      { name: 'Reports', href: '/reports', icon: BarChart3 },
      { name: 'Settings', href: '/settings', icon: Settings },
      { name: 'Subscription', href: '/subscription', icon: Sparkles },
    ],
  },
]

const allNavItems = navSections.flatMap((s) => s.items)

export function AppLayout(): React.JSX.Element {
  const [searchOpen, setSearchOpen] = useState(false)
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { sidebarCollapsed, mobileMenuOpen, activeBusiness, availableBusinesses } =
    useAppSelector((state) => state.ui)
  const { mode } = useAppSelector((state) => state.theme)

  const currentPath = location.pathname
  const currentNav = allNavItems.find((item) =>
    item.href === '/' ? currentPath === '/' : currentPath.startsWith(item.href)
  )

  const toggleThemeHandler = () => {
    if (mode === 'light') dispatch(setThemeMode('dark'))
    else if (mode === 'dark') dispatch(setThemeMode('system'))
    else dispatch(setThemeMode('light'))
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="h-screen flex flex-col overflow-hidden bg-background selection:bg-primary/20">
        {/* Global Search Dialog Modal */}
        <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

        {/* Top Header */}
        <header className="flex-shrink-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
          <div className="flex h-16 items-center px-4 md:px-6 justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => dispatch(toggleMobileMenu())}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* Desktop Sidebar Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex"
                onClick={() => dispatch(toggleSidebar())}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Brand Logo & Name */}
              <Link
                to="/"
                className="flex items-center gap-2.5 font-bold text-foreground tracking-tight"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Shirt className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold leading-none">Aparajita ERP</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5 font-medium">
                    Garments & Wholesale
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Global Quick Search Button */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md border border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-3.5 w-3.5" />
                  <span>Search products, wholesale shops, orders...</span>
                </div>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span>Ctrl</span>K
                </kbd>
              </button>
            </div>

            {/* Right: Business Switcher, Notifications, Theme, User */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Business Branch Switcher UI */}
              <div className="hidden sm:flex items-center gap-2 border border-border rounded-md px-2.5 py-1.5 bg-background text-xs">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  aria-label="Select business branch"
                  value={activeBusiness.id}
                  onChange={(e) => dispatch(setActiveBusiness(e.target.value))}
                  className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer pr-1"
                >
                  {availableBusinesses.map((biz) => (
                    <option
                      key={biz.id}
                      value={biz.id}
                      className="bg-popover text-popover-foreground"
                    >
                      {biz.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notifications Menu */}
              <NotificationMenu />

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleThemeHandler}
                aria-label={`Toggle theme: currently ${mode}`}
                title={`Theme: ${mode} mode (click to cycle)`}
              >
                {mode === 'light' ? (
                  <Sun className="h-4 w-4" />
                ) : mode === 'dark' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Laptop className="h-4 w-4" />
                )}
              </Button>

              {/* User Profile Dropdown */}
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Desktop Collapsible Sidebar */}
          <aside
            className={cn(
              'hidden md:flex flex-col flex-shrink-0 h-full border-r border-border bg-card transition-all duration-300 overflow-hidden',
              sidebarCollapsed ? 'w-16' : 'w-64'
            )}
          >
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain py-4 px-2 space-y-5">
              {navSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  {!sidebarCollapsed && (
                    <div className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      {section.title}
                    </div>
                  )}

                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive =
                      item.href === '/'
                        ? currentPath === '/'
                        : currentPath.startsWith(item.href)

                    const linkContent = (
                      <NavLink
                        to={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {!sidebarCollapsed && (
                          <div className="flex items-center justify-between flex-1 min-w-0">
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span
                                className={cn(
                                  'text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase',
                                  isActive
                                    ? 'bg-primary-foreground text-primary'
                                    : 'bg-muted text-muted-foreground'
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </NavLink>
                    )

                    if (sidebarCollapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                          <TooltipContent side="right">
                            <span className="font-medium">{item.name}</span>
                            {item.badge && (
                              <span className="ml-1.5 text-[10px] text-muted-foreground">
                                ({item.badge})
                              </span>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      )
                    }

                    return <div key={item.href}>{linkContent}</div>
                  })}
                </div>
              ))}
            </div>

            {/* Prototype Indicator Footer */}
            {!sidebarCollapsed && (
              <div className="flex-shrink-0 p-3 m-2 rounded-md border border-border bg-muted/40 text-[11px] text-muted-foreground">
                <p className="font-semibold text-foreground">Frontend-Only Mode</p>
                <p className="mt-0.5">Mock database active with local storage sync.</p>
              </div>
            )}
          </aside>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden bg-background/80 backdrop-blur-sm animate-in fade-in-0">
              <div className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border p-4 shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2.5 font-bold text-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Shirt className="h-4 w-4" />
                    </div>
                    <span>Aparajita ERP</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dispatch(setMobileMenuOpen(false))}
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                  {navSections.map((section) => (
                    <div key={section.title} className="space-y-1">
                      <div className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        {section.title}
                      </div>
                      {section.items.map((item) => {
                        const Icon = item.icon
                        const isActive =
                          item.href === '/'
                            ? currentPath === '/'
                            : currentPath.startsWith(item.href)

                        return (
                          <NavLink
                            key={item.href}
                            to={item.href}
                            onClick={() => dispatch(setMobileMenuOpen(false))}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="flex-1">{item.name}</span>
                            {item.badge && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase bg-muted text-muted-foreground">
                                {item.badge}
                              </span>
                            )}
                          </NavLink>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-background overflow-y-auto overscroll-y-contain">
            {/* Dynamic Breadcrumbs */}
            <nav
              aria-label="Breadcrumbs"
              className="sticky top-0 z-10 flex-shrink-0 px-4 md:px-6 py-2.5 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Link to="/" className="hover:text-foreground transition-colors font-medium">
                Home
              </Link>
              {currentNav && currentNav.href !== '/' && (
                <>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
                  <span className="font-semibold text-foreground">{currentNav.name}</span>
                </>
              )}
            </nav>

            <div className="p-4 md:p-6 lg:p-8 flex-1">
              <ErrorBoundary>
                <Suspense fallback={<LoadingState message="Loading module..." />}>
                  <Outlet />
                </Suspense>
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
