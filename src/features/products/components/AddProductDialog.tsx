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
import { Textarea } from '@/components/ui/textarea'
import { productsRepository } from '@/mocks/repositories/productsRepository'
import { toast } from 'sonner'

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  code: z.string().min(2, 'Model/Design code is required'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().optional(),
  initialSize: z.string().min(1, 'Initial variant size is required (e.g. 18, 20, 22)'),
  initialPricePerPiece: z.number().positive('Price per piece must be greater than 0'),
  initialCostPerPiece: z.number().min(0, 'Cost cannot be negative').optional(),
  initialStockPieces: z.number().int().min(0, 'Stock pieces cannot be negative'),
})

type ProductFormData = z.infer<typeof productSchema>

function generateVariantId(): string {
  return `var-${Date.now()}-1`
}

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddProductDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddProductDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      code: '',
      category: "Kids' Wear",
      description: '',
      initialSize: '18',
      initialPricePerPiece: 280,
      initialCostPerPiece: 175,
      initialStockPieces: 100,
    },
  })

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      await productsRepository.createProduct({
        name: data.name,
        code: data.code.toUpperCase(),
        category: data.category,
        description: data.description,
        status: 'active',
        variants: [
          {
            id: generateVariantId(),
            sku: `${data.code.toUpperCase()}-${data.initialSize}`,
            size: data.initialSize,
            pricePerPiece: data.initialPricePerPiece,
            costPerPiece: data.initialCostPerPiece || 0,
            stockPieces: data.initialStockPieces,
            isActive: true,
          },
        ],
      })
      toast.success('Product created successfully', {
        description: `${data.name} with Size ${data.initialSize} added to catalog.`,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add Garment Product
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-foreground">
                Product Name *
              </label>
              <Input
                placeholder="e.g. Boys' Cotton Polo Shirt"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-[11px] text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-foreground">
                Design / Model Code *
              </label>
              <Input
                placeholder="e.g. BPS-101"
                {...register('code')}
                aria-invalid={!!errors.code}
              />
              {errors.code && (
                <p className="text-[11px] text-destructive">{errors.code.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Category *</label>
            <select
              {...register('category')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Kids' Wear">Kids' Wear (Sizes 18, 20, 22, 24)</option>
              <option value="Girls' Wear">Girls' Wear</option>
              <option value="Boys' Wear">Boys' Wear</option>
              <option value="Infants' Wear">Infants' Wear</option>
              <option value="Mens' Wear">Mens' Wear</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Description</label>
            <Textarea
              placeholder="Fabric composition, design details..."
              rows={2}
              {...register('description')}
            />
          </div>

          {/* Initial Variant Information */}
          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-3">
            <div className="text-xs font-bold text-foreground uppercase tracking-wider">
              Initial Variant & Piece Pricing
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Size (e.g. 18, 20, 22) *
                </label>
                <Input placeholder="18" {...register('initialSize')} />
                {errors.initialSize && (
                  <p className="text-[10px] text-destructive">
                    {errors.initialSize.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Price/Piece (৳) *
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="280"
                  {...register('initialPricePerPiece', { valueAsNumber: true })}
                />
                {errors.initialPricePerPiece && (
                  <p className="text-[10px] text-destructive">
                    {errors.initialPricePerPiece.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Stock (Pieces) *
                </label>
                <Input
                  type="number"
                  placeholder="100"
                  {...register('initialStockPieces', { valueAsNumber: true })}
                />
                {errors.initialStockPieces && (
                  <p className="text-[10px] text-destructive">
                    {errors.initialStockPieces.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
