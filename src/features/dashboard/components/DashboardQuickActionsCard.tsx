import React from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Layers, RotateCcw, Truck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function DashboardQuickActionsCard(): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick Master Actions</CardTitle>
        <CardDescription>Standard everyday garments workflow entries.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <Button variant="outline" asChild className="h-12 justify-start px-3">
            <Link to="/deliveries" className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Dispatch Delivery</div>
                <div className="text-[10px] text-muted-foreground">Challan generation</div>
              </div>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-12 justify-start px-3">
            <Link to="/payments" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Record Payment</div>
                <div className="text-[10px] text-muted-foreground">bKash/Cash/Bank</div>
              </div>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-12 justify-start px-3">
            <Link to="/raw-materials" className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Stock In Fabric</div>
                <div className="text-[10px] text-muted-foreground">Raw store addition</div>
              </div>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-12 justify-start px-3">
            <Link to="/returns" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Customer Return</div>
                <div className="text-[10px] text-muted-foreground">Credit adjustments</div>
              </div>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}