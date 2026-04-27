import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/features/admin/services/adminService'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminService.getDashboardStats(),
  })
}
