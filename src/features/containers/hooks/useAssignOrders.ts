import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orderService } from '@/features/orders/services/orderService'

export function useAssignOrderToContainer(containerId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderIds: string[]) =>
      Promise.all(orderIds.map((id) => orderService.assignToContainer(id, containerId))),
    onSuccess: (_, orderIds) => {
      queryClient.invalidateQueries({ queryKey: ['containers', containerId, 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['containers', containerId, 'aggregation'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['unassigned-pre-orders'] })
      toast.success(
        orderIds.length === 1
          ? 'Pedido asignado al container'
          : `${orderIds.length} pedidos asignados al container`,
      )
    },
    onError: () => {
      toast.error('Error al asignar pedidos')
    },
  })
}

export function useUnassignOrderFromContainer(containerId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) => orderService.unassignFromContainer(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers', containerId, 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['containers', containerId, 'aggregation'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['unassigned-pre-orders'] })
      toast.success('Pedido removido del container')
    },
    onError: () => {
      toast.error('Error al remover el pedido')
    },
  })
}
