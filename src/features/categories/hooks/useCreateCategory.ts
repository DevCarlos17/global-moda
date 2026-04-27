import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { categoryService } from '@/features/categories/services/categoryService'
import type { Category } from '@/types/database.types'

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Omit<Category, 'id' | 'created_at'>) =>
      categoryService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoría creada')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear categoría')
    },
  })
}
