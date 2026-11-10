import React, { useState, useEffect } from 'react'
import { Plus, Check, X, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { productsRepository } from '@/mocks/repositories/productsRepository'
import { toast } from 'sonner'

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
  const [isAdding, setIsAdding] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    productsRepository
      .listCategories()
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

  const handleSaveCategory = async () => {
    const trimmed = newCatName.trim()
    if (!trimmed) {
      toast.error('Category name cannot be empty')
      return
    }

    setLoading(true)
    try {
      const updated = await productsRepository.addCategory(trimmed)
      setCategories(updated)
      onChange(trimmed)
      setNewCatName('')
      setIsAdding(false)
      toast.success(`Category "${trimmed}" created and selected`)
    } catch {
      toast.error('Failed to add category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor="product-category" className="text-xs font-semibold text-foreground flex items-center gap-1">
          <Tag className="h-3 w-3 text-primary" />
          Product Category *
        </label>
        {!isAdding ? (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-[11px] text-primary hover:underline font-medium flex items-center gap-0.5"
          >
            <Plus className="h-3 w-3" />
            New Category
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsAdding(false)
              setNewCatName('')
            }}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        )}
      </div>

      {isAdding ? (
        <div className="flex items-center gap-1.5 pt-0.5">
          <Input
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSaveCategory()
              }
            }}
            placeholder="e.g. Export T-Shirts, Denim Jeans..."
            className="h-9 text-xs"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            onClick={handleSaveCategory}
            disabled={loading || !newCatName.trim()}
            className="h-9 px-2.5 text-xs"
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAdding(false)
              setNewCatName('')
            }}
            className="h-9 w-9 p-0 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
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
      )}

      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  )
}
