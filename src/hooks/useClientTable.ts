import { useState, useMemo } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import type { SortParams } from '@/types/common.types'

interface UseClientTableOptions<T> {
  data: T[]
  searchFields?: (keyof T)[]
  pageSize?: number
  filterFn?: (item: T, filters: Record<string, string>) => boolean
}

export interface UseClientTableReturn<T> {
  paginatedData: T[]
  totalItems: number
  currentPage: number
  totalPages: number
  setPage: (page: number) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  sortParams: SortParams | null
  handleSort: (field: string) => void
  filters: Record<string, string>
  setFilter: (key: string, value: string) => void
  clearFilters: () => void
  startIndex: number
  endIndex: number
}

export function useClientTable<T>({
  data,
  searchFields = [],
  pageSize = 10,
  filterFn,
}: UseClientTableOptions<T>): UseClientTableReturn<T> {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQueryRaw] = useState('')
  const [sortParams, setSortParams] = useState<SortParams | null>(null)
  const [filters, setFiltersState] = useState<Record<string, string>>({})

  const debouncedSearch = useDebounce(searchQuery, 400)

  const setSearchQuery = (q: string) => {
    setSearchQueryRaw(q)
    setCurrentPage(1)
  }

  const setFilter = (key: string, value: string) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFiltersState({})
    setCurrentPage(1)
  }

  const handleSort = (field: string) => {
    setSortParams((prev) => {
      if (prev?.field === field) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { field, direction: 'asc' }
    })
    setCurrentPage(1)
  }

  const filteredData = useMemo(() => {
    let result = [...data]

    // Search
    if (debouncedSearch && searchFields.length > 0) {
      const query = debouncedSearch.toLowerCase()
      result = result.filter((item) =>
        searchFields.some((field) => {
          const val = item[field]
          return typeof val === 'string' && val.toLowerCase().includes(query)
        }),
      )
    }

    // Custom filter function
    if (filterFn) {
      const hasActiveFilters = Object.values(filters).some(
        (v) => v !== '' && v !== 'all',
      )
      if (hasActiveFilters) {
        result = result.filter((item) => filterFn(item, filters))
      }
    }

    // Sort
    if (sortParams) {
      result.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortParams.field]
        const bVal = (b as Record<string, unknown>)[sortParams.field]

        if (aVal == null && bVal == null) return 0
        if (aVal == null) return 1
        if (bVal == null) return -1

        let cmp = 0
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          cmp = aVal.localeCompare(bVal)
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          cmp = aVal - bVal
        } else {
          cmp = String(aVal).localeCompare(String(bVal))
        }

        return sortParams.direction === 'asc' ? cmp : -cmp
      })
    }

    return result
  }, [data, debouncedSearch, searchFields, sortParams, filters, filterFn])

  const totalItems = filteredData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const sliceStart = (safePage - 1) * pageSize
  const sliceEnd = Math.min(sliceStart + pageSize, totalItems)
  const paginatedData = filteredData.slice(sliceStart, sliceEnd)

  return {
    paginatedData,
    totalItems,
    currentPage: safePage,
    totalPages,
    setPage: setCurrentPage,
    searchQuery,
    setSearchQuery,
    sortParams,
    handleSort,
    filters,
    setFilter,
    clearFilters,
    startIndex: totalItems === 0 ? 0 : sliceStart + 1,
    endIndex: sliceEnd,
  }
}
