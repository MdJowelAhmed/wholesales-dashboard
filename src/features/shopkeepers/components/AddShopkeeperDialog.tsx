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
import { shopkeepersRepository } from '@/mocks/repositories/shopkeepersRepository'
import { toast } from 'sonner'

const shopkeeperSchema = z.object({
  shopName: z.string().min(3, 'Shop name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  phone: z.string().min(6, 'Phone is required'),
  marketName: z.string().min(2, 'Wholesale market name is required'),
  address: z.string().min(3, 'Address is required'),
})

type ShopkeeperFormData = z.infer<typeof shopkeeperSchema>

interface AddShopkeeperDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddShopkeeperDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddShopkeeperDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShopkeeperFormData>({
    resolver: zodResolver(shopkeeperSchema),
    defaultValues: {
      shopName: '',
      ownerName: '',
      phone: '+880 1',
      marketName: 'Islampur Wholesale Market, Dhaka',
      address: 'Shop 12, Noor Market, Islampur',
    },
  })

  const onSubmit = async (data: ShopkeeperFormData) => {
    setLoading(true)
    try {
      await shopkeepersRepository.createShopkeeper({
        shopName: data.shopName,
        ownerName: data.ownerName,
        phone: data.phone,
        marketName: data.marketName,
        address: data.address,
        status: 'active',
      })
      toast.success('Shopkeeper registered', {
        description: `${data.shopName} added to wholesale network.`,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Failed to register shopkeeper')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Register Wholesale Shopkeeper
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Shop / Store Name *</label>
            <Input placeholder="e.g. Al-Madina Garments Wholesale" {...register('shopName')} />
            {errors.shopName && (
              <p className="text-[11px] text-destructive">{errors.shopName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Owner Name *</label>
              <Input placeholder="Alhaj ..." {...register('ownerName')} />
              {errors.ownerName && (
                <p className="text-[11px] text-destructive">{errors.ownerName.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Phone *</label>
              <Input placeholder="+880 1..." {...register('phone')} />
              {errors.phone && (
                <p className="text-[11px] text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Wholesale Market / Location *
            </label>
            <Input
              placeholder="e.g. Islampur / Keraniganj / Terribazar"
              {...register('marketName')}
            />
            {errors.marketName && (
              <p className="text-[11px] text-destructive">{errors.marketName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Detailed Address *</label>
            <Input placeholder="Shop #, Building, Street..." {...register('address')} />
            {errors.address && (
              <p className="text-[11px] text-destructive">{errors.address.message}</p>
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
              {loading ? 'Registering...' : 'Register Shopkeeper'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
