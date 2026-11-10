import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Shirt, Eye, Tag, Package } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { StatusBadge } from '@/components/shared/StatusBadge/StatusBadge'
import { DataTable, ColumnDef } from '@/components/shared/DataTable/DataTable'
import { LoadingState } from '@/components/shared/StateFeedbacks'
import { Button } from '@/components/ui/button'
import { productsRepository } from '@/mocks/repositories/productsRepository'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'
import { Product } from '@/types/products'
import { AddProductDialog } from '../components/AddProductDialog'
import { formatBDT } from '@/lib/calculations/financialCalculations'

export function ProductsListPage(): React.JSX.Element {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const navigate = useNavigate()

  const loadProducts = async () => {
    try {
      const data = await productsRepository.listProducts()
      setProducts(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
    const unsubscribe = mockStorage.subscribe(() => {
      loadProducts()
    })
    return () => unsubscribe()
  }, [])

  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'all') return products
    return products.filter((p) => p.category === categoryFilter)
  }, [products, categoryFilter])

  const totalStockPieces = products.reduce(
    (sum, p) => sum + p.variants.reduce((vSum, v) => vSum + v.stockPieces, 0),
    0
  )

  const columns: ColumnDef<Product>[] = [
    {
      key: 'name',
      header: 'Product / Model',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs">
            <Shirt className="h-4 w-4" />
          </div>
          <div>
            <Link
              to={`/products/${row.id}`}
              className="font-semibold text-foreground hover:underline"
            >
              {row.name}
            </Link>
            <div className="text-xs text-muted-foreground font-mono">{row.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
          {row.category}
        </span>
      ),
    },
    {
      key: 'variantsCount',
      header: 'Variants & Sizes',
      cell: (row) => {
        const sizes = row.variants.map((v) => v.size).join(', ')
        return (
          <div>
            <span className="font-semibold text-xs text-foreground">
              {row.variants.length} sizes
            </span>
            <div className="text-[11px] text-muted-foreground">Sizes: {sizes}</div>
          </div>
        )
      },
    },
    {
      key: 'priceRange',
      header: 'Price / Piece',
      cell: (row) => {
        const prices = row.variants.map((v) => v.pricePerPiece)
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)
        const display =
          minPrice === maxPrice
            ? formatBDT(minPrice)
            : `${formatBDT(minPrice)} - ${formatBDT(maxPrice)}`
        return <span className="font-mono text-xs font-semibold">{display}</span>
      },
    },
    {
      key: 'stock',
      header: 'Total Stock',
      sortable: true,
      cell: (row) => {
        const total = row.variants.reduce((s, v) => s + v.stockPieces, 0)
        return (
          <span className="font-mono text-xs font-medium text-foreground">
            {total.toLocaleString()} pcs
          </span>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/products/${row.id}`)}
          className="h-8 px-2 text-xs"
        >
          <Eye className="h-3.5 w-3.5 mr-1" /> View Details
        </Button>
      ),
    },
  ]

  if (loading) {
    return <LoadingState message="Loading garments product catalog..." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Garment Models"
        description="Catalog of finished garments, size variations (e.g. 18, 20, 22), and per-piece wholesale pricing."
        actions={
          <Button onClick={() => setAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Product
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Garment Designs"
          value={products.length}
          subtitle="Models actively cataloged"
          icon={Shirt}
        />
        <SummaryCard
          title="Finished Stock on Hand"
          value={`${totalStockPieces.toLocaleString()} pcs`}
          subtitle="Pieces across all sizes"
          icon={Package}
        />
        <SummaryCard
          title="Active Categories"
          value="5 Categories"
          subtitle="Kids, Girls, Boys, Infants, Mens"
          icon={Tag}
        />
      </div>

      <DataTable
        data={filteredProducts}
        columns={columns}
        searchKey={(p) => `${p.name} ${p.code} ${p.category}`}
        searchPlaceholder="Search by product name or code (e.g. BPS-101)..."
        filterNode={
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Categories</option>
            <option value="Kids' Wear">Kids' Wear</option>
            <option value="Girls' Wear">Girls' Wear</option>
            <option value="Boys' Wear">Boys' Wear</option>
            <option value="Infants' Wear">Infants' Wear</option>
          </select>
        }
        emptyTitle="No garments products found"
        emptyDescription="Create your first garment design model with size variants."
      />

      <AddProductDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={loadProducts}
      />
    </div>
  )
}
