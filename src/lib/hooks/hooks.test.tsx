import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useRepositoryQuery } from './useRepositoryQuery'
import { useDebounce } from './useDebounce'

describe('useRepositoryQuery', () => {
  it('fetches data and updates loading state', async () => {
    const fetcher = vi.fn().mockResolvedValue(['Item 1', 'Item 2'])

    const { result } = renderHook(() =>
      useRepositoryQuery(fetcher, { initialData: [] as string[], subscribe: false })
    )

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(['Item 1', 'Item 2'])
    expect(result.current.error).toBeNull()
  })

  it('handles fetch errors gracefully', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('Network failure'))

    const { result } = renderHook(() =>
      useRepositoryQuery(fetcher, { initialData: null, subscribe: false })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error?.message).toBe('Network failure')
  })
})

describe('useDebounce', () => {
  it('debounces rapid value changes', async () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
      initialProps: { val: 'initial' },
    })

    expect(result.current).toBe('initial')

    rerender({ val: 'updated 1' })
    rerender({ val: 'updated 2' })

    // Before timer advances
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('updated 2')
    vi.useRealTimers()
  })
})

