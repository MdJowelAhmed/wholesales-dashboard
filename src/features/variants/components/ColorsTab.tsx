import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
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
import { ColorItem } from '@/types/variants'
import { variantsRepository } from '@/mocks/repositories/variantsRepository'
import { toast } from 'sonner'

export function ColorsTab(): React.JSX.Element {
  const [colors, setColors] = useState<ColorItem[]>([])
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ColorItem | null>(null)
  const [name, setName] = useState('')
  const [hexCode, setHexCode] = useState('#1e3a8a')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const refreshData = () => {
    variantsRepository
      .listColors()
      .then(setColors)
      .catch(() => {})
  }

  useEffect(() => {
    let mounted = true
    variantsRepository
      .listColors()
      .then((list) => {
        if (mounted) setColors(list)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const handleOpenAdd = () => {
    setEditingItem(null)
    setName('')
    setHexCode('#1e3a8a')
    setDialogOpen(true)
  }

  const handleOpenEdit = (col: ColorItem) => {
    setEditingItem(col)
    setName(col.name)
    setHexCode(col.hexCode)
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Color shade name is required')
      return
    }

    setSaving(true)
    try {
      if (editingItem) {
        await variantsRepository.updateColor(editingItem.id, trimmed, hexCode)
        toast.success(`Color "${trimmed}" updated`)
      } else {
        await variantsRepository.createColor(trimmed, hexCode)
        toast.success(`Color "${trimmed}" created`)
      }
      setDialogOpen(false)
      refreshData()
    } catch {
      toast.error('Failed to save color')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    try {
      await variantsRepository.deleteColor(deleteId)
      toast.success('Color shade removed')
      setDeleteId(null)
      refreshData()
    } catch {
      toast.error('Failed to remove color')
    }
  }

  const filtered = colors.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search colors or shades (e.g. Navy Blue)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="h-9 text-xs">
          <Plus className="h-4 w-4 mr-1.5" />
          Create Color Shade
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((col) => (
          <div
            key={col.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card shadow-sm hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="h-7 w-7 rounded-full border border-border shadow-inner shrink-0"
                style={{ backgroundColor: col.hexCode }}
              />
              <div>
                <h4 className="font-semibold text-foreground text-xs">{col.name}</h4>
                <span className="font-mono text-[10px] text-muted-foreground uppercase">
                  {col.hexCode}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleOpenEdit(col)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDeleteId(col.id)}
                disabled={colors.length <= 1}
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
              {editingItem ? 'Edit Color Shade' : 'Create New Color Shade'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Color Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Navy Blue, Dark Indigo, Jet Black"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Hex Code & Palette *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={hexCode}
                  onChange={(e) => setHexCode(e.target.value)}
                  className="h-9 w-12 rounded cursor-pointer border border-input bg-background p-1"
                />
                <Input
                  value={hexCode}
                  onChange={(e) => setHexCode(e.target.value)}
                  placeholder="#1e3a8a"
                  className="font-mono text-xs uppercase"
                  required
                />
              </div>
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
                {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Color'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Color Shade"
        description="Are you sure you want to remove this color shade? Product variants using this shade will remain untouched."
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
