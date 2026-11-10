import { Link } from 'react-router-dom'
import {
  Shirt,
  Menu,
  X,
  Sun,
  Moon,
  Laptop,
  Building2,
  Search,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import {
  toggleSidebar,
  toggleMobileMenu,
  setActiveBusiness,
} from '@/app/store/slices/uiSlice'
import { setThemeMode } from '@/app/store/slices/themeSlice'
import { Button } from '@/components/ui/button'
import { NotificationMenu } from './NotificationMenu'
import { UserMenu } from './UserMenu'

interface AppHeaderProps {
  onOpenSearch: () => void
}

export function AppHeader({ onOpenSearch }: AppHeaderProps) {
  const dispatch = useAppDispatch()
  const { sidebarCollapsed, mobileMenuOpen, activeBusiness, availableBusinesses } =
    useAppSelector((state) => state.ui)
  const { mode } = useAppSelector((state) => state.theme)

  const toggleThemeHandler = () => {
    if (mode === 'light') dispatch(setThemeMode('dark'))
    else if (mode === 'dark') dispatch(setThemeMode('system'))
    else dispatch(setThemeMode('light'))
  }

  return (
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
            onClick={onOpenSearch}
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
            onClick={onOpenSearch}
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
  )
}

