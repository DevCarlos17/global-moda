import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productAdminService } from '@/features/admin/services/productAdminService'

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productAdminService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto eliminado')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar el producto')
    },
  })
}
