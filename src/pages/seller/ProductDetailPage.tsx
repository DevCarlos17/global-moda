import { useState, useEffect, type KeyboardEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Minus, ShoppingBag, Ship, Warehouse } from 'lucide-react'
import { useProductDetail } from '@/features/catalog/hooks/useProductDetail'
import { useAddToCart } from '@/features/cart/hooks/useAddToCart'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/feedback/Loader'
import { ErrorState } from '@/components/feedback/ErrorState'
import { ImageCarousel } from '@/components/media/ImageCarousel'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'
import type { ProductVariant } from '@/types/database.types'

// ─── Shared quantity stepper ──────────────────────────────────────────────────

interface QtyControlProps {
  value: number
  localValue: string
  onLocalChange: (v: string) => void
  onDecrement: () => void
  onIncrement: () => void
  onCommit: () => void
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  max?: number
  disabled?: boolean
}

function QtyControl({
  value,
  localValue,
  onLocalChange,
  onDecrement,
  onIncrement,
  onCommit,
  onKeyDown,
  max,
  disabled,
}: QtyControlProps) {
  const handleChange = (raw: string) => {
    if (max !== undefined) {
      const parsed = parseInt(raw, 10)
      if (!isNaN(parsed) && parsed > max) {
        onLocalChange(String(max))
        return
      }
    }
    onLocalChange(raw)
  }

  return (
    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled || value <= 1}
        className="text-white/60 hover:text-white transition-colors disabled:opacity-40"
      >
        <Minus size={16} />
      </button>
      <input
        type="number"
        min="1"
        max={max}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={onCommit}
        onKeyDown={onKeyDown}
        className="w-14 text-center text-sm font-semibold text-white bg-transparent border border-white/20 rounded-md py-0.5 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/10 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled || (max !== undefined && value >= max)}
        className="text-white/60 hover:text-white transition-colors disabled:opacity-40"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.user?.id)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  // Stock section state (capped at effectiveStock)
  const [stockQty, setStockQty] = useState(1)
  const [localStockQty, setLocalStockQty] = useState('1')

  // Pre-order section state (uncapped)
  const [preorderQty, setPreorderQty] = useState(1)
  const [localPreorderQty, setLocalPreorderQty] = useState('1')

  const { data: product, isLoading, error, refetch } = useProductDetail(id!)
  const { mutate: addToCart, isPending } = useAddToCart()

  useEffect(() => { setLocalStockQty(String(stockQty)) }, [stockQty])
  useEffect(() => { setLocalPreorderQty(String(preorderQty)) }, [preorderQty])

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

  const variantReady = !hasVariants || selectedVariant !== null

  // Clamp stock qty whenever effectiveStock changes
  const clampedStockQty = Math.min(stockQty, effectiveStock)

  const commitStockQty = () => {
    const parsed = parseInt(localStockQty, 10)
    const clamped = Math.max(1, Math.min(isNaN(parsed) ? 1 : parsed, effectiveStock))
    setStockQty(clamped)
    setLocalStockQty(String(clamped))
  }

  const commitPreorderQty = () => {
    const parsed = parseInt(localPreorderQty, 10)
    const valid = Math.max(1, isNaN(parsed) ? 1 : parsed)
    setPreorderQty(valid)
    setLocalPreorderQty(String(valid))
  }

  const handleAddStock = () => {
    if (!userId || !variantReady) return
    addToCart({
      userId,
      productId: product.id,
      quantity: clampedStockQty,
      variantId: selectedVariant?.id,
      fulfillmentSource: 'stock',
    })
  }

  const handleAddPreorder = () => {
    if (!userId || !variantReady) return
    addToCart({
      userId,
      productId: product.id,
      quantity: preorderQty,
      variantId: selectedVariant?.id,
      fulfillmentSource: 'container',
    })
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

          {/* Variant selector */}
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
                      type="button"
                      onClick={() => setSelectedVariant(isSelected ? null : v)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                        isSelected
                          ? 'border-white/60 bg-white/10 text-white'
                          : outOfStock
                          ? 'border-info/20 text-info/60 hover:border-info/40'
                          : 'border-white/15 text-white/70 hover:border-white/40 hover:text-white',
                      )}
                    >
                      {v.label}
                      {outOfStock && <span className="ml-1 text-[10px] text-info/50">·pre</span>}
                      {v.price_override != null && (
                        <span className="ml-1.5 text-xs opacity-70">
                          {formatCurrency(v.price_override)}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stock indicator */}
          {variantReady && (
            <div className="flex items-center gap-2 text-sm">
              {effectiveStock > 0 ? (
                <>
                  <span className="size-2 rounded-full bg-success flex-shrink-0" />
                  <span className="text-white/50">
                    <span className="text-success font-medium">{effectiveStock}</span> unidades en stock
                  </span>
                </>
              ) : (
                <>
                  <Ship size={14} className="text-info flex-shrink-0" />
                  <span className="text-info/70">Sin stock · solo disponible por pre-pedido</span>
                </>
              )}
            </div>
          )}

          {/* Prompt if variant not yet selected */}
          {hasVariants && !selectedVariant && (
            <p className="text-sm text-warning/80">
              Seleccioná una opción para ver las formas de compra
            </p>
          )}

          {/* ── Stock section ── */}
          {variantReady && effectiveStock > 0 && (
            <div className="rounded-xl border border-success/20 bg-success/5 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Warehouse size={14} className="text-success" />
                <span className="text-sm font-medium text-white">Comprar desde stock</span>
                <span className="text-xs text-white/40">máx. {effectiveStock} u.</span>
              </div>
              <div className="flex items-center gap-3">
                <QtyControl
                  value={clampedStockQty}
                  localValue={localStockQty}
                  onLocalChange={setLocalStockQty}
                  onDecrement={() => setStockQty((q) => Math.max(1, q - 1))}
                  onIncrement={() => setStockQty((q) => Math.min(effectiveStock, q + 1))}
                  onCommit={commitStockQty}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitStockQty()
                    if (e.key === 'Escape') setLocalStockQty(String(clampedStockQty))
                  }}
                  max={effectiveStock}
                  disabled={isPending}
                />
                <Button
                  onClick={handleAddStock}
                  isLoading={isPending}
                  disabled={!userId}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingBag size={18} />
                  Agregar al carrito
                </Button>
              </div>
            </div>
          )}

          {/* ── Pre-order section ── */}
          {variantReady && (
            <div className="rounded-xl border border-info/20 bg-info/5 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Ship size={14} className="text-info" />
                <span className="text-sm font-medium text-white">Pre-pedido</span>
                <span className="text-xs text-white/40">sin límite · llega con el próximo container</span>
              </div>
              <div className="flex items-center gap-3">
                <QtyControl
                  value={preorderQty}
                  localValue={localPreorderQty}
                  onLocalChange={setLocalPreorderQty}
                  onDecrement={() => setPreorderQty((q) => Math.max(1, q - 1))}
                  onIncrement={() => setPreorderQty((q) => q + 1)}
                  onCommit={commitPreorderQty}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitPreorderQty()
                    if (e.key === 'Escape') setLocalPreorderQty(String(preorderQty))
                  }}
                  disabled={isPending}
                />
                <Button
                  onClick={handleAddPreorder}
                  isLoading={isPending}
                  disabled={!userId}
                  variant="secondary"
                  className="flex-1 border border-info/20"
                  size="lg"
                >
                  <Ship size={18} />
                  Pre-pedido
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
