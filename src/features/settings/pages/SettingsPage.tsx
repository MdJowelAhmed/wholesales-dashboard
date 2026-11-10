import { useState } from 'react'
import {
  Settings,
  Building2,
  FileText,
  RotateCcw,
  Download,
  Upload,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'
import { toast } from 'sonner'

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'branches' | 'data'>('profile')

  // Profile Form state
  const [companyName, setCompanyName] = useState('Aparajita Garments & Wholesale Ltd.')
  const [factoryAddress, setFactoryAddress] = useState('Plot 42, Konabari Industrial Area, Gazipur, Bangladesh')
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

  // Backup & Restore Handlers
  const handleExportBackup = () => {
    const db = mockStorage.getDatabase()
    const jsonStr = JSON.stringify(db, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Aparajita_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Exported complete ERP database backup (JSON)')
  }

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        if (!parsed.version) {
          throw new Error('Invalid backup schema')
        }
        mockStorage.saveDatabase(parsed)
        toast.success('Successfully restored database from backup!')
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid backup file'
        toast.error(`Restore failed: ${msg}`)
      }
    }
    reader.readAsText(file)
  }

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all factory data to the initial demo state?')) {
      mockStorage.resetDatabase()
      toast.success('Reset database to clean default factory demo state')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Factory & System Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Factory registration, wholesale trade license, branch locations, and system database backup
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-3">
        <Button
          variant={activeTab === 'profile' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('profile')}
          className="text-xs"
        >
          <Building2 className="mr-1.5 h-3.5 w-3.5" />
          Factory Profile
        </Button>
        <Button
          variant={activeTab === 'branches' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('branches')}
          className="text-xs"
        >
          <FileText className="mr-1.5 h-3.5 w-3.5" />
          Warehouses & Depots
        </Button>
        <Button
          variant={activeTab === 'data' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('data')}
          className="text-xs"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Database Backup & Restore
        </Button>
      </div>

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
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
      )}

      {/* Tab: Branches */}
      {activeTab === 'branches' && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Registered Factory Facilities & Hubs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                name: 'Main Manufacturing Complex (Cutting & Sewing Floor)',
                location: 'Plot 42, Konabari Industrial Area, Gazipur',
                type: 'Primary Factory',
                status: 'Operating 24/7',
              },
              {
                name: 'Central Finished Goods Wholesale Depot',
                location: 'Noor Mansion, 2nd Floor, Islampur Market, Old Dhaka',
                type: 'Wholesale Depot',
                status: 'Active',
              },
              {
                name: 'Keraniganj Wholesale Distribution Hub',
                location: 'East Aganagar, Keraniganj, Dhaka',
                type: 'Distribution Hub',
                status: 'Active',
              },
              {
                name: 'Factory Retail Display Outlet',
                location: 'Sector 3, Uttara Model Town, Dhaka',
                type: 'Direct Outlet',
                status: 'Active',
              },
            ].map((b, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
              >
                <div>
                  <div className="font-semibold text-foreground text-sm">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.location}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {b.type}
                  </Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                    {b.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tab: Data Management */}
      {activeTab === 'data' && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Local Browser Database Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <p className="text-muted-foreground">
              Aparajita ERP stores all factory transactions deterministically in browser versioned storage.
              You can export full JSON snapshots or restore them at any time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border bg-muted/10 space-y-2">
                <span className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                  <Download className="h-4 w-4 text-primary" />
                  Export JSON Backup
                </span>
                <p className="text-muted-foreground">
                  Download an audit snapshot containing all production orders, inventory balances, invoices, and ledgers.
                </p>
                <Button onClick={handleExportBackup} variant="outline" size="sm" className="w-full">
                  Download Snapshot
                </Button>
              </div>

              <div className="p-4 rounded-lg border border-border bg-muted/10 space-y-2">
                <span className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                  <Upload className="h-4 w-4 text-emerald-500" />
                  Restore JSON Backup
                </span>
                <p className="text-muted-foreground">
                  Upload an existing Aparajita ERP JSON snapshot to restore all records.
                </p>
                <label className="block">
                  <Button variant="outline" size="sm" className="w-full cursor-pointer" asChild>
                    <span>
                      Choose JSON File
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportBackup}
                        className="hidden"
                      />
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground text-sm">Reset to Demo State</span>
                <p className="text-muted-foreground">
                  Reset the database to default seeded transactions and master data.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetData}
                id="btn-reset-demo-db"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Reset Database
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
