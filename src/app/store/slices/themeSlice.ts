import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
  resolvedTheme: 'light' | 'dark'
}

const getInitialMode = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('garments_saas_theme')
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved
    }
  }
  return 'system'
}

const resolveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }
  return mode
}

const initialMode = getInitialMode()

const initialState: ThemeState = {
  mode: initialMode,
  resolvedTheme: resolveTheme(initialMode),
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload
      state.resolvedTheme = resolveTheme(action.payload)
      if (typeof window !== 'undefined') {
        localStorage.setItem('garments_saas_theme', action.payload)
        if (state.resolvedTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    },
    syncSystemTheme: (state) => {
      if (state.mode === 'system') {
        state.resolvedTheme = resolveTheme('system')
        if (typeof window !== 'undefined') {
          if (state.resolvedTheme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      }
    },
  },
})

export const { setThemeMode, syncSystemTheme } = themeSlice.actions
export default themeSlice.reducer
