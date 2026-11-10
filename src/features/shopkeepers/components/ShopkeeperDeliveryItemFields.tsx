import React from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Product } from '@/types/products'
import { DeliveryFormData } from './deliveryDialogSchema'

interface ShopkeeperDeliveryItemFieldsProps {
  products: Product[]
  selectedProduct?: Product
  selectedProductId: string
  selectedVariantId: string
  onProductChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onVariantChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  register: UseFormRegister<DeliveryFormData>
  errors: FieldErrors<DeliveryFormData>
}

export function ShopkeeperDeliveryItemFields({
  products,
  selectedProduct,
  selectedProductId,
  selectedVariantId,
  onProductChange,
  onVariantChange,
  register,
  errors,
}: ShopkeeperDeliveryItemFieldsProps) {
  return (
    <>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">Garment Product *</label>
        <select
          value={selectedProductId}
          onChange={onProductChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.code})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Size Variant *</label>
          <select
            value={selectedVariantId}
            onChange={onVariantChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {selectedProduct?.variants.map((v) => (
              <option key={v.id} value={v.id}>
                Size {v.size} {v.color ? `(${v.color})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Quantity (Pieces) *</label>
          <Input
            type="number"
            placeholder="50"
            {...register('quantityPieces', { valueAsNumber: true })}
          />
          {errors.quantityPieces && (
            <p className="text-[10px] text-destructive">{errors.quantityPieces.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Price / Piece (৳) *</label>
          <Input
            type="number"
            step="any"
            placeholder="280"
            {...register('pricePerPiece', { valueAsNumber: true })}
          />
        </div>
      </div>
    </>
  )
}

