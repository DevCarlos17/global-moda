import { ProductCard } from '@/features/catalog/components/ProductCard'
import { PageLoader } from '@/components/feedback/Loader'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { ProductWithCategory } from '@/types/database.types'

interface ProductGridProps {
  products: ProductWithCategory[]
  isLoading: boolean
  error: Error | null
  onRetry?: () => void
}

export function ProductGrid({ products, isLoading, error, onRetry }: ProductGridProps) {
  if (isLoading) return <PageLoader />
  if (error) return <ErrorState onRetry={onRetry} />
  if (products.length === 0) {
    return (
      <EmptyState
        title="Sin productos"
        description="No se encontraron productos con los filtros actuales"
      />
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
