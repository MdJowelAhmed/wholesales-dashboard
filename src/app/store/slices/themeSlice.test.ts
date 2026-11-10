import { describe, it, expect, beforeEach } from 'vitest'
import themeReducer, { setThemeMode, syncSystemTheme } from './themeSlice'

describe('themeSlice', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('updates mode and resolvedTheme when setThemeMode is dispatched', () => {
    const initialState = {
      mode: 'light' as const,
      resolvedTheme: 'light' as const,
    }

    const state = themeReducer(initialState, setThemeMode('dark'))
    expect(state.mode).toBe('dark')
    expect(state.resolvedTheme).toBe('dark')
    expect(localStorage.getItem('garments_saas_theme')).toBe('dark')
  })

  it('resolves system mode', () => {
    const initialState = {
      mode: 'system' as const,
      resolvedTheme: 'light' as const,
    }

    const state = themeReducer(initialState, syncSystemTheme())
    expect(state.mode).toBe('system')
    expect(['light', 'dark']).toContain(state.resolvedTheme)
  })
})
