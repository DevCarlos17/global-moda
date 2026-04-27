import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/features/admin/services/adminService'

export function usePendingOrdersCount() {
  return useQuery({
    queryKey: ['admin', 'pending-count'],
    queryFn: () => adminService.getPendingOrdersCount(),
    // No polling needed — useOrdersRealtime in AdminLayout handles instant invalidation
  })
}
