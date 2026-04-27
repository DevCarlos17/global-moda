import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { containerService } from '@/features/containers/services/containerService'
import { orderService } from '@/features/orders/services/orderService'
import type { Container, ContainerStatus } from '@/types/database.types'

interface UpdateContainerParams {
  id: string
  payload: Partial<Omit<Container, 'id' | 'created_at' | 'updated_at'>>
}

export function useUpdateContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: UpdateContainerParams) =>
      containerService.update(id, payload),
    onSuccess: async (_, { id, payload }) => {
      queryClient.invalidateQueries({ queryKey: ['containers'] })

      // Auto-sync linked pre-orders when status changes
      if (payload.status) {
        try {
          const synced = await orderService.syncOrdersToContainerStatus(
            id,
            payload.status as ContainerStatus,
          )
          if (synced > 0) {
            toast.success(
              `Container actualizado · ${synced} pedido${synced !== 1 ? 's' : ''} sincronizado${synced !== 1 ? 's' : ''}`,
            )
            queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
            queryClient.invalidateQueries({ queryKey: ['orders'] })
          } else {
            toast.success('Container actualizado')
          }
        } catch {
          toast.success('Container actualizado')
        }
      } else {
        toast.success('Container actualizado')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el container')
    },
  })
}
