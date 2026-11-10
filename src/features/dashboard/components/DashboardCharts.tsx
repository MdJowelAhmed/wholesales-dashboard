import React from 'react'
import { BarChart2, PieChart as PieIcon } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface MonthlyTrendItem {
  month: string
  sales: number
  production: number
}

interface CategoryDistributionItem {
  category: string
  pieces: number
  valuation: number
}

interface DashboardChartsProps {
  monthlyTrendData: MonthlyTrendItem[]
  categoryDistribution: CategoryDistributionItem[]
}

export function DashboardCharts({
  monthlyTrendData,
  categoryDistribution,
}: DashboardChartsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sales & Production Trend Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" />
              Revenue & Factory Output Trend (6 Months)
            </CardTitle>
            <CardDescription>
              Monthly wholesale sales invoiced vs garment production value (BDT)
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">Sales</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-status-active" />
              <span className="text-muted-foreground">Production</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[260px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--status-active))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--status-active))" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `৳${val / 1000}k`}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [formatBDT(Number(value) || 0), 'Amount']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="production"
                  name="Production"
                  stroke="hsl(var(--status-active))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#prodGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Finished Goods Distribution by Category */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-primary" />
            Category Stock Distribution
          </CardTitle>
          <CardDescription>Available pieces across garment categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[260px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis
                  dataKey="category"
                  type="category"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={75}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [`${value ?? 0} pcs`, 'Stock']}
                />
                <Bar dataKey="pieces" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

