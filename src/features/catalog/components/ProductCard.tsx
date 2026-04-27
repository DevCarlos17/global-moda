import type { MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Ship } from 'lucide-react'
import { useAddToCart } from '@/features/cart/hooks/useAddToCart'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'
import type { ProductWithCategory } from '@/types/database.types'

interface ProductCardProps {
  product: ProductWithCategory
}

export function ProductCard({ product }: ProductCardProps) {
  const userId = useAuthStore((s) => s.user?.id)
  const { mutate: addToCart, isPending } = useAddToCart()
  const navigate = useNavigate()

  const imageUrl = product.images[0] ?? null
  const hasVariants = (product.variants?.length ?? 0) > 0

  // For non-variant products, use product-level stock
  const stockQty = hasVariants
    ? product.variants!.filter((v) => v.is_active).reduce((sum, v) => sum + v.stock_quantity, 0)
    : product.stock_quantity
  const hasStock = stockQty > 0

  const stockLabel = hasVariants
    ? hasStock
      ? `${product.variants!.filter((v) => v.is_active && v.stock_quantity > 0).length} opciones`
      : 'Pre-pedido'
    : hasStock
      ? `${product.stock_quantity} en stock`
      : 'Pre-pedido'

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault()
    if (hasVariants) {
      navigate(`/catalog/${product.id}`)
      return
    }
    if (!userId) return
    addToCart({
      userId,
      productId: product.id,
      quantity: 1,
      fulfillmentSource: hasStock ? 'stock' : 'container',
    })
  }

  return (
    <Link
      to={`/catalog/${product.id}`}
      className={cn(
        'group flex flex-col bg-surface border border-white/10 rounded-xl overflow-hidden',
        'hover:border-white/25 transition-colors duration-200',
      )}
    >
      {/* Image */}
      <div className="aspect-square bg-white/5 overflow-hidden relative">
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
        {/* Out-of-stock overlay chip */}
        {!hasStock && (
          <span className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 text-[10px] font-medium text-info backdrop-blur-sm">
            <Ship size={9} />
            Pre-pedido
          </span>
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
          {hasStock ? (
            <>
              <span className="size-1.5 rounded-full flex-shrink-0 bg-success" />
              <span className="text-[10px] text-white/35">{stockLabel}</span>
            </>
          ) : (
            <>
              <Ship size={9} className="text-info flex-shrink-0" />
              <span className="text-[10px] text-info/70">{stockLabel}</span>
            </>
          )}
        </div>

        {/* Price */}
        <span className="text-gold font-bold text-sm mt-0.5">
          {formatCurrency(product.price)}
        </span>

        {/* Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={isPending}
          className={cn(
            'w-full flex items-center justify-center gap-2 h-8 rounded-lg text-xs font-medium transition-colors',
            'bg-white/10 text-white hover:bg-white/20',
          )}
          aria-label={hasVariants ? 'Ver opciones' : 'Agregar al carrito'}
        >
          {isPending ? (
            <span className="size-3 border border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingBag size={13} />
              {hasVariants ? 'Ver opciones' : 'Agregar al carrito'}
            </>
          )}
        </button>
      </div>
    </Link>
  )
}
