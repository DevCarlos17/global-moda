import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,              // always stale — any invalidation triggers immediate refetch
      gcTime: 1000 * 60 * 5,    // keep unused data in cache for 5 minutes
      retry: 1,
      refetchOnWindowFocus: true, // refetch when tab regains focus (safety net)
    },
  },
})

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
