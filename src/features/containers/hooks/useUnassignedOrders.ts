import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/features/admin/services/adminService'

export function useUnassignedPreOrders() {
  return useQuery({
    queryKey: ['unassigned-pre-orders'],
    queryFn: () => adminService.getUnassignedPreOrders(),
  })
}
