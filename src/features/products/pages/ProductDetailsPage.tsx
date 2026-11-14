import React, { useState, useTransition } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Tag, DollarSign, Package } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { StatusBadge } from '@/components/shared/StatusBadge/StatusBadge'
import { EmptyState, TableSkeleton, CardGridSkeleton } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { productsRepository } from '@/mocks/repositories/productsRepository'
import { useRepositoryQuery, QUERY_INVALIDATION_SCOPES } from '@/lib/hooks'
import { Product } from '@/types/products'
import { AddVariantDialog } from '../components/AddVariantDialog'
import { formatBDT } from '@/lib/calculations/financialCalculations'

export function ProductDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const [addVariantOpen, setAddVariantOpen] = useState(false)
  const [, startTransition] = useTransition()

  const { data: product, loading, refetch } = useRepositoryQuery<Product | null>(
    async () => {
      if (!id) return null
      return productsRepository.getProductById(id)
    },
    { deps: [id], initialData: null, invalidationScopes: [...QUERY_INVALIDATION_SCOPES.products] }
  )

  const handleRefetch = () => {
    startTransition(() => {
      refetch()
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-muted/50 rounded animate-pulse" />
        <CardGridSkeleton count={3} />
        <TableSkeleton rows={4} cols={8} />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild size="sm">
          <Link to="/products">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Products
          </Link>
        </Button>
        <EmptyState
          title="Product not found"
          description="The requested garment design model could not be found."
        />
      </div>
    )
  }

  const totalStockPieces = product.variants?.reduce((s, v) => s + (v.stockPieces ?? 0), 0) ?? 0
  const totalValuation = product.variants?.reduce(
    (s, v) => s + (v.stockPieces ?? 0) * (v.pricePerPiece ?? 0),
    0
  ) ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild size="sm" className="h-8 px-2">
          <Link to="/products" className="text-xs">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Products
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`${product.name} (${product.code})`}
        description={product.description || 'Garment model profile and size variations.'}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={product.status} />
            <Button size="sm" onClick={() => setAddVariantOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Size Variant
            </Button>
          </div>
        }
      />

      {product.imageUrl && (
        <div className="flex items-center gap-4 p-3.5 rounded-xl border border-border bg-card">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-20 w-20 object-cover rounded-lg border border-border bg-muted shadow-sm"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground text-sm">{product.name}</h3>
              <span className="text-xs font-mono text-muted-foreground">({product.code})</span>
            </div>
            {product.fabric && (
              <span className="inline-block text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                Fabric: {product.fabric}
              </span>
            )}
            <p className="text-xs text-muted-foreground line-clamp-2">
              {product.description || 'Finished garment production model.'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Finished Pieces"
          value={`${totalStockPieces.toLocaleString()} pcs`}
          subtitle="Sum across all variant sizes"
          icon={Package}
        />
        <SummaryCard
          title="Inventory Valuation"
          value={formatBDT(totalValuation)}
          subtitle="At current per-piece selling price"
          icon={DollarSign}
        />
        <SummaryCard
          title="Category"
          value={product.category}
          subtitle="Target apparel department"
          icon={Tag}
        />
      </div>

      {/* Variants Table Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Size Variants & Pricing</CardTitle>
            <CardDescription>
              All pricing is strictly calculated per piece. Children garments support sizes 18,
              20, 22.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => setAddVariantOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Variant
          </Button>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2.5 px-3 text-left">SKU</th>
                  <th className="py-2.5 px-3 text-left">Size</th>
                  <th className="py-2.5 px-3 text-left">Color</th>
                  <th className="py-2.5 px-3 text-right">Price / Piece</th>
                  <th className="py-2.5 px-3 text-right">Cost / Piece</th>
                  <th className="py-2.5 px-3 text-right">Stock (Pieces)</th>
                  <th className="py-2.5 px-3 text-right">Valuation</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {product.variants?.map((variant) => (
                  <tr key={variant.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs font-semibold text-foreground">
                      {variant.sku}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {variant.size}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">
                      {variant.color || 'Standard'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs font-bold text-foreground">
                      {formatBDT(variant.pricePerPiece)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-muted-foreground">
                      {variant.costPerPiece ? formatBDT(variant.costPerPiece) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-foreground">
                      {variant.stockPieces} pcs
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-foreground">
                      {formatBDT(variant.stockPieces * variant.pricePerPiece)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <StatusBadge status={variant.isActive ? 'active' : 'inactive'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddVariantDialog
        productId={product.id}
        productCode={product.code}
        open={addVariantOpen}
        onOpenChange={setAddVariantOpen}
        onSuccess={handleRefetch}
      />
    </div>
  )
}
