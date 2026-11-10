import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export function FactoryProfileTab() {
  const [companyName, setCompanyName] = useState('Aparajita Garments & Wholesale Ltd.')
  const [factoryAddress, setFactoryAddress] = useState(
    'Plot 42, Konabari Industrial Area, Gazipur, Bangladesh'
  )
  const [tradeLicense, setTradeLicense] = useState('TRAD/GZP/2026/08912')
  const [binNumber, setBinNumber] = useState('BIN-0029182910-2026')
  const [phone, setPhone] = useState('+880 1711-223344')
  const [email, setEmail] = useState('operations@aparajitagarments.com')
  const [saving, setSaving] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Factory company profile saved successfully')
    }, 400)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base text-foreground">Commercial Company Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-medium text-foreground">Company / Registered Factory Name</label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-background text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Industrial Factory Address</label>
            <Input
              value={factoryAddress}
              onChange={(e) => setFactoryAddress(e.target.value)}
              className="bg-background text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-foreground">Trade License #</label>
              <Input
                value={tradeLicense}
                onChange={(e) => setTradeLicense(e.target.value)}
                className="bg-background font-mono text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-foreground">Tax BIN / TIN Number</label>
              <Input
                value={binNumber}
                onChange={(e) => setBinNumber(e.target.value)}
                className="bg-background font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-foreground">Corporate Phone</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-background text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-foreground">Official Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground">
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {saving ? 'Saving...' : 'Save Factory Profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

