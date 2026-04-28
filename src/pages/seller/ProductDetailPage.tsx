import { useState, useEffect, type KeyboardEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Minus, ShoppingBag, Ship, Warehouse, Check } from 'lucide-react'
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

// ─── Color map ────────────────────────────────────────────────────────────────

const COLOR_HEX: Record<string, string> = {
  'Negro':       '#111111',
  'Blanco':      '#F5F5F5',
  'Beige':       '#D4B896',
  'Rojo':        '#C0392B',
  'Azul marino': '#1A3A5C',
  'Azul':        '#2980B9',
  'Verde':       '#27AE60',
  'Camel':       '#C19A6B',
  'Gris':        '#7F8C8D',
  'Rosa':        '#E91E8C',
  'Marrón':      '#795548',
  'Mostaza':     '#F39C12',
}

const LIGHT_COLORS = new Set(['Blanco', 'Beige', 'Mostaza'])

// ─── Variant type detection ───────────────────────────────────────────────────

type VariantType = 'size' | 'color' | 'size_color' | 'legacy'

function detectVariantType(variants: ProductVariant[]): VariantType {
  const first = variants.find((v) => v.attributes?.type)
  return (first?.attributes?.type as VariantType) ?? 'legacy'
}

// ─── Smart variant selector ───────────────────────────────────────────────────

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariant: ProductVariant | null
  onSelect: (v: ProductVariant | null) => void
}

function VariantSelector({ variants, selectedVariant, onSelect }: VariantSelectorProps) {
  const type = detectVariantType(variants)

  // Hoist so it's available for state initializers and JSX
  const uniqueColors = [...new Set(
    variants.map((v) => v.attributes?.color as string).filter(Boolean),
  )]

  // Compute defaults for pre-selection on mount
  const defaultColor = type === 'size_color' ? (uniqueColors[0] ?? null) : null
  const defaultSizeVariant = defaultColor
    ? variants.find((v) => v.attributes?.color === defaultColor)
    : null
  const defaultSize = type === 'size_color'
    ? ((defaultSizeVariant?.attributes?.size as string) ?? null)
    : null

  // size_color — two-step state (pre-selected with first available options)
  const [selectedColor, setSelectedColor] = useState<string | null>(defaultColor)
  const [selectedSize, setSelectedSize] = useState<string | null>(defaultSize)

  // Call onSelect once on mount so the parent gets the default variant immediately
  useEffect(() => {
    if (type === 'size_color') {
      if (defaultColor && defaultSize) {
        const match = variants.find(
          (v) => v.attributes?.color === defaultColor && v.attributes?.size === defaultSize,
        )
        onSelect(match ?? null)
      }
    } else if (variants.length > 0) {
      onSelect(variants[0])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When color changes, reset size and variant
  const handleColorSelect = (color: string) => {
    const next = selectedColor === color ? null : color
    setSelectedColor(next)
    setSelectedSize(null)
    onSelect(null)
  }

  // When size is picked (with color already selected), find matching variant
  const handleSizeSelect = (size: string) => {
    const next = selectedSize === size ? null : size
    setSelectedSize(next)
    if (next && selectedColor) {
      const match = variants.find(
        (v) => v.attributes?.color === selectedColor && v.attributes?.size === next,
      )
      onSelect(match ?? null)
    } else {
      onSelect(null)
    }
  }

  // ── size_color ──
  if (type === 'size_color') {
    const sizesForColor = selectedColor
      ? variants.filter((v) => v.attributes?.color === selectedColor)
      : []

    return (
      <div className="flex flex-col gap-4">
        {/* Step 1 — Color */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Color</p>
          <div className="flex flex-wrap gap-3">
            {uniqueColors.map((color) => {
              const hex = COLOR_HEX[color] ?? '#ccc'
              const isLight = LIGHT_COLORS.has(color)
              const isSelected = selectedColor === color
              const allOutOfStock = variants
                .filter((v) => v.attributes?.color === color)
                .every((v) => v.stock_quantity === 0)

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  title={color}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className={cn(
                      'size-9 rounded-full border-2 flex items-center justify-center transition-all',
                      isSelected
                        ? 'border-gray-900 scale-110 shadow-[0_0_0_2px_rgba(0,0,0,0.15)]'
                        : 'border-transparent hover:scale-105 hover:border-gray-300',
                      allOutOfStock && 'opacity-50',
                    )}
                    style={{ backgroundColor: hex }}
                  >
                    {isSelected && (
                      <Check
                        size={14}
                        className={isLight ? 'text-gray-900' : 'text-white'}
                        strokeWidth={3}
                      />
                    )}
                  </div>
                  <span className={cn(
                    'text-[10px] leading-tight',
                    isSelected ? 'text-gray-900 font-medium' : 'text-gray-400',
                  )}>
                    {color}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step 2 — Size (only after color picked) */}
        {selectedColor && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Talla</p>
            <div className="flex flex-wrap gap-2">
              {sizesForColor.map((v) => {
                const size = v.attributes?.size as string
                const outOfStock = v.stock_quantity === 0
                const isSelected = selectedSize === size
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSizeSelect(size)}
                    className={cn(
                      'min-w-[44px] h-10 px-3 rounded-lg border text-sm font-medium transition-all',
                      isSelected
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : outOfStock
                        ? 'border-blue-200 text-blue-400 hover:border-blue-300'
                        : 'border-gray-200 text-gray-700 hover:border-gray-400 hover:text-gray-900',
                    )}
                  >
                    {size}
                    {outOfStock && (
                      <span className="block text-[9px] font-normal leading-none mt-0.5 text-blue-400">
                        pre
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── color only ──
  if (type === 'color') {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Color</p>
        <div className="flex flex-wrap gap-3">
          {variants.map((v) => {
            const color = v.attributes?.color as string ?? v.label
            const hex = COLOR_HEX[color] ?? '#ccc'
            const isLight = LIGHT_COLORS.has(color)
            const isSelected = selectedVariant?.id === v.id
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelect(isSelected ? null : v)}
                title={color}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={cn(
                    'size-9 rounded-full border-2 flex items-center justify-center transition-all',
                    isSelected
                      ? 'border-gray-900 scale-110 shadow-[0_0_0_2px_rgba(0,0,0,0.15)]'
                      : 'border-transparent hover:scale-105 hover:border-gray-300',
                    v.stock_quantity === 0 && 'opacity-50',
                  )}
                  style={{ backgroundColor: hex }}
                >
                  {isSelected && (
                    <Check size={14} className={isLight ? 'text-gray-900' : 'text-white'} strokeWidth={3} />
                  )}
                </div>
                <span className={cn('text-[10px] leading-tight', isSelected ? 'text-gray-900 font-medium' : 'text-gray-400')}>
                  {color}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── size only ──
  if (type === 'size') {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Talla</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const outOfStock = v.stock_quantity === 0
            const isSelected = selectedVariant?.id === v.id
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelect(isSelected ? null : v)}
                className={cn(
                  'min-w-[44px] h-10 px-3 rounded-lg border text-sm font-medium transition-all',
                  isSelected
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : outOfStock
                    ? 'border-blue-200 text-blue-400 hover:border-blue-300'
                    : 'border-gray-200 text-gray-700 hover:border-gray-400 hover:text-gray-900',
                )}
              >
                {v.attributes?.size ?? v.label}
                {outOfStock && (
                  <span className="block text-[9px] font-normal leading-none mt-0.5 text-blue-400">
                    pre
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── legacy (free-form labels) ──
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
        Seleccioná una opción
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const outOfStock = v.stock_quantity === 0
          const isSelected = selectedVariant?.id === v.id
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(isSelected ? null : v)}
              className={cn(
                'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                isSelected
                  ? 'border-gray-900 bg-gray-100 text-gray-900'
                  : outOfStock
                  ? 'border-blue-200 text-blue-400 hover:border-blue-300'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900',
              )}
            >
              {v.label}
              {outOfStock && <span className="ml-1 text-[10px] text-blue-400">·pre</span>}
              {v.price_override != null && (
                <span className="ml-1.5 text-xs opacity-70">{formatCurrency(v.price_override)}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Quantity stepper ─────────────────────────────────────────────────────────

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

function QtyControl({ value, localValue, onLocalChange, onDecrement, onIncrement, onCommit, onKeyDown, max, disabled }: QtyControlProps) {
  const handleChange = (raw: string) => {
    if (max !== undefined) {
      const parsed = parseInt(raw, 10)
      if (!isNaN(parsed) && parsed > max) { onLocalChange(String(max)); return }
    }
    onLocalChange(raw)
  }

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
      <button type="button" onClick={onDecrement} disabled={disabled || value <= 1}
        className="text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40">
        <Minus size={16} />
      </button>
      <input
        type="number" min="1" max={max} value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={onCommit} onKeyDown={onKeyDown}
        className="w-14 text-center text-sm font-semibold text-gray-900 bg-transparent border border-gray-200 rounded-md py-0.5 focus:outline-none focus:border-gray-400 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" onClick={onIncrement} disabled={disabled || (max !== undefined && value >= max)}
        className="text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40">
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

  const [stockQty, setStockQty] = useState(1)
  const [localStockQty, setLocalStockQty] = useState('1')
  const [preorderQty, setPreorderQty] = useState(1)
  const [localPreorderQty, setLocalPreorderQty] = useState('1')
  const [source, setSource] = useState<'stock' | 'preorder'>('stock')

  const { data: product, isLoading, error, refetch } = useProductDetail(id!)
  const { mutate: addToCart, isPending } = useAddToCart()

  useEffect(() => { setLocalStockQty(String(stockQty)) }, [stockQty])
  useEffect(() => { setLocalPreorderQty(String(preorderQty)) }, [preorderQty])
  useEffect(() => {
    if (!product) return
    const activeVars = product.variants?.filter((v) => v.is_active) ?? []
    const stock = selectedVariant
      ? selectedVariant.stock_quantity
      : activeVars.length > 0 ? 0 : product.stock_quantity
    setSource(stock > 0 ? 'stock' : 'preorder')
  }, [selectedVariant, product])

  if (isLoading) return <PageLoader />
  if (error || !product) return <ErrorState onRetry={refetch} />

  const activeVariants = product.variants?.filter((v) => v.is_active) ?? []
  const hasVariants = activeVariants.length > 0

  const effectivePrice = selectedVariant?.price_override ?? product.price
  const effectiveStock = selectedVariant
    ? selectedVariant.stock_quantity
    : hasVariants ? 0 : product.stock_quantity

  const variantReady = !hasVariants || selectedVariant !== null
  const clampedStockQty = Math.min(stockQty, effectiveStock)

  const commitStockQty = () => {
    const parsed = parseInt(localStockQty, 10)
    const clamped = Math.max(1, Math.min(isNaN(parsed) ? 1 : parsed, effectiveStock))
    setStockQty(clamped); setLocalStockQty(String(clamped))
  }

  const commitPreorderQty = () => {
    const parsed = parseInt(localPreorderQty, 10)
    const valid = Math.max(1, isNaN(parsed) ? 1 : parsed)
    setPreorderQty(valid); setLocalPreorderQty(String(valid))
  }

  const handleAddStock = () => {
    if (!userId || !variantReady) return
    addToCart({ userId, productId: product.id, quantity: clampedStockQty, variantId: selectedVariant?.id, fulfillmentSource: 'stock' })
  }

  const handleAddPreorder = () => {
    if (!userId || !variantReady) return
    addToCart({ userId, productId: product.id, quantity: preorderQty, variantId: selectedVariant?.id, fulfillmentSource: 'container' })
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-6"
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
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.sku}</p>
            <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
          </div>

          <p className="text-2xl font-bold text-gray-900">{formatCurrency(effectivePrice)}</p>

          {product.description && (
            <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
          )}

          {/* Smart variant selector */}
          {hasVariants && (
            <VariantSelector
              variants={activeVariants}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
            />
          )}

          {/* Stock indicator */}
          {variantReady && (
            <div className="flex items-center gap-2 text-sm">
              {effectiveStock > 0 ? (
                <>
                  <span className="size-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-gray-500">
                    <span className="text-green-600 font-medium">{effectiveStock}</span> unidades en stock
                  </span>
                </>
              ) : (
                <>
                  <Ship size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400">Sin stock · solo disponible por pre-pedido</span>
                </>
              )}
            </div>
          )}

          {/* Unified purchase card */}
          {variantReady && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-4">
              {/* Segmented control — only shown when stock is available */}
              {effectiveStock > 0 && (
                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setSource('stock')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-sm font-medium transition-all',
                      source === 'stock'
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-500 hover:text-gray-700',
                    )}
                  >
                    <Warehouse size={13} />
                    Desde stock
                    <span className="text-xs font-normal opacity-60">({effectiveStock} u.)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSource('preorder')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-sm font-medium transition-all',
                      source === 'preorder'
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-500 hover:text-gray-700',
                    )}
                  >
                    <Ship size={13} />
                    Pre-pedido
                  </button>
                </div>
              )}

              {/* Source description */}
              <p className="text-xs text-gray-400 -mt-1">
                {source === 'stock'
                  ? `Máx. ${effectiveStock} unidades · entrega inmediata`
                  : 'Sin límite · llega con el próximo container'}
              </p>

              {/* Action row */}
              <div className="flex items-center gap-3">
                {source === 'stock' ? (
                  <>
                    <QtyControl
                      value={clampedStockQty} localValue={localStockQty}
                      onLocalChange={setLocalStockQty}
                      onDecrement={() => setStockQty((q) => Math.max(1, q - 1))}
                      onIncrement={() => setStockQty((q) => Math.min(effectiveStock, q + 1))}
                      onCommit={commitStockQty}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitStockQty(); if (e.key === 'Escape') setLocalStockQty(String(clampedStockQty)) }}
                      max={effectiveStock} disabled={isPending}
                    />
                    <Button onClick={handleAddStock} isLoading={isPending} disabled={!userId} className="flex-1" size="lg">
                      <ShoppingBag size={18} />
                      Agregar al carrito
                    </Button>
                  </>
                ) : (
                  <>
                    <QtyControl
                      value={preorderQty} localValue={localPreorderQty}
                      onLocalChange={setLocalPreorderQty}
                      onDecrement={() => setPreorderQty((q) => Math.max(1, q - 1))}
                      onIncrement={() => setPreorderQty((q) => q + 1)}
                      onCommit={commitPreorderQty}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitPreorderQty(); if (e.key === 'Escape') setLocalPreorderQty(String(preorderQty)) }}
                      disabled={isPending}
                    />
                    <Button
                      onClick={handleAddPreorder} isLoading={isPending} disabled={!userId}
                      variant="outline" className="flex-1" size="lg"
                    >
                      <Ship size={18} />
                      Pre-pedido
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
