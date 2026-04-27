import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { categoryService } from '@/features/categories/services/categoryService'
import type { Category } from '@/types/database.types'

interface UpdateCategoryParams {
  id: string
  payload: Partial<Omit<Category, 'id' | 'created_at'>>
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: UpdateCategoryParams) =>
      categoryService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoría actualizada')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar categoría')
    },
  })
}
