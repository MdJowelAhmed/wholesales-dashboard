import React from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Shopkeeper, ShopkeeperDelivery, ShopkeeperDeliveryItem } from '@/types/shopkeepers'

interface ReturnSourceSelectorsProps {
  shopkeepers: Shopkeeper[]
  deliveries: ShopkeeperDelivery[]
  deliveryItems: ShopkeeperDeliveryItem[]
  selectedShopkeeperId: string
  onShopkeeperChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onDeliveryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>
}

export function ReturnSourceSelectors({
  shopkeepers,
  deliveries,
  deliveryItems,
  selectedShopkeeperId,
  onShopkeeperChange,
  onDeliveryChange,
  register,
  errors,
}: ReturnSourceSelectorsProps) {
  return (
    <>
      {/* Shopkeeper Selection */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Shopkeeper / Partner *</label>
        <select
          value={selectedShopkeeperId}
          onChange={onShopkeeperChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {shopkeepers.map((sk) => (
            <option key={sk.id} value={sk.id}>
              {sk.shopName} - {sk.marketName}
            </option>
          ))}
        </select>
      </div>

      {/* Delivery Selection */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Original Delivery Challan *</label>
        <select
          {...register('deliveryId')}
          onChange={onDeliveryChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {deliveries.length === 0 ? (
            <option value="">No past deliveries found for this shopkeeper</option>
          ) : (
            deliveries.map((d) => (
              <option key={d.id} value={d.id}>
                {d.deliveryNumber} ({d.date}) - {d.transactionType.replace('_', ' ')} (
                {d.totalPieces} pcs)
              </option>
            ))
          )}
        </select>
        {errors.deliveryId && (
          <p className="text-xs text-destructive">{errors.deliveryId.message as string}</p>
        )}
      </div>

      {/* Item Selection from Delivery */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Garment Item / Size *</label>
        <select
          {...register('variantId')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {deliveryItems.map((item) => (
            <option key={item.variantId} value={item.variantId}>
              {item.productName} (Size {item.size}) - Delivered: {item.quantityPieces} pcs |
              Returned: {item.returnedPieces} pcs | Eligible: {item.quantityPieces - item.returnedPieces} pcs
            </option>
          ))}
        </select>
        {errors.variantId && (
          <p className="text-xs text-destructive">{errors.variantId.message as string}</p>
        )}
      </div>
    </>
  )
}

