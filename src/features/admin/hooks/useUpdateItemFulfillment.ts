import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminService } from '@/features/admin/services/adminService'

interface Params {
  itemId: string
  source: 'stock' | 'container' | null
  orderId: string
}

export function useUpdateItemFulfillment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, source }: Params) =>
      adminService.updateItemFulfillmentSource(itemId, source),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] })
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar origen del ítem')
    },
  })
}
