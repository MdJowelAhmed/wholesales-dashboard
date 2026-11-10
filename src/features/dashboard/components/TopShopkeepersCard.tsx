import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shopkeeper } from '@/types/shopkeepers'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface TopShopkeepersCardProps {
  shopkeepers: Shopkeeper[]
}

export function TopShopkeepersCard({ shopkeepers }: TopShopkeepersCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Wholesale Shopkeepers</CardTitle>
          <CardDescription>Major market accounts & credit status</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/shopkeepers" className="flex items-center gap-1 text-xs">
            View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {shopkeepers.map((sk) => (
          <div
            key={sk.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/60 hover:border-primary/40 transition-colors"
          >
            <div>
              <Link
                to={`/shopkeepers/${sk.id}`}
                className="font-semibold text-sm text-foreground hover:underline"
              >
                {sk.shopName}
              </Link>
              <p className="text-xs text-muted-foreground mt-0.5">{sk.marketName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-foreground">
                {formatBDT(sk.outstandingBalance)}
              </p>
              <span className="text-[10px] text-muted-foreground uppercase">Due</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

