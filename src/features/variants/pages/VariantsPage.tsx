import React, { useState, useEffect } from 'react'
import { Tag, Layers, Palette } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { SummaryCard } from '@/components/shared/SummaryCard/SummaryCard'
import { Button } from '@/components/ui/button'
import { CategoriesTab } from '../components/CategoriesTab'
import { SizesTab } from '../components/SizesTab'
import { ColorsTab } from '../components/ColorsTab'
import { variantsRepository } from '@/mocks/repositories/variantsRepository'

export function VariantsPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'categories' | 'sizes' | 'colors'>('categories')
  const [counts, setCounts] = useState({ categories: 0, sizes: 0, colors: 0 })

  useEffect(() => {
    let mounted = true
    Promise.all([
      variantsRepository.listCategories(),
      variantsRepository.listSizes(),
      variantsRepository.listColors(),
    ])
      .then(([cats, szs, cols]) => {
        if (mounted) {
          setCounts({
            categories: cats.length,
            sizes: szs.length,
            colors: cols.length,
          })
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [activeTab])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Variants & Attributes (সাইজ, ক্যাটাগরি ও কালার)"
        description="Configure wholesale size series (16-20, 22-26, 28-32, 34-38), product categories, and fabric color shades."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Product Categories"
          value={counts.categories}
          subtitle="Garment lines & divisions"
          icon={Tag}
        />
        <SummaryCard
          title="Size Formats & Series"
          value={counts.sizes}
          subtitle="Wholesale series & single sizes"
          icon={Layers}
        />
        <SummaryCard
          title="Fabric Color Palette"
          value={counts.colors}
          subtitle="Color shades with hex codes"
          icon={Palette}
        />
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Button
          variant={activeTab === 'categories' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('categories')}
          className="text-xs"
        >
          <Tag className="mr-1.5 h-3.5 w-3.5" />
          Categories (ক্যাটাগরি)
        </Button>
        <Button
          variant={activeTab === 'sizes' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('sizes')}
          className="text-xs"
        >
          <Layers className="mr-1.5 h-3.5 w-3.5" />
          Sizes & Ranges (সাইজ ও রেঞ্জ)
        </Button>
        <Button
          variant={activeTab === 'colors' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('colors')}
          className="text-xs"
        >
          <Palette className="mr-1.5 h-3.5 w-3.5" />
          Colors & Shades (কালার ও শেড)
        </Button>
      </div>

      <div className="pt-1">
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'sizes' && <SizesTab />}
        {activeTab === 'colors' && <ColorsTab />}
      </div>
    </div>
  )
}
