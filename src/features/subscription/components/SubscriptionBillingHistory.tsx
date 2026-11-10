import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface BillingInvoice {
  num: string
  date: string
  plan: string
  amount: number
  method: string
  status: 'paid' | 'pending'
}

const INVOICE_HISTORY: BillingInvoice[] = [
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
]

interface SubscriptionBillingHistoryProps {
  onDownloadInvoice: (invNum: string) => void
}

export function SubscriptionBillingHistory({
  onDownloadInvoice,
}: SubscriptionBillingHistoryProps) {
  return (
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
              {INVOICE_HISTORY.map((inv) => (
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
                      onClick={() => onDownloadInvoice(inv.num)}
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
  )
}

