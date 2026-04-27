import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/features/orders/services/orderService'

export function useSellerOrders(sellerId: string) {
  return useQuery({
    queryKey: ['orders', 'seller', sellerId],
    queryFn: () => orderService.getOrdersByUser(sellerId),
    enabled: Boolean(sellerId),
  })
}
