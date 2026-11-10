import { useState } from 'react'
import { Settings, Building2, FileText, RotateCcw, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FactoryProfileTab } from '../components/FactoryProfileTab'
import { BranchesTab } from '../components/BranchesTab'
import { DataManagementTab } from '../components/DataManagementTab'
import { ProductAttributesTab } from '../components/ProductAttributesTab'

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'branches' | 'attributes' | 'data'>('profile')

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
          variant={activeTab === 'attributes' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('attributes')}
          className="text-xs"
        >
          <Tag className="mr-1.5 h-3.5 w-3.5" />
          Categories & Sizes
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

      {/* Tab Panels */}
      {activeTab === 'profile' && <FactoryProfileTab />}
      {activeTab === 'branches' && <BranchesTab />}
      {activeTab === 'attributes' && <ProductAttributesTab />}
      {activeTab === 'data' && <DataManagementTab />}
    </div>
  )
}
