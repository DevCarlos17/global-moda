import { useState, useEffect } from 'react'
import { Package } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useProductVariants } from '@/features/variants/hooks/useProductVariants'
import { useSetStock } from '@/features/inventory/hooks/useInventory'
import type { SelectOption } from '@/types/common.types'

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
  product: StockAdjustTarget | null
}

export function StockAdjustModal({ isOpen, onClose, product }: StockAdjustModalProps) {
  const { data: variants = [] } = useProductVariants(product?.id)
  const { mutate: setStock, isPending } = useSetStock()

  const [selectedVariantId, setSelectedVariantId] = useState<string>('__product__')
  const [newQty, setNewQty] = useState(0)

  // Reset cuando cambia el producto
  useEffect(() => {
    if (!product) return
    setSelectedVariantId('__product__')
    setNewQty(product.stock_quantity)
  }, [product])

  // Sincroniza qty cuando cambia la variante seleccionada
  useEffect(() => {
    if (selectedVariantId === '__product__') {
      setNewQty(product?.stock_quantity ?? 0)
    } else {
      const variant = variants.find((v) => v.id === selectedVariantId)
      setNewQty(variant?.stock_quantity ?? 0)
    }
  }, [selectedVariantId, variants, product])

  if (!product) return null

  const handleSave = () => {
    const variantId = selectedVariantId === '__product__' ? null : selectedVariantId
    setStock({ productId: product.id, variantId, quantity: newQty }, { onSuccess: onClose })
  }

  const variantOptions: SelectOption[] = [
    { value: '__product__', label: 'Stock base del producto' },
    ...variants.map((v) => ({ value: v.id, label: v.label })),
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajustar stock" size="sm">
      <div className="flex flex-col gap-4">
        {/* Producto */}
        <div className="flex items-center gap-2 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          <Package size={14} className="text-white/30 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">{product.name}</p>
            <p className="text-xs text-white/40">{product.sku}</p>
          </div>
        </div>

        {/* Variante — solo si tiene */}
        {variants.length > 0 && (
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1.5">Variante</p>
            <Select
              options={variantOptions}
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
            />
          </div>
        )}

        {/* Nueva cantidad */}
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1.5">
            Nueva cantidad en stock
          </p>
          <input
            type="number"
            min={0}
            value={newQty}
            onChange={(e) => setNewQty(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full h-10 px-3 rounded-lg border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>

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
