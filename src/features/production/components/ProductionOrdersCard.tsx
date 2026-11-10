import React from 'react'
import { Factory } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge/StatusBadge'
import { ProductionOrder } from '@/types/production'

interface ProductionOrdersCardProps {
  orders: ProductionOrder[]
}

export function ProductionOrdersCard({ orders }: ProductionOrdersCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Factory className="h-4 w-4 text-primary" />
              Active Cutting & Sewing Orders
            </CardTitle>
            <CardDescription>
              Progress towards batch target quantity in finished pieces
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {orders.map((order) => {
            const target = order.targetQuantityPieces || 1
            const progress = Math.min(
              100,
              Math.round(((order.completedPieces ?? 0) / target) * 100)
            )
            return (
              <div
                key={order.id}
                className="p-4 rounded-lg border border-border bg-card/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">
                    {order.orderCode}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                    {order.productName}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Due: {order.dueDate}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress:</span>
                    <span className="font-mono font-bold text-foreground">
                      {order.completedPieces} / {order.targetQuantityPieces} pcs ({progress}%)
                    </span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

