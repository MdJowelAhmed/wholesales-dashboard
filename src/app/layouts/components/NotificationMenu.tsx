import React, { useState } from 'react'
import { Bell, CheckCheck, AlertTriangle, Package, DollarSign, Clock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: 'stock' | 'payment' | 'production' | 'consignment'
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Low Stock Alert',
    description: 'Cotton Lycra 1x1 Rib (Navy) is at 80 kg (below 100 kg threshold).',
    time: '25m ago',
    read: false,
    type: 'stock',
  },
  {
    id: 'notif-2',
    title: 'Consignment Follow-up',
    description: 'Bhai Bhai Cloth Store holds 110 consignment pieces since Sept 15.',
    time: '2h ago',
    read: false,
    type: 'consignment',
  },
  {
    id: 'notif-3',
    title: 'Production QC Pending',
    description: '80 pcs Kids Stretch Denim Jogger (var-305-22) awaiting final QC sign-off.',
    time: '4h ago',
    read: false,
    type: 'production',
  },
  {
    id: 'notif-4',
    title: 'Supplier Balance Notice',
    description: '৳57,600 payable to Square Textiles Ltd. scheduled for settlement.',
    time: '1d ago',
    read: false,
    type: 'payment',
  },
]

export function NotificationMenu(): React.JSX.Element {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markItemRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative cursor-pointer"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 shadow-lg">
        <DropdownMenuLabel className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="h-3 w-3" /> Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <div className="max-h-[320px] overflow-y-auto divide-y divide-border/50">
          {notifications.map((item) => {
            const Icon =
              item.type === 'stock'
                ? AlertTriangle
                : item.type === 'consignment'
                ? Package
                : item.type === 'production'
                ? Clock
                : DollarSign

            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => markItemRead(item.id)}
                className={`p-3 flex items-start gap-3 cursor-pointer ${
                  !item.read ? 'bg-primary/5 font-medium' : 'opacity-80'
                }`}
              >
                <div
                  className={`p-1.5 rounded-md mt-0.5 ${
                    item.type === 'stock'
                      ? 'bg-status-pending/15 text-status-pending-foreground dark:text-status-pending'
                      : item.type === 'payment'
                      ? 'bg-status-overdue/15 text-status-overdue-foreground dark:text-status-overdue'
                      : 'bg-primary/15 text-primary'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>{item.title}</span>
                    <span className="text-[10px] font-normal text-muted-foreground">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </DropdownMenuItem>
            )
          })}
        </div>
        <DropdownMenuSeparator />
        <div className="p-2 text-center">
          <span className="text-[11px] text-muted-foreground">
            Factory activity alerts automatically update from production & inventory logs.
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
