import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Tag, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog/ConfirmDialog'
import { CategoryItem } from '@/types/variants'
import { variantsRepository } from '@/mocks/repositories/variantsRepository'
import { toast } from 'sonner'

export function CategoriesTab(): React.JSX.Element {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const refreshData = () => {
    variantsRepository
      .listCategories()
      .then(setCategories)
      .catch(() => {})
  }

  useEffect(() => {
    let mounted = true
    variantsRepository
      .listCategories()
      .then((list) => {
        if (mounted) setCategories(list)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const handleOpenAdd = () => {
    setEditingItem(null)
    setName('')
    setDescription('')
    setDialogOpen(true)
  }

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingItem(cat)
    setName(cat.name)
    setDescription(cat.description || '')
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Category name is required')
      return
    }

    setSaving(true)
    try {
      if (editingItem) {
        await variantsRepository.updateCategory(editingItem.id, trimmed, description)
        toast.success(`Category "${trimmed}" updated`)
      } else {
        await variantsRepository.createCategory(trimmed, description)
        toast.success(`Category "${trimmed}" created`)
      }
      setDialogOpen(false)
      refreshData()
    } catch {
      toast.error('Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    try {
      await variantsRepository.deleteCategory(deleteId)
      toast.success('Category removed')
      setDeleteId(null)
      refreshData()
    } catch {
      toast.error('Failed to remove category')
    }
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="h-9 text-xs">
          <Plus className="h-4 w-4 mr-1.5" />
          Create Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="flex items-start justify-between p-3.5 rounded-lg border border-border bg-card shadow-sm hover:border-primary/40 transition-colors"
          >
            <div className="space-y-1 pr-2">
              <div className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary shrink-0" />
                <h4 className="font-semibold text-foreground text-sm">{cat.name}</h4>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {cat.description || 'No description provided'}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleOpenEdit(cat)}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDeleteId(cat.id)}
                disabled={categories.length <= 1}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive disabled:opacity-30"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Garment Category' : 'Create New Garment Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Category Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Export Polo, Denim Jeans, Panjabi"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Target demographic or apparel details"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !name.trim()}>
                {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Garment Category"
        description="Are you sure you want to remove this category? Products using this category will remain unaffected."
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
