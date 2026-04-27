import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { orderService } from '@/features/orders/services/orderService'
import { useCartStore } from '@/features/cart/store/cartStore'
import { cartService } from '@/features/cart/services/cartService'
import { useAuthStore } from '@/store/authStore'
import type { CreateOrderPayload } from '@/features/orders/types/order.types'

export function useCreateOrder() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.user?.id)
  const clearCart = useCartStore((s) => s.clearCart)

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => {
      if (!userId) throw new Error('Usuario no autenticado')
      return orderService.createOrder(userId, payload)
    },
    onSuccess: async (order) => {
      clearCart()
      if (userId) await cartService.clearCart(userId)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      if (order.container_id) {
        queryClient.invalidateQueries({ queryKey: ['containers', order.container_id, 'orders'] })
        queryClient.invalidateQueries({ queryKey: ['containers', order.container_id, 'aggregation'] })
      }

      navigate('/orders/success', {
        state: { orderId: order.id, orderNumber: order.order_number },
      })
      toast.success('¡Pedido creado exitosamente!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear el pedido')
    },
  })
}
