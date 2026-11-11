import React from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Product } from '@/types/products'
import { LogWorkFormData } from './workerWorkSchema'

interface WorkerWorkFormFieldsProps {
  register: UseFormRegister<LogWorkFormData>
  errors: FieldErrors<LogWorkFormData>
  products: Product[]
  dynamicSizes: string[]
  selectedProductId: string
  onProductSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export function WorkerWorkFormFields({
  register,
  errors,
  products,
  dynamicSizes,
  selectedProductId,
  onProductSelect,
}: WorkerWorkFormFieldsProps): React.JSX.Element {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-foreground">Date / তারিখ</label>
          <Input type="date" {...register('date')} className="mt-1" />
          {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-foreground">Size / সাইজ (Dynamic)</label>
          <select
            {...register('size')}
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
          >
            {dynamicSizes.map((sz) => (
              <option key={sz} value={sz}>{sz}</option>
            ))}
          </select>
          {errors.size && <p className="text-xs text-destructive mt-1">{errors.size.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-foreground">Garment / পণ্যের নাম</label>
        <select
          value={selectedProductId}
          onChange={onProductSelect}
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
          ))}
        </select>
        {errors.productName && <p className="text-xs text-destructive mt-1">{errors.productName.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-foreground">Unit / একক</label>
          <select
            {...register('unit')}
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="piece">Piece (পিস)</option>
            <option value="dozen">Dozen (ডজন)</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground">Quantity / পরিমাণ</label>
          <Input
            type="number"
            {...register('quantity', { valueAsNumber: true })}
            className="mt-1 font-mono"
          />
          {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-foreground">Rate / মজুরি দর (৳)</label>
          <Input
            type="number"
            step="0.5"
            {...register('ratePerUnit', { valueAsNumber: true })}
            className="mt-1 font-mono"
          />
          {errors.ratePerUnit && <p className="text-xs text-destructive mt-1">{errors.ratePerUnit.message}</p>}
        </div>
      </div>
    </>
  )
}
