/**
 * Granular invalidation scopes for mockStorage change notifications.
 * Repositories tag writes; useRepositoryQuery subscribes to relevant scopes only.
 */
export const STORAGE_SCOPES = {
  ALL: 'all',
  PRODUCTS: 'products',
  VARIANTS: 'variants',
  INVENTORY: 'inventory',
  MATERIALS: 'materials',
  SHOPKEEPERS: 'shopkeepers',
  CUSTOMERS: 'customers',
  SUPPLIERS: 'suppliers',
  EMPLOYEES: 'employees',
  PRODUCTION: 'production',
  SALES: 'sales',
  FINANCE: 'finance',
} as const

export type StorageInvalidationScope =
  (typeof STORAGE_SCOPES)[keyof typeof STORAGE_SCOPES]

export function scopesShouldInvalidate(
  changedScopes: StorageInvalidationScope[],
  watchedScopes: StorageInvalidationScope[]
): boolean {
  if (changedScopes.includes(STORAGE_SCOPES.ALL)) return true
  if (watchedScopes.includes(STORAGE_SCOPES.ALL)) return true
  return changedScopes.some((scope) => watchedScopes.includes(scope))
}