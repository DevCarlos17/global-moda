import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { PageLoader } from '@/components/feedback/Loader'

export function AdminRoute() {
  const role = useAuthStore((s) => s.role)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) return <PageLoader />

  if (role !== 'admin') {
    return <Navigate to="/catalog" replace />
  }

  return <Outlet />
}
