import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { productAdminService } from '@/features/admin/services/productAdminService'
import type { Product } from '@/types/database.types'

export function useCreateProduct(afterCreate?: (product: Product) => Promise<void>) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const afterCreateRef = useRef(afterCreate)
  afterCreateRef.current = afterCreate

  return useMutation({
    mutationFn: (payload: Omit<Product, 'id' | 'created_at' | 'updated_at'>) =>
      productAdminService.createProduct(payload),
    onSuccess: async (product) => {
      if (afterCreateRef.current) await afterCreateRef.current(product)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto creado exitosamente')
      navigate('/admin/inventory')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear el producto')
    },
  })
}
