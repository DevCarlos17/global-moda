import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orderService } from '@/features/orders/services/orderService'
import { useAuthStore } from '@/store/authStore'
import type { CreateOrderPayload } from '@/features/orders/types/order.types'

interface UpdateOrderParams {
  originalOrderId: string
  payload: CreateOrderPayload
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: ({ originalOrderId, payload }: UpdateOrderParams) => {
      if (!userId) throw new Error('Usuario no autenticado')
      return orderService.createVersion(originalOrderId, userId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Nueva versión del pedido creada')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el pedido')
    },
  })
}
