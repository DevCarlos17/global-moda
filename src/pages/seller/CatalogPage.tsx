import { useMemo, useState } from 'react'
import { SlidersHorizontal, X, PanelLeft } from 'lucide-react'
import { ProductGrid } from '@/features/catalog/components/ProductGrid'
import { ProductSearchBar } from '@/features/catalog/components/ProductSearchBar'
import { ProductFilterSidebar } from '@/features/catalog/components/ProductFilterSidebar'
import { useSearchProducts } from '@/features/catalog/hooks/useSearchProducts'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { cn } from '@/utils/cn'
import type { SortOption } from '@/features/catalog/types/product.types'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name_asc',   label: 'Nombre A–Z' },
  { value: 'name_desc',  label: 'Nombre Z–A' },
  { value: 'price_asc',  label: 'Precio ↑' },
  { value: 'price_desc', label: 'Precio ↓' },
]

export function CatalogPage() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [sort, setSort] = useState<SortOption>('name_asc')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const { data: products, isLoading, error, refetch } = useSearchProducts({ search, categoryId, sort })
  const { data: categories = [] } = useCategories()

  const filteredProducts = useMemo(() => {
    if (!products) return []
    if (!inStockOnly) return products
    return products.filter((p) => {
      const hasVariants = (p.variants?.length ?? 0) > 0
      return hasVariants
        ? p.variants!.some((v) => v.is_active && v.stock_quantity > 0)
        : p.stock_quantity > 0
    })
  }, [products, inStockOnly])

  const activeFilterCount = [!!categoryId, !!search, inStockOnly, sort !== 'name_asc'].filter(Boolean).length

  const activeFilters = [
    search ? { key: 'search', label: `"${search}"`, clear: () => setSearch('') } : null,
    categoryId ? { key: 'category', label: categories.find((c) => c.id === categoryId)?.name ?? 'Categoría', clear: () => setCategoryId(null) } : null,
    inStockOnly ? { key: 'stock', label: 'Con stock', clear: () => setInStockOnly(false) } : null,
    sort !== 'name_asc' ? { key: 'sort', label: SORT_OPTIONS.find((o) => o.value === sort)?.label ?? sort, clear: () => setSort('name_asc') } : null,
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[]

  return (
    <div className="flex">
      {/* Desktop filter sidebar */}
      <ProductFilterSidebar
        selectedId={categoryId}
        onSelect={setCategoryId}
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        inStockOnly={inStockOnly}
        onInStockOnlyChange={setInStockOnly}
        collapsed={sidebarCollapsed}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">

        {/* Toolbar */}
        <div className="px-4 py-2.5 border-b border-gray-200 sticky top-16 bg-white z-20 flex items-center gap-3">
          {/* Desktop: sidebar toggle */}
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="hidden md:flex items-center justify-center size-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label={sidebarCollapsed ? 'Expandir filtros' : 'Colapsar filtros'}
          >
            <PanelLeft size={16} />
          </button>

          {/* Mobile: search input */}
          <div className="flex-1 md:hidden">
            <ProductSearchBar value={search} onChange={setSearch} />
          </div>

          {/* Desktop: result count */}
          {!isLoading && (
            <p className="hidden md:block text-xs text-gray-400">
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? 'producto' : 'productos'}
            </p>
          )}

          {/* Mobile: filter toggle */}
          <button
            onClick={() => setMobileFilterOpen((v) => !v)}
            className={cn(
              'md:hidden flex items-center gap-1.5 px-3 h-9 rounded-lg border text-sm transition-colors flex-shrink-0',
              mobileFilterOpen || activeFilterCount > 0
                ? 'border-gray-900 text-gray-900 bg-gray-100'
                : 'border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50',
            )}
          >
            <SlidersHorizontal size={13} />
            Filtros
            {activeFilterCount > 0 && (
              <span className="size-4 flex items-center justify-center bg-gray-900 rounded-full text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile bottom sheet */}
        <div
          className={cn(
            'fixed inset-0 z-40 md:hidden transition-opacity duration-300',
            mobileFilterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
          )}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
          {/* Sheet */}
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[82dvh] flex flex-col',
              'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
              mobileFilterOpen ? 'translate-y-0' : 'translate-y-full',
            )}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <span className="font-semibold text-sm text-gray-900">Filtros</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-4 py-4 flex flex-col gap-5">
              {/* Sort */}
              <div>
                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">Ordenar</p>
                <div className="flex flex-wrap gap-1.5">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setSort(o.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs border transition-colors',
                        sort === o.value
                          ? 'border-gray-900 text-gray-900 bg-gray-100 font-medium'
                          : 'border-gray-200 text-gray-500 hover:text-gray-900',
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Availability */}
              <div>
                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">Disponibilidad</p>
                <button onClick={() => setInStockOnly((v) => !v)} className="flex items-center gap-2 w-fit">
                  <span
                    className={cn(
                      'size-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
                      inStockOnly ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-transparent',
                    )}
                  >
                    {inStockOnly && (
                      <svg viewBox="0 0 8 6" width="8" height="6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className={cn('text-sm', inStockOnly ? 'text-gray-900 font-medium' : 'text-gray-500')}>
                    Solo con stock
                  </span>
                </button>
              </div>
              {/* Categories */}
              <div>
                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">Categoría</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setCategoryId(null)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs border transition-colors',
                      categoryId === null
                        ? 'border-gray-900 text-gray-900 bg-gray-100 font-medium'
                        : 'border-gray-200 text-gray-500 hover:text-gray-900',
                    )}
                  >
                    Todos
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs border transition-colors',
                        categoryId === cat.id
                          ? 'border-gray-900 text-gray-900 bg-gray-100 font-medium'
                          : 'border-gray-200 text-gray-500 hover:text-gray-900',
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Footer - apply button */}
            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-100">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full h-11 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                Ver {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
              </button>
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-gray-100 bg-white">
            {activeFilters.map((f) => (
              <button
                key={f.key}
                onClick={f.clear}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {f.label}
                <X size={10} />
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        <div className="p-4">
          <ProductGrid
            products={filteredProducts}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
          />
        </div>
      </div>
    </div>
  )
}
