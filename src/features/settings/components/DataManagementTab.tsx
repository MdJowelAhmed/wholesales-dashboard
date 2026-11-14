import { Download, Upload, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'
import { STORAGE_SCOPES } from '@/mocks/storage/storageScopes'
import { toast } from 'sonner'
import { getTodayDateString } from '@/lib/utils/date'

export function DataManagementTab() {
  const handleExportBackup = () => {
    const db = mockStorage.getDatabase()
    const jsonStr = JSON.stringify(db, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Aparajita_ERP_Backup_${getTodayDateString()}.json`
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
        mockStorage.saveDatabase(parsed, [STORAGE_SCOPES.ALL])
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
  )
}

