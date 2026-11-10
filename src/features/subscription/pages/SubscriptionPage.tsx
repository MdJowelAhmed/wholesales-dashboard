import {
  Sparkles,
  CheckCircle2,
  Download,
  Building,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { toast } from 'sonner'

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1 */}
        <Card className="border-border bg-card flex flex-col justify-between">
          <CardHeader>
            <div className="text-sm font-semibold uppercase text-muted-foreground">Starter Workshop</div>
            <div className="text-2xl font-bold text-foreground mt-1">৳4,500 <span className="text-xs font-normal text-muted-foreground">/ month</span></div>
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
              onClick={() => handleUpgrade('Starter Workshop')}
            >
              Downgrade to Starter
            </Button>
          </CardContent>
        </Card>

        {/* Tier 2 */}
        <Card className="border-border bg-card flex flex-col justify-between">
          <CardHeader>
            <div className="text-sm font-semibold uppercase text-muted-foreground">Factory Growth</div>
            <div className="text-2xl font-bold text-foreground mt-1">৳12,000 <span className="text-xs font-normal text-muted-foreground">/ month</span></div>
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
              onClick={() => handleUpgrade('Factory Growth')}
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
            <div className="text-2xl font-bold text-foreground mt-1">৳25,000 <span className="text-xs font-normal text-muted-foreground">/ month</span></div>
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

      {/* Billing History */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">Subscription Billing History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Billing Invoice #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    num: 'SUB-2026-10',
                    date: '2026-10-01',
                    plan: 'Enterprise Wholesale',
                    amount: 25000,
                    method: 'Bank Transfer (EBL Corporate)',
                    status: 'paid',
                  },
                  {
                    num: 'SUB-2026-09',
                    date: '2026-09-01',
                    plan: 'Enterprise Wholesale',
                    amount: 25000,
                    method: 'Bank Transfer (EBL Corporate)',
                    status: 'paid',
                  },
                  {
                    num: 'SUB-2026-08',
                    date: '2026-08-01',
                    plan: 'Enterprise Wholesale',
                    amount: 25000,
                    method: 'bKash Merchant Pay',
                    status: 'paid',
                  },
                ].map((inv) => (
                  <tr key={inv.num} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono font-semibold text-foreground">
                      {inv.num}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{inv.plan}</td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">
                      {formatBDT(inv.amount)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.method}</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                        Paid
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleDownloadInvoice(inv.num)}
                      >
                        <Download className="mr-1 h-3 w-3" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
