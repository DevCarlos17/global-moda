import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { productAdminService } from '@/features/admin/services/productAdminService'
import type { Product } from '@/types/database.types'

interface UpdateProductParams {
  id: string
  payload: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ id, payload }: UpdateProductParams) =>
      productAdminService.updateProduct(id, payload),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products', vars.id] })
      toast.success('Producto actualizado')
      navigate('/admin/products')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el producto')
    },
  })
}
