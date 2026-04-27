import { useMemo } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { useProducts } from '@/features/catalog/hooks/useProducts'
import { useCategoryTree } from '@/features/categories/hooks/useCategories'
import type { SortOption } from '@/features/catalog/types/product.types'
import type { CategoryWithChildren } from '@/types/database.types'

interface SearchProductsParams {
  search: string
  categoryId?: string | null
  sort?: SortOption
}

function collectDescendantIds(cat: CategoryWithChildren): string[] {
  return [cat.id, ...cat.children.flatMap(collectDescendantIds)]
}

function findNode(
  cats: CategoryWithChildren[],
  id: string,
): CategoryWithChildren | null {
  for (const cat of cats) {
    if (cat.id === id) return cat
    const found = findNode(cat.children, id)
    if (found) return found
  }
  return null
}

export function useSearchProducts({ search, categoryId, sort }: SearchProductsParams) {
  const debouncedSearch = useDebounce(search, 400)
  const { data: tree = [] } = useCategoryTree()

  const categoryIds = useMemo(() => {
    if (!categoryId) return undefined
    const node = findNode(tree, categoryId)
    return node ? collectDescendantIds(node) : [categoryId]
  }, [categoryId, tree])

  return useProducts({
    search: debouncedSearch || undefined,
    categoryIds,
    sort,
  })
}
