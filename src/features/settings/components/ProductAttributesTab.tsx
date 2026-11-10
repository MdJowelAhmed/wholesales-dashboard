import React, { useState, useEffect } from 'react'
import { Tag, Layers, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { productsRepository } from '@/mocks/repositories/productsRepository'
import { toast } from 'sonner'

export function ProductAttributesTab(): React.JSX.Element {
  const [categories, setCategories] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [newCat, setNewCat] = useState('')
  const [newSize, setNewSize] = useState('')
  const [loadingCat, setLoadingCat] = useState(false)
  const [loadingSize, setLoadingSize] = useState(false)

  useEffect(() => {
    let mounted = true
    Promise.all([
      productsRepository.listCategories(),
      productsRepository.listSizes(),
    ])
      .then(([cats, szs]) => {
        if (mounted) {
          setCategories(cats)
          setSizes(szs)
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const handleAddCategory = async () => {
    const trimmed = newCat.trim()
    if (!trimmed) {
      toast.error('Category name cannot be empty')
      return
    }
    setLoadingCat(true)
    try {
      const updated = await productsRepository.addCategory(trimmed)
      setCategories(updated)
      setNewCat('')
      toast.success(`Category "${trimmed}" added`)
    } catch {
      toast.error('Failed to add category')
    } finally {
      setLoadingCat(false)
    }
  }

  const handleDeleteCategory = async (name: string) => {
    if (categories.length <= 1) {
      toast.error('At least one category must remain')
      return
    }
    try {
      const updated = await productsRepository.deleteCategory(name)
      setCategories(updated)
      toast.success(`Category "${name}" removed`)
    } catch {
      toast.error('Failed to remove category')
    }
  }

  const handleAddSize = async () => {
    const trimmed = newSize.trim()
    if (!trimmed) {
      toast.error('Size format cannot be empty')
      return
    }
    setLoadingSize(true)
    try {
      const updated = await productsRepository.addSize(trimmed)
      setSizes(updated)
      setNewSize('')
      toast.success(`Size format "${trimmed}" added`)
    } catch {
      toast.error('Failed to add size format')
    } finally {
      setLoadingSize(false)
    }
  }

  const handleDeleteSize = async (name: string) => {
    if (sizes.length <= 1) {
      toast.error('At least one size format must remain')
      return
    }
    try {
      const updated = await productsRepository.deleteSize(name)
      setSizes(updated)
      toast.success(`Size "${name}" removed`)
    } catch {
      toast.error('Failed to remove size')
    }
  }

  return (
    <div className="space-y-6">
      {/* Categories Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            Product Categories (পোশাকের ক্যাটাগরি)
          </CardTitle>
          <CardDescription className="text-xs">
            Manage garment categories tailored to your apparel wholesale & manufacturing line.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCategory()
                }
              }}
              placeholder="e.g. Export Polo, Denim Jeans, Panjabi..."
              className="max-w-xs text-xs h-9"
            />
            <Button
              size="sm"
              onClick={handleAddCategory}
              disabled={loadingCat || !newCat.trim()}
              className="h-9 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Category
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border"
              >
                {cat}
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat)}
                  disabled={categories.length <= 1}
                  className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sizes & Range Formats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Size Formats & Ranges (সাইজ ও সাইজ রেঞ্জ)
          </CardTitle>
          <CardDescription className="text-xs">
            Configure default wholesale size ranges (e.g. 16-20, 22-26, 28-32, 34-38) or custom size series.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddSize()
                }
              }}
              placeholder="e.g. 36-40, 2-4Y, Free Size..."
              className="max-w-xs text-xs h-9"
            />
            <Button
              size="sm"
              onClick={handleAddSize}
              disabled={loadingSize || !newSize.trim()}
              className="h-9 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Size Format
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {sizes.map((sz) => (
              <span
                key={sz}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-foreground text-xs font-mono font-medium border border-border"
              >
                {sz}
                <button
                  type="button"
                  onClick={() => handleDeleteSize(sz)}
                  disabled={sizes.length <= 1}
                  className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
