import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Layers, Search } from 'lucide-react'
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
import { SizeItem } from '@/types/variants'
import { variantsRepository } from '@/mocks/repositories/variantsRepository'
import { toast } from 'sonner'

export function SizesTab(): React.JSX.Element {
  const [sizes, setSizes] = useState<SizeItem[]>([])
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SizeItem | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const refreshData = () => {
    variantsRepository
      .listSizes()
      .then(setSizes)
      .catch(() => {})
  }

  useEffect(() => {
    let mounted = true
    variantsRepository
      .listSizes()
      .then((list) => {
        if (mounted) setSizes(list)
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

  const handleOpenEdit = (sz: SizeItem) => {
    setEditingItem(sz)
    setName(sz.name)
    setDescription(sz.description || '')
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Size format is required')
      return
    }

    setSaving(true)
    try {
      if (editingItem) {
        await variantsRepository.updateSize(editingItem.id, trimmed, description)
        toast.success(`Size "${trimmed}" updated`)
      } else {
        await variantsRepository.createSize(trimmed, description)
        toast.success(`Size "${trimmed}" created`)
      }
      setDialogOpen(false)
      refreshData()
    } catch {
      toast.error('Failed to save size format')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    try {
      await variantsRepository.deleteSize(deleteId)
      toast.success('Size format removed')
      setDeleteId(null)
      refreshData()
    } catch {
      toast.error('Failed to remove size format')
    }
  }

  const filtered = sizes.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sizes or ranges (e.g. 16-20)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="h-9 text-xs">
          <Plus className="h-4 w-4 mr-1.5" />
          Create Size Format
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((sz) => (
          <div
            key={sz.id}
            className="flex flex-col justify-between p-3 rounded-lg border border-border bg-card shadow-sm hover:border-primary/40 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
                <h4 className="font-bold text-foreground font-mono text-sm">{sz.name}</h4>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {sz.description || 'Standard series'}
              </p>
            </div>
            <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t border-border/50">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleOpenEdit(sz)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDeleteId(sz.id)}
                disabled={sizes.length <= 1}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive disabled:opacity-30"
              >
                <Trash2 className="h-3 w-3" />
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
              {editingItem ? 'Edit Size Format' : 'Create Size Format'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Size / Range Label *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 16-20, 22-26, 36-40, XXL"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Toddler series, Kids pack, Adult single"
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
                {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Size'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Size Format"
        description="Are you sure you want to remove this size format? Existing product records will not be altered."
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
