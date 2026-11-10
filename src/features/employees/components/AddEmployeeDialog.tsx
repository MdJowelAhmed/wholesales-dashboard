import React, { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
import { employeesRepository } from '@/mocks/repositories/employeesRepository'
import { WageRateType } from '@/lib/calculations/financialCalculations'
import { toast } from 'sonner'
import { getTodayDateString } from '@/lib/utils/date'

const employeeSchema = z.object({
  name: z.string().min(3, 'Employee name is required'),
  employeeCode: z.string().min(2, 'Employee code is required (e.g. EMP-OPR-12)'),
  phone: z.string().min(6, 'Phone is required'),
  address: z.string().min(3, 'Address is required'),
  designation: z.string().min(2, 'Designation is required'),
  compensationMethod: z.enum(['piece', 'dozen', 'monthly_fixed', 'monthly_plus_incentive']),
  ratePerPiece: z.number().min(0).optional(),
  ratePerDozen: z.number().min(0).optional(),
  monthlySalary: z.number().min(0).optional(),
})

type EmployeeFormData = z.infer<typeof employeeSchema>

function generateEmployeeCode(): string {
  return `EMP-${Date.now().toString().slice(-4)}`
}

interface AddEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddEmployeeDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddEmployeeDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      employeeCode: generateEmployeeCode(),
      phone: '+880 1',
      address: 'Mirpur, Dhaka',
      designation: 'Sewing Machine Operator',
      compensationMethod: 'piece',
      ratePerPiece: 18,
      ratePerDozen: 140,
      monthlySalary: 22000,
    },
  })

  const compensation = useWatch({ control, name: 'compensationMethod' })

  const onSubmit = async (data: EmployeeFormData) => {
    setLoading(true)
    try {
      await employeesRepository.createEmployee({
        name: data.name,
        employeeCode: data.employeeCode.toUpperCase(),
        phone: data.phone,
        address: data.address,
        designation: data.designation,
        joiningDate: getTodayDateString(),
        compensationMethod: data.compensationMethod as WageRateType,
        ratePerPiece: data.compensationMethod === 'piece' ? data.ratePerPiece : undefined,
        ratePerDozen: data.compensationMethod === 'dozen' ? data.ratePerDozen : undefined,
        monthlySalary:
          data.compensationMethod.startsWith('monthly') ? data.monthlySalary : undefined,
        status: 'active',
      })

      toast.success('Employee registered', {
        description: `${data.name} added to worker roster.`,
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Failed to register employee')
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
            Add Garment Factory Worker
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Worker Name *</label>
              <Input placeholder="e.g. Sultana Begum" {...register('name')} />
              {errors.name && (
                <p className="text-[11px] text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Employee Code *</label>
              <Input placeholder="e.g. EMP-OPR-12" {...register('employeeCode')} />
              {errors.employeeCode && (
                <p className="text-[11px] text-destructive">{errors.employeeCode.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Phone *</label>
              <Input placeholder="+880 18..." {...register('phone')} />
              {errors.phone && (
                <p className="text-[11px] text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Designation *</label>
              <Input placeholder="e.g. Overlock Operator" {...register('designation')} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Address / Residence</label>
            <Input placeholder="Section 11, Mirpur, Dhaka" {...register('address')} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Compensation Method *
            </label>
            <select
              {...register('compensationMethod')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="piece">Per-Piece Rate (৳ / completed piece)</option>
              <option value="dozen">Per-Dozen Rate (৳ / completed dozen)</option>
              <option value="monthly_fixed">Fixed Monthly Salary</option>
              <option value="monthly_plus_incentive">Monthly Salary + Target Incentive</option>
            </select>
          </div>

          {compensation === 'piece' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Applicable Piece Rate (৳ / piece) *
              </label>
              <Input type="number" step="any" placeholder="18" {...register('ratePerPiece', { valueAsNumber: true })} />
            </div>
          )}

          {compensation === 'dozen' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Applicable Dozen Rate (৳ / dozen) *
              </label>
              <Input type="number" step="any" placeholder="140" {...register('ratePerDozen', { valueAsNumber: true })} />
            </div>
          )}

          {compensation.startsWith('monthly') && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Monthly Salary Amount (৳) *
              </label>
              <Input type="number" step="any" placeholder="22000" {...register('monthlySalary', { valueAsNumber: true })} />
            </div>
          )}

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
              {loading ? 'Registering...' : 'Register Worker'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
