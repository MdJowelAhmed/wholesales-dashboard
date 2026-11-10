import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface SubscriptionPlanCardsProps {
  onUpgrade: (planName: string) => void
}

export function SubscriptionPlanCards({ onUpgrade }: SubscriptionPlanCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Tier 1 */}
      <Card className="border-border bg-card flex flex-col justify-between">
        <CardHeader>
          <div className="text-sm font-semibold uppercase text-muted-foreground">Starter Workshop</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            ৳4,500 <span className="text-xs font-normal text-muted-foreground">/ month</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            For small tailoring shops and sampling studios with single-room production.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Up to 5 tailors & workers
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 2,000 pieces monthly volume
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Basic sales billing
            </li>
          </ul>
          <Button
            variant="outline"
            className="w-full text-xs"
            onClick={() => onUpgrade('Starter Workshop')}
          >
            Downgrade to Starter
          </Button>
        </CardContent>
      </Card>

      {/* Tier 2 */}
      <Card className="border-border bg-card flex flex-col justify-between">
        <CardHeader>
          <div className="text-sm font-semibold uppercase text-muted-foreground">Factory Growth</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            ৳12,000 <span className="text-xs font-normal text-muted-foreground">/ month</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            For mid-sized garments factories with dedicated cutting and sewing lines.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Up to 25 workers & operators
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 10,000 pieces monthly volume
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Wholesale deliveries & challans
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Consignment stock tracking
            </li>
          </ul>
          <Button
            variant="outline"
            className="w-full text-xs"
            onClick={() => onUpgrade('Factory Growth')}
          >
            Switch to Growth
          </Button>
        </CardContent>
      </Card>

      {/* Tier 3: ACTIVE */}
      <Card className="border-primary bg-primary/5 flex flex-col justify-between relative shadow-md">
        <div className="absolute -top-3 right-4">
          <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">
            CURRENT PLAN
          </Badge>
        </div>
        <CardHeader>
          <div className="text-sm font-bold text-primary uppercase">Enterprise Wholesale</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            ৳25,000 <span className="text-xs font-normal text-muted-foreground">/ month</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Complete full-scale apparel ERP for large factories and multi-market wholesale operations.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-xs text-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Up to 50 employees & workers
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> 25,000 pieces monthly capacity
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Full Islampur & Keraniganj wholesale ledgers
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Worker piece-rate payroll & payslips
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Advanced P&L audits & CSV exports
            </li>
          </ul>
          <Button disabled className="w-full text-xs bg-primary text-primary-foreground">
            Active Subscription
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

