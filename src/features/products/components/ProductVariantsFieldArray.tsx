import React from 'react'
import {
  Control,
  UseFormRegister,
  FieldErrors,
  useFieldArray,
  useWatch,
} from 'react-hook-form'
import { Plus, Trash2, Layers, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ProductFormData,
  GARMENT_SIZE_PRESETS,
  WHOLESALE_SERIES_PRESET,
} from './productFormSchema'
import { formatBDT } from '@/lib/calculations/financialCalculations'

interface ProductVariantsFieldArrayProps {
  control: Control<ProductFormData>
  register: UseFormRegister<ProductFormData>
  errors: FieldErrors<ProductFormData>
}

export function ProductVariantsFieldArray({
  control,
  register,
  errors,
}: ProductVariantsFieldArrayProps): React.JSX.Element {
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'variants',
  })

  const watchedVariants = useWatch({
    control,
    name: 'variants',
  })

  const totalPieces = watchedVariants?.reduce(
    (sum, v) => sum + (Number(v?.stockPieces) || 0),
    0
  ) || 0

  const totalValuation = watchedVariants?.reduce(
    (sum, v) => sum + (Number(v?.stockPieces) || 0) * (Number(v?.pricePerPiece) || 0),
    0
  ) || 0

  const handleApplyFullSeries = () => {
    replace(WHOLESALE_SERIES_PRESET)
  }

  const handleQuickAddPreset = (sizeName: string) => {
    append({
      size: sizeName,
      color: '',
      pricePerPiece: 250,
      costPerPiece: 150,
      stockPieces: 100,
    })
  }

  return (
    <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
        <div>
          <div className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-primary" />
            Initial Variant & Piece Pricing (16-20, 22-26, 28-32, 34-38...)
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Define size batches with their respective wholesale price and initial stock quantity.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleApplyFullSeries}
          className="h-7 text-xs border-primary/40 text-primary hover:bg-primary/10 self-start sm:self-auto"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Load 16-20 to 34-38 Pack
        </Button>
      </div>

      {/* Quick size preset buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground font-medium mr-1">
          Quick Sizes:
        </span>
        {GARMENT_SIZE_PRESETS.slice(0, 6).map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handleQuickAddPreset(preset)}
            className="text-[11px] px-2 py-0.5 rounded border border-border/70 bg-background hover:bg-secondary text-foreground hover:border-primary/50 transition-colors"
          >
            +{preset}
          </button>
        ))}
      </div>

      {/* Variants Table Header */}
      <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-muted-foreground px-1">
        <div className="col-span-3">Size / Format *</div>
        <div className="col-span-3">Wholesale (৳/pc) *</div>
        <div className="col-span-3">Stock Pieces *</div>
        <div className="col-span-2">Cost (৳/pc)</div>
        <div className="col-span-1 text-center">Action</div>
      </div>

      {/* Dynamic Variant Rows */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {fields.map((field, index) => {
          const rowError = errors.variants?.[index]
          return (
            <div
              key={field.id}
              className="grid grid-cols-12 gap-2 items-start p-1.5 rounded-md bg-background/60 border border-border/60"
            >
              <div className="col-span-3 space-y-1">
                <Input
                  placeholder="e.g. 16-20"
                  className="h-8 text-xs font-semibold"
                  {...register(`variants.${index}.size`)}
                />
                {rowError?.size && (
                  <p className="text-[10px] text-destructive">{rowError.size.message}</p>
                )}
              </div>

              <div className="col-span-3 space-y-1">
                <Input
                  type="number"
                  step="any"
                  placeholder="250"
                  className="h-8 text-xs font-mono font-medium"
                  {...register(`variants.${index}.pricePerPiece`, {
                    valueAsNumber: true,
                  })}
                />
                {rowError?.pricePerPiece && (
                  <p className="text-[10px] text-destructive">
                    {rowError.pricePerPiece.message}
                  </p>
                )}
              </div>

              <div className="col-span-3 space-y-1">
                <Input
                  type="number"
                  placeholder="100"
                  className="h-8 text-xs font-mono"
                  {...register(`variants.${index}.stockPieces`, {
                    valueAsNumber: true,
                  })}
                />
                {rowError?.stockPieces && (
                  <p className="text-[10px] text-destructive">
                    {rowError.stockPieces.message}
                  </p>
                )}
              </div>

              <div className="col-span-2 space-y-1">
                <Input
                  type="number"
                  step="any"
                  placeholder="150"
                  className="h-8 text-xs font-mono text-muted-foreground"
                  {...register(`variants.${index}.costPerPiece`, {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="col-span-1 flex justify-center pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive disabled:opacity-30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {errors.variants?.message && (
        <p className="text-[11px] text-destructive">{errors.variants.message}</p>
      )}

      {/* Footer Actions & Live Metrics Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/50">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            append({
              size: '',
              color: '',
              pricePerPiece: 280,
              costPerPiece: 175,
              stockPieces: 50,
            })
          }
          className="h-7 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Size Variant
        </Button>

        <div className="flex items-center gap-3 text-xs bg-background/80 px-2.5 py-1 rounded border border-border">
          <span className="text-muted-foreground">
            Sizes: <strong className="text-foreground">{fields.length}</strong>
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">
            Total Pieces:{' '}
            <strong className="text-primary">{totalPieces.toLocaleString()} pcs</strong>
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">
            Stock Valuation:{' '}
            <strong className="text-foreground">{formatBDT(totalValuation)}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
