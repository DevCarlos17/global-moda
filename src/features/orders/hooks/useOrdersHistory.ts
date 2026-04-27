import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/features/orders/services/orderService'
import { useAuthStore } from '@/store/authStore'

export function useOrdersHistory() {
  const userId = useAuthStore((s) => s.user?.id)

  return useQuery({
    queryKey: ['orders', 'seller', userId],
    queryFn: () => orderService.getOrdersByUser(userId!),
    enabled: Boolean(userId),
  })
}
