import { z } from 'zod'

export const paymentSchema = z.object({
  partyType: z.enum(['shopkeeper', 'customer', 'supplier', 'employee']),
  partyId: z.string().min(1, 'Please select a party'),
  date: z.string().min(1, 'Date is required'),
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'cheque', 'bkash', 'nagad']),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

export type PaymentFormData = z.infer<typeof paymentSchema>

