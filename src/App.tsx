import { useEffect } from 'react'
import { QueryProvider } from '@/app/providers/query-provider'
import { SonnerProvider } from '@/app/providers/sonner-provider'
import { AppRouter } from '@/app/router/app-router'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'

function AuthInit() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    let cleanup: (() => void) | undefined
    initialize().then((fn) => { cleanup = fn })
    return () => cleanup?.()
  }, [initialize])

  return null
}

function ThemeInit() {
  const theme = useThemeStore((s) => s.theme)

  // Apply synchronously during render to prevent FOUC when the
  // persisted theme is loaded from localStorage on first mount.
  document.documentElement.classList.toggle('light', theme === 'light')
  document.documentElement.classList.toggle('dark', theme !== 'light')

  return null
}

function App() {
  return (
    <QueryProvider>
      <AuthInit />
      <ThemeInit />
      <AppRouter />
      <SonnerProvider />
    </QueryProvider>
  )
}

export default App
