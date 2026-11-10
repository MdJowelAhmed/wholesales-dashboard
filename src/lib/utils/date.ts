import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns'

/**
 * Safely parse date input into Date object
 */
export function parseDateSafe(date: string | Date | null | undefined): Date | null {
  if (!date) return null
  const parsed = typeof date === 'string' ? parseISO(date) : date
  return isValid(parsed) ? parsed : null
}

/**
 * Format date string or Date object with standard fallback
 */
export function formatDate(
  date: string | Date | null | undefined,
  pattern = 'dd MMM yyyy'
): string {
  const parsed = parseDateSafe(date)
  if (!parsed) return '—'
  return format(parsed, pattern)
}

/**
 * Format date and time
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  pattern = 'dd MMM yyyy, hh:mm a'
): string {
  const parsed = parseDateSafe(date)
  if (!parsed) return '—'
  return format(parsed, pattern)
}

/**
 * Relative time description (e.g. "3 days ago")
 */
export function getRelativeTimeString(date: string | Date | null | undefined): string {
  const parsed = parseDateSafe(date)
  if (!parsed) return '—'
  return formatDistanceToNow(parsed, { addSuffix: true })
}

/**
 * Get current date as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

