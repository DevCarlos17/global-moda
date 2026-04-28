import { Search, X } from 'lucide-react'
import { CategoryTree } from '@/features/categories/components/CategoryTree'
import { cn } from '@/utils/cn'
import type { SortOption } from '@/features/catalog/types/product.types'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name_asc',   label: 'Nombre A–Z' },
  { value: 'name_desc',  label: 'Nombre Z–A' },
  { value: 'price_asc',  label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
]

interface ProductFilterSidebarProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
  search: string
  onSearchChange: (v: string) => void
  sort: SortOption
  onSortChange: (v: SortOption) => void
  inStockOnly: boolean
  onInStockOnlyChange: (v: boolean) => void
  collapsed?: boolean
}

export function ProductFilterSidebar({
  selectedId,
  onSelect,
  search,
  onSearchChange,
  sort,
  onSortChange,
  inStockOnly,
  onInStockOnlyChange,
  collapsed = false,
}: ProductFilterSidebarProps) {
  const hasFilters = !!search || !!selectedId || inStockOnly || sort !== 'name_asc'

  const clearAll = () => {
    onSearchChange('')
    onSelect(null)
    onInStockOnlyChange(false)
    onSortChange('name_asc')
  }

  return (
    <aside
      className={cn(
        'hidden md:block flex-shrink-0 border-r border-gray-200 sticky top-16 h-[calc(100dvh-4rem)] bg-white overflow-hidden',
        'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        collapsed ? 'w-0 border-r-0' : 'w-56',
      )}
    >
      <div className="w-56 min-w-[14rem] flex flex-col h-full overflow-y-auto scrollbar-hide">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 border-b border-gray-100">
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">
          Filtros
        </span>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-[10px] text-gray-400 hover:text-gray-700 transition-colors"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Producto o SKU..."
            className="w-full h-8 pl-7 pr-7 rounded-lg border border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Borrar búsqueda"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Sort */}
      <div className="px-3 py-3 border-b border-gray-100">
        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest px-1 mb-2">
          Ordenar
        </p>
        <div className="flex flex-col gap-0.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-colors w-full',
                sort === opt.value
                  ? 'text-gray-900 bg-gray-100'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
              )}
            >
              <span
                className={cn(
                  'size-3 rounded-full border flex-shrink-0 flex items-center justify-center',
                  sort === opt.value ? 'border-gray-900 bg-gray-900' : 'border-gray-300',
                )}
              >
                {sort === opt.value && (
                  <span className="size-1 rounded-full bg-white" />
                )}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Disponibilidad */}
      <div className="px-3 py-3 border-b border-gray-100">
        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest px-1 mb-2">
          Disponibilidad
        </p>
        <button
          onClick={() => onInStockOnlyChange(!inStockOnly)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg w-full text-left transition-colors hover:bg-gray-50"
        >
          <span
            className={cn(
              'size-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
              inStockOnly ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-transparent',
            )}
          >
            {inStockOnly && (
              <svg viewBox="0 0 8 6" width="8" height="6" fill="none">
                <path
                  d="M1 3L3 5L7 1"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span className={cn('text-xs', inStockOnly ? 'text-gray-900' : 'text-gray-500')}>
            Solo con stock
          </span>
        </button>
      </div>

      {/* Categorías */}
      <div className="px-3 py-3 flex-1">
        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest px-1 mb-2">
          Categorías
        </p>
        <button
          onClick={() => onSelect(null)}
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left w-full transition-colors',
            selectedId === null
              ? 'text-gray-900 bg-gray-100'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
          )}
        >
          <span
            className={cn(
              'size-3 rounded-full border flex-shrink-0 flex items-center justify-center',
              selectedId === null ? 'border-gray-900 bg-gray-900' : 'border-gray-300',
            )}
          >
            {selectedId === null && <span className="size-1 rounded-full bg-white" />}
          </span>
          Todos
        </button>
        <div className="mt-0.5">
          <CategoryTree selectedId={selectedId} onSelect={onSelect} />
        </div>
      </div>
      </div>
    </aside>
  )
}
