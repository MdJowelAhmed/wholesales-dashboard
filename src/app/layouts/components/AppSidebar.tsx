import { NavLink } from 'react-router-dom'
import { Shirt, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { setMobileMenuOpen } from '@/app/store/slices/uiSlice'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { navSections } from '../navigationConfig'

interface AppSidebarProps {
  currentPath: string
}

export function AppSidebar({ currentPath }: AppSidebarProps) {
  const dispatch = useAppDispatch()
  const { sidebarCollapsed, mobileMenuOpen } = useAppSelector((state) => state.ui)

  return (
    <>
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
    </>
  )
}

