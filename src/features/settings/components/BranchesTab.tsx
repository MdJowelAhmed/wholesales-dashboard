import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const FACILITIES = [
  {
    name: 'Main Manufacturing Complex (Cutting & Sewing Floor)',
    location: 'Plot 42, Konabari Industrial Area, Gazipur',
    type: 'Primary Factory',
    status: 'Operating 24/7',
  },
  {
    name: 'Central Finished Goods Wholesale Depot',
    location: 'Noor Mansion, 2nd Floor, Islampur Market, Old Dhaka',
    type: 'Wholesale Depot',
    status: 'Active',
  },
  {
    name: 'Keraniganj Wholesale Distribution Hub',
    location: 'East Aganagar, Keraniganj, Dhaka',
    type: 'Distribution Hub',
    status: 'Active',
  },
  {
    name: 'Factory Retail Display Outlet',
    location: 'Sector 3, Uttara Model Town, Dhaka',
    type: 'Direct Outlet',
    status: 'Active',
  },
]

export function BranchesTab() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base text-foreground">Registered Factory Facilities & Hubs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {FACILITIES.map((b, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
          >
            <div>
              <div className="font-semibold text-foreground text-sm">{b.name}</div>
              <div className="text-xs text-muted-foreground">{b.location}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {b.type}
              </Badge>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                {b.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

