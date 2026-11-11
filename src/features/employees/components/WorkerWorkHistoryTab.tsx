import React, { useState, useMemo } from 'react'
import { Plus, Calendar, Filter, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductionEntry } from '@/types/production'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface WorkerWorkHistoryTabProps {
  entries: ProductionEntry[]
  totalEarnedAllTime: number
  onLogWork: () => void
}

export function WorkerWorkHistoryTab({
  entries,
  totalEarnedAllTime,
  onLogWork,
}: WorkerWorkHistoryTabProps): React.JSX.Element {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Filter entries based on selected date range
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (startDate && entry.productionDate < startDate) return false
      if (endDate && entry.productionDate > endDate) return false
      return true
    })
  }, [entries, startDate, endDate])

  // Automatic period totals
  const periodPieces = useMemo(() => {
    return filteredEntries.reduce((sum, e) => sum + (e.goodQuantityPieces || 0), 0)
  }, [filteredEntries])

  const periodEarned = useMemo(() => {
    return filteredEntries.reduce((sum, e) => sum + (e.calculatedWage || 0), 0)
  }, [filteredEntries])

  const handleQuickFilter = (type: 'all' | 'this_week' | 'this_month') => {
    const today = new Date()
    if (type === 'all') {
      setStartDate('')
      setEndDate('')
      return
    }

    if (type === 'this_week') {
      const day = today.getDay()
      const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Monday
      const monday = new Date(today.setDate(diff))
      const sunday = new Date(today.setDate(diff + 6))
      setStartDate(monday.toISOString().split('T')[0])
      setEndDate(sunday.toISOString().split('T')[0])
      return
    }

    if (type === 'this_month') {
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      setStartDate(`${year}-${month}-01`)
      const lastDay = new Date(year, today.getMonth() + 1, 0).getDate()
      setEndDate(`${year}-${month}-${String(lastDay).padStart(2, '0')}`)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter and Action Bar */}
      <Card>
        <CardContent className="p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Filter Date Range:
            </div>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 text-xs w-36 font-mono"
              placeholder="From Date"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 text-xs w-36 font-mono"
              placeholder="To Date"
            />
            <div className="flex items-center gap-1 ml-1">
              <Button
                variant={!startDate && !endDate ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs px-2.5"
                onClick={() => handleQuickFilter('all')}
              >
                All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2.5"
                onClick={() => handleQuickFilter('this_week')}
              >
                This Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2.5"
                onClick={() => handleQuickFilter('this_month')}
              >
                This Month
              </Button>
            </div>
          </div>

          <Button size="sm" className="h-8 text-xs" onClick={onLogWork}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Log Work / কাজ যোগ করুন
          </Button>
        </CardContent>
      </Card>

      {/* Auto Calculation Period Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Selected Range Pieces / মোট পিস</div>
          <div className="text-xl font-bold font-mono text-primary mt-0.5">
            {periodPieces} <span className="text-xs font-normal">pcs</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {filteredEntries.length} work entries in this range
          </div>
        </div>

        <div className="bg-status-active/5 border border-status-active/20 rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Range Earned Total / সময়ের মোট আয়</div>
          <div className="text-xl font-bold font-mono text-status-active-foreground dark:text-status-active mt-0.5">
            {formatBDT(periodEarned)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Sum of pieces × rates for filtered dates
          </div>
        </div>

        <div className="bg-muted/40 border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Cumulative Earned / সর্বমোট অর্জিত আয়
          </div>
          <div className="text-xl font-bold font-mono text-foreground mt-0.5">
            {formatBDT(totalEarnedAllTime)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            All-time approved production earnings
          </div>
        </div>
      </div>

      {/* Work Entries Table */}
      <Card>
        <CardContent className="p-0">
          {filteredEntries.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No work records found for the selected date range. Click &quot;Log Work&quot; to add a new record.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Date / তারিখ</th>
                    <th className="py-2.5 px-3 text-left">Garment / পণ্য</th>
                    <th className="py-2.5 px-3 text-left">Size / সাইজ</th>
                    <th className="py-2.5 px-3 text-right">Good Pieces / পিস</th>
                    <th className="py-2.5 px-3 text-right">Rate / দর</th>
                    <th className="py-2.5 px-3 text-right">Total Earned / মোট মজুরি</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs text-foreground font-semibold">
                        {entry.productionDate}
                      </td>
                      <td className="py-3 px-3 text-xs text-foreground font-medium">
                        {entry.productName}
                        <span className="block text-[11px] text-muted-foreground font-mono">
                          {entry.orderCode}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-foreground">
                        {entry.size}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-bold text-foreground">
                        {entry.goodQuantityPieces}{' '}
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {entry.inputUnit === 'dozen' ? `(${entry.inputQuantity} dz)` : 'pcs'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-muted-foreground">
                        ৳{entry.applicableWageRate}/{entry.inputUnit}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs font-bold text-primary">
                        {formatBDT(entry.calculatedWage)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            entry.status === 'approved'
                              ? 'bg-status-active/15 text-status-active-foreground dark:text-status-active'
                              : entry.status === 'rejected'
                              ? 'bg-destructive/15 text-destructive'
                              : 'bg-status-pending/15 text-status-pending-foreground dark:text-status-pending'
                          }`}
                        >
                          {entry.status === 'approved'
                            ? 'Approved'
                            : entry.status === 'rejected'
                            ? 'Rejected'
                            : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

