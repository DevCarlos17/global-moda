export type SortOption = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'

export interface ProductFilters {
  search?: string
  categoryId?: string | null
  categoryIds?: string[]
  isActive?: boolean
  minPrice?: number
  maxPrice?: number
  sort?: SortOption
}
