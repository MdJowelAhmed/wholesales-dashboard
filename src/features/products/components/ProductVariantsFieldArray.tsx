import React, { useState, useEffect } from 'react'
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
  WHOLESALE_SERIES_PRESET,
} from './productFormSchema'
import { variantsRepository } from '@/mocks/repositories/variantsRepository'
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
  const [availableSizes, setAvailableSizes] = useState<string[]>([])

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'variants',
  })

  const watchedVariants = useWatch({
    control,
    name: 'variants',
  })

  useEffect(() => {
    variantsRepository.listSizeNames().then((sizes) => {
      setAvailableSizes(sizes)
    })
  }, [])

  const totalPieces =
    watchedVariants?.reduce(
      (sum, v) => sum + (Number(v?.stockPieces) || 0),
      0
    ) || 0

  const totalValuation =
    watchedVariants?.reduce(
      (sum, v) =>
        sum + (Number(v?.stockPieces) || 0) * (Number(v?.pricePerPiece) || 0),
      0
    ) || 0

  const handleApplyStandardSeries = () => {
    replace(WHOLESALE_SERIES_PRESET)
  }

  const handleAddVariantRow = () => {
    const existingSizes = new Set(watchedVariants?.map((v) => v.size) || [])
    const nextSize = availableSizes.find((s) => !existingSizes.has(s)) || availableSizes[0] || '16-20'
    append({
      size: nextSize,
      color: '',
      pricePerPiece: 250,
      costPerPiece: 150,
      stockPieces: 100,
    })
  }

  return (
    <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-3">
      {/* Header bar with dynamic indication */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
        <div>
          <div className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-primary" />
            Initial Variant & Piece Pricing
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Sizes are loaded dynamically from the Variants configuration.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleApplyStandardSeries}
          className="h-7 text-xs border-primary/40 text-primary hover:bg-primary/10 self-start sm:self-auto"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Apply Standard Series (16-38)
        </Button>
      </div>

      {/* Variants Table Header */}
      <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-muted-foreground px-1">
        <div className="col-span-4">Size (Dynamic) *</div>
        <div className="col-span-3">Wholesale (৳/pc) *</div>
        <div className="col-span-2">Stock (Pcs) *</div>
        <div className="col-span-2">Cost (৳/pc)</div>
        <div className="col-span-1 text-center">Action</div>
      </div>

      {/* Dynamic Variant Rows */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {fields.map((field, index) => {
          const rowError = errors.variants?.[index]
          const currentSizeVal = watchedVariants?.[index]?.size

          return (
            <div
              key={field.id}
              className="grid grid-cols-12 gap-2 items-start p-1.5 rounded-md bg-background/60 border border-border/60"
            >
              <div className="col-span-4 space-y-1">
                <select
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  {...register(`variants.${index}.size`)}
                >
                  {availableSizes.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                  {currentSizeVal && !availableSizes.includes(currentSizeVal) && (
                    <option value={currentSizeVal}>{currentSizeVal}</option>
                  )}
                </select>
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

              <div className="col-span-2 space-y-1">
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
                  className="h-8 text-xs font-mono"
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
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                  title="Remove variant row"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Variant Button & Valuation Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-border/40">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs text-primary border-primary/30 hover:bg-primary/10 self-start"
          onClick={handleAddVariantRow}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Size Variant
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground self-end sm:self-auto">
          <span>
            Total Stock:{' '}
            <strong className="text-foreground font-mono">{totalPieces} pcs</strong>
          </span>
          <span>•</span>
          <span>
            Est. Wholesale Value:{' '}
            <strong className="text-primary font-mono font-semibold">
              {formatBDT(totalValuation)}
            </strong>
          </span>
        </div>
      </div>
    </div>
  )
}
