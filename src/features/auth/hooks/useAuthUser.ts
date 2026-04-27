import { useAuthStore } from '@/store/authStore'

export function useAuthUser() {
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)

  return { user, role, isAuthenticated, isLoading }
}
