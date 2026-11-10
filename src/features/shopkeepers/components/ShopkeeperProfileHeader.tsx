import React from 'react'
import { Phone, MapPin, Store } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Shopkeeper } from '@/types/shopkeepers'

interface ShopkeeperProfileHeaderProps {
  shopkeeper: Shopkeeper
}

export function ShopkeeperProfileHeader({ shopkeeper }: ShopkeeperProfileHeaderProps): React.JSX.Element {
  return (
    <Card>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">{shopkeeper.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{shopkeeper.address}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Store className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">{shopkeeper.marketName}</span>
        </div>
      </CardContent>
    </Card>
  )
}

