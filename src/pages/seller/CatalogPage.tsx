import { useMemo, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
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

  const { data: products, isLoading, error, refetch } = useSearchProducts({ search, categoryId, sort })
  const { data: categories = [] } = useCategories()

  // Client-side in-stock filter
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
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">

        {/* Toolbar */}
        <div className="px-4 py-2.5 border-b border-white/10 sticky top-16 bg-black z-20 flex items-center gap-3">
          {/* Mobile: search input */}
          <div className="flex-1 md:hidden">
            <ProductSearchBar value={search} onChange={setSearch} />
          </div>

          {/* Desktop: result count */}
          {!isLoading && (
            <p className="hidden md:block text-xs text-white/30">
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
                ? 'border-white/40 text-white bg-white/10'
                : 'border-white/10 text-white/60 hover:text-white hover:bg-white/5',
            )}
          >
            <SlidersHorizontal size={13} />
            Filtros
            {activeFilterCount > 0 && (
              <span className="size-4 flex items-center justify-center bg-white rounded-full text-black text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile filter panel */}
        {mobileFilterOpen && (
          <div className="md:hidden px-4 py-3 border-b border-white/[0.08] bg-black flex flex-col gap-4">
            {/* Sort */}
            <div>
              <p className="text-[9px] font-semibold text-white/30 uppercase tracking-widest mb-2">
                Ordenar
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setSort(o.value)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs border transition-colors',
                      sort === o.value
                        ? 'border-white/40 text-white bg-white/10'
                        : 'border-white/10 text-white/50 hover:text-white',
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock toggle */}
            <button
              onClick={() => setInStockOnly((v) => !v)}
              className="flex items-center gap-2 w-fit"
            >
              <span
                className={cn(
                  'size-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
                  inStockOnly ? 'bg-white border-white' : 'border-white/25 bg-transparent',
                )}
              >
                {inStockOnly && (
                  <svg viewBox="0 0 8 6" width="8" height="6" fill="none">
                    <path
                      d="M1 3L3 5L7 1"
                      stroke="#0A0A0A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span className={cn('text-xs', inStockOnly ? 'text-white' : 'text-white/50')}>
                Solo con stock
              </span>
            </button>

            {/* Categories */}
            <div>
              <p className="text-[9px] font-semibold text-white/30 uppercase tracking-widest mb-2">
                Categoría
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => { setCategoryId(null); setMobileFilterOpen(false) }}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs border transition-colors',
                    categoryId === null
                      ? 'border-gold text-gold bg-gold/10'
                      : 'border-white/10 text-white/50 hover:text-white',
                  )}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategoryId(cat.id); setMobileFilterOpen(false) }}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs border transition-colors',
                      categoryId === cat.id
                        ? 'border-white/40 text-white bg-white/10'
                        : 'border-white/10 text-white/50 hover:text-white',
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
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
