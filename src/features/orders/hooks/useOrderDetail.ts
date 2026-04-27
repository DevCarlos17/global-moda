import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/features/orders/services/orderService'

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => orderService.getOrderById(id),
    enabled: Boolean(id),
  })
}
