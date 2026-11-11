import React, { useState, useEffect } from 'react'
import { Tag } from 'lucide-react'
import { variantsRepository } from '@/mocks/repositories/variantsRepository'

interface CategorySelectWithQuickAddProps {
  value: string
  onChange: (category: string) => void
  error?: string
}

export function CategorySelectWithQuickAdd({
  value,
  onChange,
  error,
}: CategorySelectWithQuickAddProps): React.JSX.Element {
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    let mounted = true
    variantsRepository
      .listCategoryNames()
      .then((list) => {
        if (mounted) {
          setCategories(list)
          if (!value && list.length > 0) {
            onChange(list[0])
          }
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [value, onChange])

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label
          htmlFor="product-category"
          className="text-xs font-semibold text-foreground flex items-center gap-1"
        >
          <Tag className="h-3 w-3 text-primary" />
          Product Category *
        </label>
        <span className="text-[11px] text-muted-foreground">
          Dynamic from Variants
        </span>
      </div>

      <select
        id="product-category"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  )
}
