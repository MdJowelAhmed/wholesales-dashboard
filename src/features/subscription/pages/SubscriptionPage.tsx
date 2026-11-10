import { Sparkles, Building } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { SubscriptionPlanCards } from '../components/SubscriptionPlanCards'
import { SubscriptionBillingHistory } from '../components/SubscriptionBillingHistory'

export function SubscriptionPage() {
  const handleUpgrade = (planName: string) => {
    toast.success(`Requested upgrade to ${planName}. Our sales team will activate your license.`)
  }

  const handleDownloadInvoice = (invNum: string) => {
    toast.info(`Downloaded official invoice voucher for ${invNum}`)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            SaaS Subscription & Plans
          </h1>
          <p className="text-sm text-muted-foreground">
            Aparajita ERP industrial license, capacity quotas, and recurring billing history
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm font-semibold">
          Current Tier: Enterprise Wholesale
        </Badge>
      </div>

      {/* Resource Quota Meter */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Active Factory Resource Quotas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
            <div className="flex justify-between text-muted-foreground font-medium">
              <span>Tailors & Staff:</span>
              <span className="text-foreground font-bold">18 / 50</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '36%' }} />
            </div>
            <p className="text-[11px] text-muted-foreground">36% quota utilized</p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
            <div className="flex justify-between text-muted-foreground font-medium">
              <span>Monthly Production Capacity:</span>
              <span className="text-foreground font-bold">4,850 / 25,000 pcs</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: '19.4%' }} />
            </div>
            <p className="text-[11px] text-muted-foreground">Piece-based sewing quota</p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
            <div className="flex justify-between text-muted-foreground font-medium">
              <span>Wholesale Shopkeeper Hubs:</span>
              <span className="text-foreground font-bold">5 / 30</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: '16.6%' }} />
            </div>
            <p className="text-[11px] text-muted-foreground">Consignment & credit partners</p>
          </div>
        </CardContent>
      </Card>

      {/* Plan Tiers */}
      <SubscriptionPlanCards onUpgrade={handleUpgrade} />

      {/* Billing History */}
      <SubscriptionBillingHistory onDownloadInvoice={handleDownloadInvoice} />
    </div>
  )
}
