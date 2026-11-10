import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Shirt,
  Store,
  Truck,
  ShoppingBag,
  Users,
  Factory,
  ArrowRight,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface SearchItem {
  id: string
  title: string
  subtitle: string
  category: 'Products' | 'Shopkeepers' | 'Suppliers' | 'Sales' | 'Employees' | 'Production'
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const mockSearchItems: SearchItem[] = [
  {
    id: 's-1',
    title: "Boys' Pique Polo Shirt (BPS-101)",
    subtitle: 'Sizes 18, 20, 22 — BDT 280-320/pc',
    category: 'Products',
    href: '/products',
    icon: Shirt,
  },
  {
    id: 's-2',
    title: "Girls' Embroidered Party Frock (GPF-204)",
    subtitle: 'Sizes 18, 20, 22 — Soft net inner lining',
    category: 'Products',
    href: '/products',
    icon: Shirt,
  },
  {
    id: 's-3',
    title: 'Haji Garments Wholesale',
    subtitle: 'Islampur Market — Outstanding Due: ৳38,000',
    category: 'Shopkeepers',
    href: '/shopkeepers/sk-001',
    icon: Store,
  },
  {
    id: 's-4',
    title: 'Bhai Bhai Cloth Store (Consignment)',
    subtitle: 'East Aganagar, Keraniganj — 110 pcs held',
    category: 'Shopkeepers',
    href: '/shopkeepers/sk-002',
    icon: Store,
  },
  {
    id: 's-5',
    title: 'Square Textiles Ltd.',
    subtitle: 'Kashimpur, Gazipur — Payable: ৳57,600',
    category: 'Suppliers',
    href: '/suppliers/sup-001',
    icon: Truck,
  },
  {
    id: 's-6',
    title: 'Sultana Begum (EMP-OPR-04)',
    subtitle: 'Senior Sewing Operator — Piece rate ৳18/pc',
    category: 'Employees',
    href: '/employees/emp-002',
    icon: Users,
  },
  {
    id: 's-7',
    title: 'Sales Invoice INV-2026-089',
    subtitle: 'Kids Club Boutique (Uttara) — 100 pcs Boys Polo',
    category: 'Sales',
    href: '/sales',
    icon: ShoppingBag,
  },
  {
    id: 's-8',
    title: 'Production Order PO-2026-BPS',
    subtitle: 'Cutting & Sewing Floor — 930/1000 pcs completed',
    category: 'Production',
    href: '/production',
    icon: Factory,
  },
]

interface GlobalSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearchDialog({
  open,
  onOpenChange,
}: GlobalSearchDialogProps): React.JSX.Element {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  const filtered = query.trim()
    ? mockSearchItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : mockSearchItems.slice(0, 5)

  const handleSelect = (href: string) => {
    onOpenChange(false)
    setQuery('')
    navigate(href)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="sr-only">Global Search</DialogTitle>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, wholesale shops, suppliers, orders... (Ctrl+K)"
              className="border-0 shadow-none focus-visible:ring-0 px-1 text-sm bg-transparent"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="max-h-[360px] overflow-y-auto p-2 divide-y divide-border/50">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No matching records found for "{query}"
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between p-2.5 rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-secondary text-secondary-foreground flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </div>
                      <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {item.category}
                    </Badge>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              )
            })
          )}
        </div>

        <div className="p-3 border-t border-border bg-muted/30 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Tip: Navigate with mouse or click to open</span>
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-background font-mono text-[10px]">
            ESC to close
          </kbd>
        </div>
      </DialogContent>
    </Dialog>
  )
}
