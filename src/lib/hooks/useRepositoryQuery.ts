import { useState, useEffect, useCallback, useRef } from 'react'
import { mockStorage } from '@/mocks/storage/localStorageAdapter'
import {
  STORAGE_SCOPES,
  scopesShouldInvalidate,
  StorageInvalidationScope,
} from '@/mocks/storage/storageScopes'

export interface UseRepositoryQueryOptions<T> {
  deps?: unknown[]
  subscribe?: boolean
  initialData?: T
  /** Refetch only when a overlapping storage scope is invalidated */
  invalidationScopes?: StorageInvalidationScope[]
}

export interface UseRepositoryQueryResult<T> {
  data: T
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Custom hook to execute repository queries with automatic lifecycle management
 * and reactive mockStorage synchronization.
 */
export function useRepositoryQuery<T>(
  fetcher: () => Promise<T>,
  options: UseRepositoryQueryOptions<T> = {}
): UseRepositoryQueryResult<T> {
  const {
    deps = [],
    subscribe = true,
    initialData,
    invalidationScopes = [STORAGE_SCOPES.ALL],
  } = options
  const watchedScopesRef = useRef(invalidationScopes)
  watchedScopesRef.current = invalidationScopes
  const [data, setData] = useState<T>(initialData as T)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const isMountedRef = useRef(true)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const executeFetch = useCallback(async () => {
    try {
      const result = await fetcherRef.current()
      if (isMountedRef.current) {
        setData(result)
        setError(null)
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    executeFetch()

    let unsubscribe: (() => void) | undefined
    if (subscribe) {
      unsubscribe = mockStorage.subscribe((changedScopes) => {
        if (scopesShouldInvalidate(changedScopes, watchedScopesRef.current)) {
          executeFetch()
        }
      })
    }

    return () => {
      isMountedRef.current = false
      if (unsubscribe) {
        unsubscribe()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, refetch: executeFetch }
}

