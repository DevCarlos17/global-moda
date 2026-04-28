import { useState, useEffect, useRef } from 'react'
import { Package } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useProductVariants } from '@/features/variants/hooks/useProductVariants'
import { useSetStock, useBulkSetStock } from '@/features/inventory/hooks/useInventory'

// Tipo mínimo — compatible con ProductWithCategory, InventoryProduct, etc.
export interface StockAdjustTarget {
  id: string
  name: string
  sku: string
  stock_quantity: number
}

interface StockAdjustModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
  product: StockAdjustTarget | null
}

export function StockAdjustModal({ isOpen, onClose, onSaved, product }: StockAdjustModalProps) {
  const { data: variants = [] } = useProductVariants(product?.id)
  const { mutate: setStock, isPending: isPendingSingle } = useSetStock()
  const { mutate: bulkSetStock, isPending: isPendingBulk } = useBulkSetStock()
  const isPending = isPendingSingle || isPendingBulk

  // Sin variantes — stock único del producto
  const [baseQty, setBaseQty] = useState(0)

  // Con variantes — map de variantId → qty
  const [variantStocks, setVariantStocks] = useState<Record<string, number>>({})

  // Track whether variantStocks has been initialized for the current product.
  // Prevents background refetches of useProductVariants from overwriting the
  // user's in-progress edits (staleTime: 0 triggers a refetch on every mount).
  const variantsInitialized = useRef(false)

  const hasVariants = variants.length > 0

  // Reset initialization flag when the product changes
  useEffect(() => {
    variantsInitialized.current = false
    if (!product) return
    setBaseQty(product.stock_quantity)
  }, [product])

  // Initialize the variant stock map once per product open — ignore subsequent
  // background refetches so the user's edits are not silently overwritten.
  useEffect(() => {
    if (variants.length === 0) return
    if (variantsInitialized.current) return
    variantsInitialized.current = true
    const initial: Record<string, number> = {}
    variants.forEach((v) => { initial[v.id] = v.stock_quantity })
    setVariantStocks(initial)
  }, [variants])

  if (!product) return null

  const totalStock = hasVariants
    ? Object.values(variantStocks).reduce((sum, q) => sum + q, 0)
    : baseQty

  const handleSave = () => {
    if (hasVariants) {
      const updates = variants.map((v) => ({
        productId: product.id,
        variantId: v.id,
        quantity: variantStocks[v.id] ?? v.stock_quantity,
      }))
      bulkSetStock(updates, {
        onSuccess: () => {
          onSaved?.()
          onClose()
        },
      })
    } else {
      setStock(
        { productId: product.id, variantId: null, quantity: baseQty },
        {
          onSuccess: () => {
            onSaved?.()
            onClose()
          },
        },
      )
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajustar stock" size="sm">
      <div className="flex flex-col gap-4">
        {/* Producto */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          <Package size={14} className="text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
            <p className="text-xs text-gray-400">{product.sku}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-sm font-semibold text-gray-900">{totalStock} u.</p>
          </div>
        </div>

        {/* Con variantes — lista completa */}
        {hasVariants ? (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              Stock por variante
            </p>
            <div className="flex flex-col divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {variants.map((v) => (
                <div key={v.id} className="flex items-center gap-3 px-3 py-2.5 bg-white">
                  <span className="text-sm text-gray-700 flex-1 truncate">{v.label}</span>
                  <input
                    type="number"
                    min={0}
                    value={variantStocks[v.id] ?? v.stock_quantity}
                    onChange={(e) =>
                      setVariantStocks((prev) => ({
                        ...prev,
                        [v.id]: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="w-20 h-8 px-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 text-center focus:outline-none focus:border-gray-400 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Sin variantes — input único */
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">
              Nueva cantidad en stock
            </p>
            <input
              type="number"
              min={0}
              value={baseQty}
              onChange={(e) => setBaseQty(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={onClose} disabled={isPending} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} isLoading={isPending} className="flex-1">
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
