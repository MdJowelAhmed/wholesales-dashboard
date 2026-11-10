import React from 'react'
import { UseFormRegister } from 'react-hook-form'
import { Product } from '@/types/products'
import { Employee } from '@/types/employees'
import { EntryFormData } from './productionOutputSchema'

interface ProductionAssignmentSelectorsProps {
  products: Product[]
  employees: Employee[]
  selectedProduct?: Product
  selectedProductId: string
  onProductChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onEmployeeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  register: UseFormRegister<EntryFormData>
}

export function ProductionAssignmentSelectors({
  products,
  employees,
  selectedProduct,
  selectedProductId,
  onProductChange,
  onEmployeeChange,
  register,
}: ProductionAssignmentSelectorsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Garment Model *</label>
          <select
            value={selectedProductId}
            onChange={onProductChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Size Variant *</label>
          <select
            {...register('variantId')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {selectedProduct?.variants.map((v) => (
              <option key={v.id} value={v.id}>
                Size {v.size} {v.color ? `(${v.color})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">
            Tailor / Operator *
          </label>
          <select
            onChange={onEmployeeChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.designation})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Input Unit *</label>
          <select
            {...register('inputUnit')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="piece">Per Piece</option>
            <option value="dozen">Per Dozen (12 pcs)</option>
          </select>
        </div>
      </div>
    </>
  )
}

