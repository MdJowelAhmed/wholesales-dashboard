/**
 * Utility to export tabular data to a real downloadable CSV file in the browser
 */
export function exportToCsv<T extends Record<string, unknown>>(
  filename: string,
  data: T[],
  columnHeaders?: Record<keyof T, string>
): void {
  if (data.length === 0) return

  const keys = Object.keys(columnHeaders || data[0]) as (keyof T)[]

  // Header row
  const headerRow = keys
    .map((key) => {
      const label = columnHeaders ? columnHeaders[key] : String(key)
      return `"${String(label).replace(/"/g, '""')}"`
    })
    .join(',')

  // Data rows
  const dataRows = data.map((row) => {
    return keys
      .map((key) => {
        const val = row[key]
        if (val === null || val === undefined) return '""'
        const strVal = String(val).replace(/"/g, '""')
        return `"${strVal}"`
      })
      .join(',')
  })

  const csvContent = [headerRow, ...dataRows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

  if (typeof window !== 'undefined') {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
