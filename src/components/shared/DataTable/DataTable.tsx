import React, { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/StateFeedbacks'
import { cn } from '@/lib/utils'

export interface ColumnDef<T> {
  key: string
  header: string
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  searchKey?: keyof T | ((row: T) => string)
  searchPlaceholder?: string
  filterNode?: React.ReactNode
  pageSize?: number
  emptyTitle?: string
  emptyDescription?: string
  onRowClick?: (row: T) => void
  className?: string
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  searchKey,
  searchPlaceholder = 'Search records...',
  filterNode,
  pageSize = 10,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no records matching your criteria.',
  onRowClick,
  className,
}: DataTableProps<T>): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim() || !searchKey) return data

    const query = searchTerm.toLowerCase()
    return data.filter((row) => {
      let val = ''
      if (typeof searchKey === 'function') {
        val = searchKey(row)
      } else {
        val = String(row[searchKey] || '')
      }
      return val.toLowerCase().includes(query)
    })
  }, [data, searchTerm, searchKey])

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData
    return [...filteredData].sort((a, b) => {
      // @ts-expect-error key indexing
      const valA = a[sortKey]
      // @ts-expect-error key indexing
      const valB = b[sortKey]
      if (valA === valB) return 0
      if (valA == null) return 1
      if (valB == null) return -1
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA))
    })
  }, [filteredData, sortKey, sortAsc])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, safeCurrentPage, pageSize])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filters Bar */}
      {(searchKey || filterNode) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {searchKey && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 text-xs sm:text-sm h-9"
              />
            </div>
          )}
          {filterNode && (
            <div className="flex items-center gap-2 flex-wrap">{filterNode}</div>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {paginatedData.length === 0 ? (
          <div className="p-8">
            <EmptyState title={emptyTitle} description={emptyDescription} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        'h-10 px-4 text-left align-middle font-medium text-xs text-muted-foreground uppercase tracking-wider select-none',
                        col.headerClassName
                      )}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                        >
                          <span>{col.header}</span>
                          <ArrowUpDown className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedData.map((row, index) => (
                  <tr
                    key={row.id ? String(row.id) : index}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      'transition-colors hover:bg-muted/30',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn('p-4 align-middle text-foreground', col.className)}
                      >
                        {col.cell
                          ? col.cell(row)
                          : // @ts-expect-error fallback property
                            String(row[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {sortedData.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            <div>
              Showing{' '}
              <span className="font-semibold text-foreground">
                {(currentPage - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-foreground">
                {Math.min(currentPage * pageSize, sortedData.length)}
              </span>{' '}
              of <span className="font-semibold text-foreground">{sortedData.length}</span>{' '}
              entries
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                aria-label="First page"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              <span className="px-2 font-medium text-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Last page"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
