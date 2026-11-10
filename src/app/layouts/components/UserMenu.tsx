import React from 'react'
import { Link } from 'react-router-dom'
import { User, Settings, Sparkles, LogOut, ShieldCheck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

export function UserMenu(): React.JSX.Element {
  const handleLogoutDemo = () => {
    toast.info('Session reset: In frontend demo mode, active state remains in local storage.', {
      description: 'You can use "Reset Demo Data" on the dashboard to restore the initial database.',
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="User account menu"
          className="flex items-center gap-2 pl-2 border-l border-border focus:outline-none cursor-pointer group"
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20 group-hover:bg-primary/20 transition-colors">
            JA
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold leading-none text-foreground group-hover:text-primary transition-colors">
              Jowel Ahmed
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Admin / Owner</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 shadow-lg">
        <DropdownMenuLabel className="p-3">
          <div className="font-semibold text-sm text-foreground">Jowel Ahmed</div>
          <div className="text-xs text-muted-foreground">jowel@aparajitagarments.com</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Administrator Access</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/settings" className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Profile & Factory Info</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>Preferences & Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/subscription" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <span>SaaS Plan & Billing</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogoutDemo}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Demo Session Info</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
