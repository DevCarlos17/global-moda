import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminService } from '@/features/admin/services/adminService'

interface UpdateOrderStatusParams {
  id: string
  status: string
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: UpdateOrderStatusParams) =>
      adminService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Estado del pedido actualizado')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el estado')
    },
  })
}
