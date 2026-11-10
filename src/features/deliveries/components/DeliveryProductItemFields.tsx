import React from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Product, ProductVariant } from '@/types/products'

interface DeliveryProductItemFieldsProps {
  products: Product[]
  variants: ProductVariant[]
  selectedProductId: string
  onProductChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>
}

export function DeliveryProductItemFields({
  products,
  variants,
  selectedProductId,
  onProductChange,
  register,
  errors,
}: DeliveryProductItemFieldsProps) {
  return (
    <>
      {/* Product & Variant */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Garment Product *</label>
          <select
            value={selectedProductId}
            onChange={onProductChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Size Variant *</label>
          <select
            {...register('variantId')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                Size {v.size} ({v.color}) - {v.sku}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quantity in Pieces and Price per piece */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">
            Quantity (Pieces) *
          </label>
          <Input
            type="number"
            min={1}
            {...register('quantityPieces', { valueAsNumber: true })}
            className="bg-background"
          />
          {errors.quantityPieces && (
            <p className="text-xs text-destructive">{errors.quantityPieces.message as string}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">
            Price per Piece (৳) *
          </label>
          <Input
            type="number"
            step="0.01"
            min={1}
            {...register('pricePerPiece', { valueAsNumber: true })}
            className="bg-background"
          />
          {errors.pricePerPiece && (
            <p className="text-xs text-destructive">{errors.pricePerPiece.message as string}</p>
          )}
        </div>
      </div>
    </>
  )
}

