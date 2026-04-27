import { useState, useEffect, type KeyboardEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useProductDetail } from '@/features/catalog/hooks/useProductDetail'
import { usePublicCartStore } from '@/store/publicCartStore'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/feedback/Loader'
import { ErrorState } from '@/components/feedback/ErrorState'
import { ImageCarousel } from '@/components/media/ImageCarousel'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'
import type { ProductVariant } from '@/types/database.types'

export function PublicProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [localQty, setLocalQty] = useState('1')
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  const { data: product, isLoading, error, refetch } = useProductDetail(id!)
  const addItem = usePublicCartStore((s) => s.addItem)
  const openCart = usePublicCartStore((s) => s.openCart)

  useEffect(() => { setLocalQty(String(quantity)) }, [quantity])

  const commitQty = () => {
    const parsed = parseInt(localQty, 10)
    if (!isNaN(parsed) && parsed >= 1) {
      setQuantity(parsed)
      setLocalQty(String(parsed))
    } else {
      setLocalQty(String(quantity))
    }
  }

  const handleQtyKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitQty()
    if (e.key === 'Escape') setLocalQty(String(quantity))
  }

  if (isLoading) return <PageLoader />
  if (error || !product) return <ErrorState onRetry={refetch} />

  const activeVariants = product.variants?.filter((v) => v.is_active) ?? []
  const hasVariants = activeVariants.length > 0

  const effectivePrice = selectedVariant?.price_override ?? product.price
  const effectiveStock = selectedVariant
    ? selectedVariant.stock_quantity
    : hasVariants
    ? 0
    : product.stock_quantity

  const canAdd = (!hasVariants || selectedVariant !== null) && effectiveStock > 0

  const handleAddToCart = () => {
    if (!canAdd) return
    addItem({
      productId: product.id,
      name: product.name,
      price: effectivePrice,
      image: product.images[0] ?? null,
      quantity,
      variantId: selectedVariant?.id,
      variantLabel: selectedVariant?.label,
    })
    openCart()
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        <span className="text-sm">Volver al catálogo</span>
      </button>

      <div className="md:grid md:grid-cols-2 md:gap-10 md:items-start">
        {/* Images */}
        <div className="mb-6 md:mb-0 md:sticky md:top-20">
          <ImageCarousel images={product.images} alt={product.name} />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{product.sku}</p>
          <h1 className="text-2xl font-semibold text-white">{product.name}</h1>
        </div>

        <p className="text-2xl font-bold text-gold">{formatCurrency(effectivePrice)}</p>

        {product.description && (
          <p className="text-sm text-white/60 leading-relaxed">{product.description}</p>
        )}

        {/* ── Variant selector ─────────────────────────────────────────── */}
        {hasVariants && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
              Seleccioná una opción
            </p>
            <div className="flex flex-wrap gap-2">
              {activeVariants.map((v) => {
                const outOfStock = v.stock_quantity === 0
                const isSelected = selectedVariant?.id === v.id
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(isSelected ? null : v)}
                    disabled={outOfStock}
                    className={cn(
                      'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                      isSelected
                        ? 'border-white/60 bg-white/10 text-white'
                        : outOfStock
                        ? 'border-white/10 text-white/20 line-through cursor-not-allowed'
                        : 'border-white/15 text-white/70 hover:border-white/40 hover:text-white',
                    )}
                  >
                    {v.label}
                    {v.price_override != null && (
                      <span className="ml-1.5 text-xs opacity-70">
                        {formatCurrency(v.price_override)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {!selectedVariant && (
              <p className="text-xs text-warning/80">Seleccioná una opción para continuar</p>
            )}
          </div>
        )}

        {/* Stock */}
        {(!hasVariants || selectedVariant) && (
          <div className="flex items-center gap-2 text-sm text-white/40">
            <span>Stock:</span>
            <span className={effectiveStock > 0 ? 'text-success' : 'text-error'}>
              {effectiveStock > 0 ? `${effectiveStock} unidades` : 'Sin stock'}
            </span>
          </div>
        )}

        {/* Quantity + Add to cart */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="text-white/60 hover:text-white transition-colors"
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              min="1"
              value={localQty}
              onChange={(e) => setLocalQty(e.target.value)}
              onBlur={commitQty}
              onKeyDown={handleQtyKeyDown}
              className="w-14 text-center text-sm font-semibold text-white bg-transparent border border-white/20 rounded-md py-0.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/10 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          <Button onClick={handleAddToCart} disabled={!canAdd} className="flex-1" size="lg">
            <ShoppingBag size={18} />
            {hasVariants && !selectedVariant ? 'Seleccioná una opción' : 'Agregar al carrito'}
          </Button>
        </div>
        </div>
      </div>
    </div>
  )
}
