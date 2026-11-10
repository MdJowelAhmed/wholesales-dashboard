import { useState, Suspense } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GlobalSearchDialog } from './components/GlobalSearchDialog'
import { AppHeader } from './components/AppHeader'
import { AppSidebar } from './components/AppSidebar'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary/ErrorBoundary'
import { LoadingState } from '@/components/shared/StateFeedbacks'
import { allNavItems } from './navigationConfig'

export function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname

  const currentNav = allNavItems.find((item) =>
    item.href === '/' ? currentPath === '/' : currentPath.startsWith(item.href)
  )

  return (
    <TooltipProvider delayDuration={150}>
      <div className="h-screen flex flex-col overflow-hidden bg-background selection:bg-primary/20">
        {/* Global Search Dialog Modal */}
        <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

        {/* Top Header */}
        <AppHeader onOpenSearch={() => setSearchOpen(true)} />

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Desktop & Mobile Navigation Sidebar */}
          <AppSidebar currentPath={currentPath} />

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
