import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { rawMaterialsRepository } from '@/mocks/repositories/rawMaterialsRepository'
import { MaterialUnit } from '@/types/rawMaterials'
import { toast } from 'sonner'

const materialSchema = z.object({
  name: z.string().min(3, 'Material name is required'),
  code: z.string().min(2, 'Code is required'),
  category: z.string().min(2, 'Category is required'),
  baseUnit: z.enum(['kg', 'meter', 'yard', 'cone', 'piece', 'gram']),
  availableQuantity: z.number().min(0, 'Quantity cannot be negative'),
  reorderThreshold: z.number().min(0, 'Reorder threshold cannot be negative'),
  averageCost: z.number().min(0, 'Cost cannot be negative'),
  supplierName: z.string().min(2, 'Supplier name is required'),
})

type MaterialFormData = z.infer<typeof materialSchema>

interface AddRawMaterialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddRawMaterialDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddRawMaterialDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: '',
      code: '',
      category: 'Knitted Fabrics',
      baseUnit: 'kg',
      availableQuantity: 100,
      reorderThreshold: 50,
      averageCost: 450,
      supplierName: 'Square Textiles Ltd.',
    },
  })

  const onSubmit = async (data: MaterialFormData) => {
    setLoading(true)
    try {
      await rawMaterialsRepository.createRawMaterial({
        name: data.name,
        code: data.code.toUpperCase(),
        category: data.category,
        baseUnit: data.baseUnit as MaterialUnit,
        availableQuantity: data.availableQuantity,
        reorderThreshold: data.reorderThreshold,
        averageCost: data.averageCost,
        supplierId: 'sup-001',
        supplierName: data.supplierName,
        status: 'active',
      })

      toast.success('Raw material added', {
        description: `${data.name} added to stock.`,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Failed to add material')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add Raw Material
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Material Name *
            </label>
            <Input
              placeholder="e.g. 100% Combed Cotton Single Jersey 180 GSM"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Material Code *
              </label>
              <Input placeholder="e.g. FAB-SJ-180" {...register('code')} />
              {errors.code && (
                <p className="text-[11px] text-destructive">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Category *</label>
              <select
                {...register('category')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Knitted Fabrics">Knitted Fabrics</option>
                <option value="Woven Fabrics">Woven Fabrics</option>
                <option value="Sewing Accessories">Sewing Accessories</option>
                <option value="Buttons & Fasteners">Buttons & Fasteners</option>
                <option value="Packaging Materials">Packaging Materials</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Base Measurement Unit *
              </label>
              <select
                {...register('baseUnit')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="meter">Meter (m)</option>
                <option value="yard">Yard (yd)</option>
                <option value="cone">Cone (sewing thread)</option>
                <option value="piece">Piece (buttons/zippers)</option>
                <option value="gram">Gram (g)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Average Cost / Unit (৳) *
              </label>
              <Input
                type="number"
                step="any"
                placeholder="450"
                {...register('averageCost', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Available Stock Quantity *
              </label>
              <Input
                type="number"
                step="any"
                placeholder="100"
                {...register('availableQuantity', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Reorder Threshold *
              </label>
              <Input
                type="number"
                step="any"
                placeholder="50"
                {...register('reorderThreshold', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Primary Supplier *
            </label>
            <Input placeholder="e.g. Square Textiles Ltd." {...register('supplierName')} />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Material'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
