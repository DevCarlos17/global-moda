import type { MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { usePublicCartStore } from '@/store/publicCartStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'
import type { ProductWithCategory } from '@/types/database.types'

interface PublicProductCardProps {
  product: ProductWithCategory
}

export function PublicProductCard({ product }: PublicProductCardProps) {
  const addItem = usePublicCartStore((s) => s.addItem)
  const navigate = useNavigate()

  const imageUrl = product.images[0] ?? null
  const hasVariants = (product.variants?.length ?? 0) > 0
  const hasStock = hasVariants
    ? product.variants!.some((v) => v.is_active && v.stock_quantity > 0)
    : product.stock_quantity > 0

  const stockLabel = hasVariants
    ? hasStock
      ? `${product.variants!.filter((v) => v.is_active && v.stock_quantity > 0).length} opciones`
      : 'Sin stock'
    : hasStock
      ? `${product.stock_quantity} en stock`
      : 'Sin stock'

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault()
    if (!hasStock) return
    if (hasVariants) {
      navigate(`/public/catalog/${product.id}`)
      return
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: imageUrl,
    })
  }

  return (
    <Link
      to={`/public/catalog/${product.id}`}
      className={cn(
        'group flex flex-col bg-surface border border-white/10 rounded-xl overflow-hidden',
        'hover:border-white/25 transition-colors duration-200',
      )}
    >
      {/* Image */}
      <div className="aspect-square bg-white/5 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="size-full flex items-center justify-center text-white/10">
            <ShoppingBag size={28} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5">
        {/* SKU + Category */}
        <div className="flex items-center justify-between gap-1 min-w-0">
          <span className="text-[10px] text-white/25 uppercase tracking-wider truncate">
            {product.sku}
          </span>
          {product.category && (
            <span className="text-[10px] text-white/35 truncate shrink-0 max-w-[55%]">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="text-xs font-medium text-white leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Stock indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'size-1.5 rounded-full flex-shrink-0',
              hasStock ? 'bg-success' : 'bg-error/70',
            )}
          />
          <span
            className={cn(
              'text-[10px]',
              hasStock ? 'text-white/35' : 'text-error/60',
            )}
          >
            {stockLabel}
          </span>
        </div>

        {/* Price */}
        <span className="text-gold font-bold text-sm mt-0.5">
          {formatCurrency(product.price)}
        </span>

        {/* Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={!hasStock}
          className={cn(
            'w-full flex items-center justify-center gap-2 h-8 rounded-lg text-xs font-medium transition-colors',
            hasStock
              ? 'bg-white/10 text-white hover:bg-white/20'
              : 'bg-white/5 text-white/20 cursor-not-allowed',
          )}
          aria-label={hasVariants ? 'Ver opciones' : 'Agregar al carrito'}
        >
          <ShoppingBag size={13} />
          {!hasStock ? 'Sin stock' : hasVariants ? 'Ver opciones' : 'Agregar al carrito'}
        </button>
      </div>
    </Link>
  )
}
