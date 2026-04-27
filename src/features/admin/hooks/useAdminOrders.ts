import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/features/admin/services/adminService'

export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => adminService.getOrders(),
  })
}
