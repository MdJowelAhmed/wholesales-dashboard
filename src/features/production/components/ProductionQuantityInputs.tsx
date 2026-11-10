import { UseFormRegister } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { EntryFormData } from './productionOutputSchema'

interface ProductionQuantityInputsProps {
  inputUnit: 'piece' | 'dozen'
  register: UseFormRegister<EntryFormData>
}

export function ProductionQuantityInputs({
  inputUnit,
  register,
}: ProductionQuantityInputsProps) {
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">
            Input Qty ({inputUnit}) *
          </label>
          <Input
            type="number"
            placeholder="60"
            {...register('inputQuantity', { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Good Pieces *</label>
          <Input
            type="number"
            placeholder="60"
            {...register('goodQuantityPieces', { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Damaged / Reject</label>
          <Input
            type="number"
            placeholder="0"
            {...register('damagedQuantityPieces', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">
          Applicable Wage Rate (৳ / {inputUnit}) *
        </label>
        <Input
          type="number"
          step="any"
          placeholder="18"
          {...register('applicableWageRate', { valueAsNumber: true })}
        />
      </div>
    </>
  )
}

