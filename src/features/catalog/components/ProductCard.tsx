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
        'group flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden',
        'hover:border-gray-300 hover:shadow-sm transition-all duration-200',
      )}
    >
      {/* Image */}
      <div className="aspect-square bg-gray-50 overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="size-full flex items-center justify-center text-gray-300">
            <ShoppingBag size={28} />
          </div>
        )}
        {!hasStock && (
          <span className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/90 border border-gray-200 text-[10px] font-medium text-blue-500">
            <Ship size={9} />
            Pre-pedido
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5">
        {/* SKU + Category */}
        <div className="flex items-center justify-between gap-1 min-w-0">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider truncate">
            {product.sku}
          </span>
          {product.category && (
            <span className="text-[10px] text-gray-400 truncate shrink-0 max-w-[55%]">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="text-xs font-medium text-gray-900 leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Stock indicator */}
        <div className="flex items-center gap-1.5">
          {hasStock ? (
            <>
              <span className="size-1.5 rounded-full flex-shrink-0 bg-green-500" />
              <span className="text-[10px] text-gray-400">{stockLabel}</span>
            </>
          ) : (
            <>
              <Ship size={9} className="text-blue-400 flex-shrink-0" />
              <span className="text-[10px] text-blue-400">{stockLabel}</span>
            </>
          )}
        </div>

        {/* Price */}
        <span className="text-gray-900 font-semibold text-sm mt-0.5">
          {formatCurrency(product.price)}
        </span>

        {/* Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 h-8 rounded-lg text-xs font-medium transition-colors bg-gray-900 text-white hover:bg-gray-700"
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
