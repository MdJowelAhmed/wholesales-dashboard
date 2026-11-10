import { useState, useMemo, useTransition } from 'react'
import {
  RotateCcw,
  Plus,
  Search,
  Filter,
  Layers,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { shopkeepersRepository } from '@/mocks/repositories/shopkeepersRepository'
import { useRepositoryQuery } from '@/lib/hooks'
import { formatBDT } from '@/lib/calculations/financialCalculations'
import { ProcessUnifiedReturnDialog } from '../components/ProcessUnifiedReturnDialog'
import { ReturnsTable, ReturnWithShopkeeper } from '../components/ReturnsTable'

export function ReturnsListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [conditionFilter, setConditionFilter] = useState<'all' | 'sellable' | 'damaged'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [, startTransition] = useTransition()

  const { data: returns = [], loading, refetch } = useRepositoryQuery<ReturnWithShopkeeper[]>(
    () => shopkeepersRepository.listAllReturns(),
    { initialData: [] }
  )

  const handleRefetch = () => {
    startTransition(() => {
      refetch()
    })
  }

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      const matchSearch =
        r.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.shopkeeperName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.productName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCondition = conditionFilter === 'all' || r.condition === conditionFilter
      return matchSearch && matchCondition
    })
  }, [returns, searchTerm, conditionFilter])

  const metrics = useMemo(() => {
    const totalCredit = returns.reduce((sum, r) => sum + (r.creditAmount ?? 0), 0)
    const totalPieces = returns.reduce((sum, r) => sum + (r.returnQuantityPieces ?? 0), 0)
    const sellablePieces = returns
      .filter((r) => r.condition === 'sellable')
      .reduce((sum, r) => sum + (r.returnQuantityPieces ?? 0), 0)
    const damagedPieces = returns
      .filter((r) => r.condition === 'damaged')
      .reduce((sum, r) => sum + (r.returnQuantityPieces ?? 0), 0)

    return { totalCredit, totalPieces, sellablePieces, damagedPieces }
  }, [returns])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-primary" />
            Returns & Quality Claims
          </h1>
          <p className="text-sm text-muted-foreground">
            Track wholesale return pieces, consignment balance adjustments, and quality quarantine
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          id="btn-process-return"
        >
          <Plus className="mr-2 h-4 w-4" />
          Process Return
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Return Credit</span>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatBDT(metrics.totalCredit)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Adjusted in wholesale ledgers</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Garments Returned</span>
              <Layers className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {metrics.totalPieces.toLocaleString()} pcs
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Across {returns.length} return events</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Restocked to Inventory</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {metrics.sellablePieces.toLocaleString()} pcs
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Sellable quality garments</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Damaged / Quarantine</span>
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {metrics.damagedPieces.toLocaleString()} pcs
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Factory defect or repair hold</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by return #, challan #, shop, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
              id="input-search-returns"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              aria-label="Filter returns by physical condition"
              value={conditionFilter}
              onChange={(e) =>
                setConditionFilter(e.target.value as 'all' | 'sellable' | 'damaged')
              }
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Conditions</option>
              <option value="sellable">Sellable (Restocked)</option>
              <option value="damaged">Damaged (Defective)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <ReturnsTable
        loading={loading}
        filteredReturns={filteredReturns}
      />

      <ProcessUnifiedReturnDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleRefetch}
      />
    </div>
  )
}
