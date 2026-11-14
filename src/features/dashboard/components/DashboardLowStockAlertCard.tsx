import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Product } from '@/types/products'

interface DashboardLowStockAlertCardProps {
  lowStockProducts: Product[]
}

export function DashboardLowStockAlertCard({
  lowStockProducts,
}: DashboardLowStockAlertCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <CardTitle className="text-base text-foreground">Finished Goods Low Stock Alert</CardTitle>
        </div>
        <CardDescription>
          Products with variant stocks below safe threshold (50 pcs).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lowStockProducts.length === 0 ? (
          <p className="text-xs text-muted-foreground">All finished stock levels are optimal.</p>
        ) : (
          <div className="space-y-3">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-md bg-muted/40 text-xs border border-border"
              >
                <div>
                  <div className="font-semibold text-foreground">{p.name}</div>
                  <div className="text-muted-foreground font-mono">{p.code}</div>
                </div>
                <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                  <Link to="/production">Issue Job Order</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}