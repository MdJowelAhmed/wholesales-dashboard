import React, { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  productFormSchema,
  ProductFormData,
  WHOLESALE_SERIES_PRESET,
} from './productFormSchema'
import { ProductImageUpload } from './ProductImageUpload'
import { ProductVariantsFieldArray } from './ProductVariantsFieldArray'
import { CategorySelectWithQuickAdd } from './CategorySelectWithQuickAdd'

function generateVariantId(index: number): string {
  return `var-${Date.now()}-${index + 1}`
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
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      code: '',
      category: "Kids' Wear",
      fabric: '100% Combed Cotton',
      description: '',
      imageUrl: '',
      variants: [...WHOLESALE_SERIES_PRESET],
    },
  })

  const currentImageUrl = useWatch({ control, name: 'imageUrl' })
  const currentCategory = useWatch({ control, name: 'category' })

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const formattedCode = data.code.toUpperCase().trim()

      const variants = data.variants.map((v, index) => {
        const sanitizedSize = v.size.replace(/\s+/g, '')
        return {
          id: generateVariantId(index),
          sku: `${formattedCode}-${sanitizedSize}`,
          size: v.size.trim(),
          color: v.color?.trim() || undefined,
          pricePerPiece: Number(v.pricePerPiece),
          costPerPiece: v.costPerPiece ? Number(v.costPerPiece) : 0,
          stockPieces: Number(v.stockPieces),
          isActive: true,
        }
      })

      await productsRepository.createProduct({
        name: data.name.trim(),
        code: formattedCode,
        category: data.category,
        fabric: data.fabric?.trim() || undefined,
        imageUrl: data.imageUrl?.trim() || undefined,
        description: data.description?.trim() || undefined,
        status: 'active',
        variants,
      })

      const totalPcs = variants.reduce((sum, v) => sum + v.stockPieces, 0)

      toast.success('Garment Product Created', {
        description: `${data.name} (${formattedCode}) with ${variants.length} size variants and ${totalPcs} total pieces added to catalog.`,
      })

      reset({
        name: '',
        code: '',
        category: "Kids' Wear",
        fabric: '100% Combed Cotton',
        description: '',
        imageUrl: '',
        variants: [...WHOLESALE_SERIES_PRESET],
      })
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Failed to create garment product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add Garment Product
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          {/* Top Row: Name, Code, Category, Fabric */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="product-name" className="text-xs font-semibold text-foreground">
                Product Name *
              </label>
              <Input
                id="product-name"
                placeholder="e.g. Boys' Cotton Polo Shirt"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-[11px] text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="product-code" className="text-xs font-semibold text-foreground">
                Design / Model Code *
              </label>
              <Input
                id="product-code"
                placeholder="e.g. BPS-101"
                {...register('code')}
                aria-invalid={!!errors.code}
              />
              {errors.code && (
                <p className="text-[11px] text-destructive">{errors.code.message}</p>
              )}
            </div>

            <CategorySelectWithQuickAdd
              value={currentCategory}
              onChange={(val) => setValue('category', val, { shouldValidate: true })}
              error={errors.category?.message}
            />

            <div className="space-y-1">
              <label htmlFor="product-fabric" className="text-xs font-semibold text-foreground">
                Fabric / Material
              </label>
              <Input
                id="product-fabric"
                placeholder="e.g. 100% Pique, 9.5 oz Denim"
                {...register('fabric')}
              />
            </div>
          </div>

          {/* Product Image Uploader */}
          <ProductImageUpload
            value={currentImageUrl}
            onChange={(val) => setValue('imageUrl', val, { shouldDirty: true })}
          />

          {/* Product Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Description</label>
            <Textarea
              placeholder="Fabric specifications, wash care, stitch details..."
              rows={2}
              {...register('description')}
            />
          </div>

          {/* Size Formats & Dynamic Variants Field Array */}
          <ProductVariantsFieldArray
            control={control}
            register={register}
            errors={errors}
          />

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
