import { useQuery } from '@tanstack/react-query'
import { categoryService } from '@/features/categories/services/categoryService'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  })
}

export function useCategoryTree() {
  return useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoryService.getTree(),
  })
}
