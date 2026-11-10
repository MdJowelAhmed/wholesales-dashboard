import React, { useState } from 'react'
import { Plus, Check, X, Sparkles, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface ProductSizeQuickBarProps {
  availableSizes: string[]
  onQuickAddPreset: (size: string) => void
  onApplyFullSeries: () => void
  onSaveNewCustomSize: (size: string) => Promise<void>
}

export function ProductSizeQuickBar({
  availableSizes,
  onQuickAddPreset,
  onApplyFullSeries,
  onSaveNewCustomSize,
}: ProductSizeQuickBarProps): React.JSX.Element {
  const [isAdding, setIsAdding] = useState(false)
  const [sizeInput, setSizeInput] = useState('')

  const handleSave = async () => {
    const trimmed = sizeInput.trim()
    if (!trimmed) {
      toast.error('Please enter a valid size name or range')
      return
    }
    await onSaveNewCustomSize(trimmed)
    setSizeInput('')
    setIsAdding(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
        <div>
          <div className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-primary" />
            Initial Variant & Piece Pricing (16-20, 22-26, 28-32, 34-38...)
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Select or create size formats with their wholesale rate and stock pieces.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onApplyFullSeries}
          className="h-7 text-xs border-primary/40 text-primary hover:bg-primary/10 self-start sm:self-auto"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Load 16-20 to 34-38 Pack
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground font-medium mr-1">
          Available Sizes:
        </span>
        {availableSizes.slice(0, 8).map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onQuickAddPreset(size)}
            className="text-[11px] px-2 py-0.5 rounded border border-border/70 bg-background hover:bg-secondary text-foreground hover:border-primary/50 transition-colors"
          >
            +{size}
          </button>
        ))}

        {!isAdding ? (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-[11px] px-2 py-0.5 rounded border border-dashed border-primary/50 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            New Size
          </button>
        ) : (
          <div className="flex items-center gap-1 ml-1">
            <Input
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSave()
                }
              }}
              placeholder="e.g. 36-40, XXL..."
              className="h-7 text-xs w-28"
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="h-7 px-2 text-xs"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(false)
                setSizeInput('')
              }}
              className="h-7 w-7 p-0 text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

