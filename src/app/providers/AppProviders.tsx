import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { store } from '@/app/store/store'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { syncSystemTheme } from '@/app/store/slices/themeSlice'

interface AppProvidersProps {
  children: React.ReactNode
}

function ThemeWatcher({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const { mode, resolvedTheme } = useAppSelector((state) => state.theme)

  useEffect(() => {
    // Apply resolved theme class to root
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [resolvedTheme])

  useEffect(() => {
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => dispatch(syncSystemTheme())
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [mode, dispatch])

  return <>{children}</>
}

export function AppProviders({ children }: AppProvidersProps): React.JSX.Element {
  return (
    <Provider store={store}>
      <ThemeWatcher>
        {children}
        <Toaster richColors position="top-right" />
      </ThemeWatcher>
    </Provider>
  )
}
