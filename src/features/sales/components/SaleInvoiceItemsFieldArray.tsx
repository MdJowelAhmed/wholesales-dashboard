import { UseFormRegister, FieldArrayWithId } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Product } from '@/types/products'
import { formatBDT, calculateLineTotal } from '@/lib/calculations/financialCalculations'
import { SaleFormData, SaleItemFormData } from './saleInvoiceSchema'

interface SaleInvoiceItemsFieldArrayProps {
  products: Product[]
  fields: FieldArrayWithId<SaleFormData, 'items', 'id'>[]
  watchItems: SaleItemFormData[]
  append: (item: SaleItemFormData) => void
  remove: (index: number) => void
  register: UseFormRegister<SaleFormData>
  defaultProduct?: Product
}

export function SaleInvoiceItemsFieldArray({
  products,
  fields,
  watchItems,
  append,
  remove,
  register,
  defaultProduct,
}: SaleInvoiceItemsFieldArrayProps) {
  const defaultVariant = defaultProduct?.variants[0]

  return (
    <div className="space-y-2 border-t border-border pt-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
          Finished Garments (Strictly Per-Piece)
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() =>
            append({
              productId: defaultProduct?.id || '',
              variantId: defaultVariant?.id || '',
              quantityPieces: 20,
              pricePerPiece: defaultVariant?.pricePerPiece || 280,
              discount: 0,
            })
          }
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Garment
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => {
          const currentItem = watchItems[index]
          const lineLineTotal = calculateLineTotal(
            currentItem?.quantityPieces || 0,
            currentItem?.pricePerPiece || 0,
            currentItem?.discount || 0
          )

          return (
            <div
              key={field.id}
              className="p-3 rounded-lg border border-border bg-card/60 space-y-2 text-xs"
            >
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5 space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Model & Variant
                  </label>
                  <select
                    {...register(`items.${index}.variantId`)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {products.flatMap((p) =>
                      p.variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {p.name} (Size {v.size}) — ৳{v.pricePerPiece}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Pieces *
                  </label>
                  <Input
                    type="number"
                    className="h-9 text-xs"
                    placeholder="50"
                    {...register(`items.${index}.quantityPieces`, { valueAsNumber: true })}
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Price/Pc *
                  </label>
                  <Input
                    type="number"
                    step="any"
                    className="h-9 text-xs"
                    placeholder="280"
                    {...register(`items.${index}.pricePerPiece`, { valueAsNumber: true })}
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Line Total
                  </label>
                  <div className="h-9 flex items-center font-mono font-bold text-foreground">
                    {formatBDT(lineLineTotal)}
                  </div>
                </div>

                <div className="col-span-1 pt-4 text-right">
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

