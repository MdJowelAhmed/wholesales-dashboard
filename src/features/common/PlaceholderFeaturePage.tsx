import React from 'react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PlaceholderFeaturePageProps {
  title: string
  subtitle: string
  phase: number
}

export function PlaceholderFeaturePage({
  title,
  subtitle,
  phase,
}: PlaceholderFeaturePageProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={subtitle}
        actions={
          <Badge variant="outline" className="text-xs">
            Scheduled for Phase {phase}
          </Badge>
        }
      />
      <Card>
        <CardContent className="p-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-secondary text-primary font-bold text-lg mb-2">
            P{phase}
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {title} Module Foundation Ready
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Underlying repository data models, strict TypeScript schemas, and financial
            utilities are initialized. Full functional UI forms, details views, and tables will be
            implemented in Phase {phase}.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
