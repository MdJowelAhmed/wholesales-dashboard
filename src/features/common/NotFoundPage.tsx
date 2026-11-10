import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage(): React.JSX.Element {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4 shadow-sm">
        <FileQuestion className="h-8 w-8" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
        404 — Page Not Found
      </span>
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-2">
        We couldn&apos;t find this screen
      </h1>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        The URL you entered does not match any route in Aparajita ERP. Check the sidebar navigation or
        return to the main dashboard.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        <Button asChild size="sm">
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}

