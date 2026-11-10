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
import { suppliersRepository } from '@/mocks/repositories/suppliersRepository'
import { toast } from 'sonner'

const supplierSchema = z.object({
  name: z.string().min(3, 'Supplier name is required'),
  contactPerson: z.string().min(2, 'Contact person is required'),
  phone: z.string().min(6, 'Phone is required'),
  address: z.string().min(3, 'Address is required'),
  materialsSupplied: z.string().min(2, 'Comma-separated materials are required'),
})

type SupplierFormData = z.infer<typeof supplierSchema>

interface AddSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddSupplierDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddSupplierDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      phone: '+880 1',
      address: '',
      materialsSupplied: 'Knitted Fabrics, Yarns',
    },
  })

  const onSubmit = async (data: SupplierFormData) => {
    setLoading(true)
    try {
      await suppliersRepository.createSupplier({
        name: data.name,
        contactPerson: data.contactPerson,
        phone: data.phone,
        address: data.address,
        materialsSupplied: data.materialsSupplied.split(',').map((s) => s.trim()),
        status: 'active',
      })

      toast.success('Supplier added', {
        description: `${data.name} added to suppliers registry.`,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Failed to add supplier')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add Fabric / Trim Supplier
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Company / Mill Name *
            </label>
            <Input placeholder="e.g. Noman Fabrics Ltd." {...register('name')} />
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Contact Person *
              </label>
              <Input placeholder="Manager Name" {...register('contactPerson')} />
              {errors.contactPerson && (
                <p className="text-[11px] text-destructive">
                  {errors.contactPerson.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Phone *</label>
              <Input placeholder="+880 1711..." {...register('phone')} />
              {errors.phone && (
                <p className="text-[11px] text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Address / Mill Location *</label>
            <Input placeholder="Kashimpur, Gazipur, Dhaka" {...register('address')} />
            {errors.address && (
              <p className="text-[11px] text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Supplied Items (comma separated) *
            </label>
            <Input placeholder="Single Jersey, Lycra Rib, Threads" {...register('materialsSupplied')} />
            {errors.materialsSupplied && (
              <p className="text-[11px] text-destructive">{errors.materialsSupplied.message}</p>
            )}
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
              {loading ? 'Adding...' : 'Add Supplier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
