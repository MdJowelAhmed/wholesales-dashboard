import React, { useState, useRef } from 'react'
import { Upload, Link2, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ProductImageUploadProps {
  value?: string
  onChange: (value: string) => void
}

export function ProductImageUpload({
  value,
  onChange,
}: ProductImageUploadProps): React.JSX.Element {
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setUrlInput('')
    }
  }

  const handleRemove = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-primary" />
          Product Photo / Garment Design
        </label>
        {!value && (
          <div className="flex items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                mode === 'upload'
                  ? 'bg-primary/20 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Upload File
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                mode === 'url'
                  ? 'bg-primary/20 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Image URL
            </button>
          </div>
        )}
      </div>

      {value ? (
        <div className="relative flex items-center gap-3 p-2 rounded-lg border border-border bg-muted/30">
          <img
            src={value}
            alt="Product preview"
            className="h-16 w-16 object-cover rounded-md border border-border bg-background"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              Garment image selected
            </p>
            <p className="text-[10px] text-muted-foreground">
              Ready to be saved with product profile
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : mode === 'upload' ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-3 rounded-lg border border-dashed border-input hover:border-primary/50 bg-muted/10 hover:bg-muted/30 cursor-pointer transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Upload className="h-5 w-5 text-muted-foreground mb-1" />
          <span className="text-xs font-medium text-foreground">
            Click to upload garment photo
          </span>
          <span className="text-[10px] text-muted-foreground">
            PNG, JPG, or WEBP (Local file or snapshot)
          </span>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/garment-image.jpg"
            className="text-xs h-9"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleApplyUrl}
            className="h-9 px-3 text-xs"
          >
            <Link2 className="h-3.5 w-3.5 mr-1" />
            Set URL
          </Button>
        </div>
      )}
    </div>
  )
}

