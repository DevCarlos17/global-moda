import { useState, useEffect, type KeyboardEvent } from 'react'
import { Minus, Plus, Trash2, Ship, Warehouse } from 'lucide-react'
import { useUpdateCartItem } from '@/features/cart/hooks/useUpdateCartItem'
import { useRemoveCartItem } from '@/features/cart/hooks/useRemoveCartItem'
import { formatCurrency } from '@/utils/formatCurrency'
import type { CartItemWithProduct } from '@/types/database.types'

interface CartItemProps {
  item: CartItemWithProduct
}

export function CartItem({ item }: CartItemProps) {
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem()
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem()

  const [localQty, setLocalQty] = useState(String(item.quantity))

  // Keep local input in sync when server value changes (e.g. after +/- buttons)
  useEffect(() => {
    setLocalQty(String(item.quantity))
  }, [item.quantity])

  const imageUrl = item.product.images[0] ?? null
  const isDisabled = isUpdating || isRemoving

  // For stock items, cap quantity at available stock (variant or product level).
  // Pre-order items have no cap — they are demand signals, not inventory reservations.
  const maxQty =
    item.fulfillment_source === 'stock'
      ? (item.variant?.stock_quantity ?? item.product.stock_quantity)
      : undefined

  const commitQty = () => {
    const raw = parseInt(localQty, 10)
    if (isNaN(raw) || raw < 1) {
      removeItem({ id: item.id, productId: item.product_id })
      return
    }
    const qty = maxQty !== undefined ? Math.min(raw, maxQty) : raw
    if (qty !== item.quantity) {
      updateItem({ id: item.id, quantity: qty })
    }
    setLocalQty(String(qty))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitQty()
    if (e.key === 'Escape') setLocalQty(String(item.quantity))
  }

  return (
    <div className="flex gap-3 p-4">
      {/* Image */}
      <div className="size-16 rounded-lg bg-white/5 flex-shrink-0 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={item.product.name} className="size-full object-cover" />
        ) : (
          <div className="size-full flex items-center justify-center text-white/20 text-xs">
            Sin imagen
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{item.product.name}</p>

        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {item.variant && (
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-[11px] text-white/50">
              {item.variant.label}
            </span>
          )}
          {item.fulfillment_source === 'container' ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-info/10 text-[10px] font-medium text-info/80">
              <Ship size={9} />
              Pre-pedido
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-success/10 text-[10px] font-medium text-success/80">
              <Warehouse size={9} />
              Stock
            </span>
          )}
        </div>

        <p className="text-xs text-white/50 mt-0.5">{formatCurrency(item.product.price)}</p>

        {/* Quantity controls */}
        <div className="flex items-center gap-1.5 mt-2">
          <button
            onClick={() => {
              if (item.quantity <= 1) {
                removeItem({ id: item.id, productId: item.product_id })
              } else {
                updateItem({ id: item.id, quantity: item.quantity - 1 })
              }
            }}
            disabled={isDisabled}
            className="size-6 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors disabled:opacity-50"
          >
            <Minus size={12} />
          </button>

          {/* Editable quantity input */}
          <input
            type="number"
            min="1"
            max={maxQty}
            value={localQty}
            onChange={(e) => {
              const raw = e.target.value
              if (maxQty !== undefined) {
                const parsed = parseInt(raw, 10)
                if (!isNaN(parsed) && parsed > maxQty) {
                  setLocalQty(String(maxQty))
                  return
                }
              }
              setLocalQty(raw)
            }}
            onBlur={commitQty}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            className="w-14 text-center text-sm font-medium text-white bg-white/10 border border-white/20 rounded-md py-0.5 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <button
            onClick={() => updateItem({ id: item.id, quantity: item.quantity + 1 })}
            disabled={isDisabled || (maxQty !== undefined && item.quantity >= maxQty)}
            className="size-6 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors disabled:opacity-50"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Subtotal + remove */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem({ id: item.id, productId: item.product_id })}
          disabled={isRemoving}
          className="p-1 text-white/30 hover:text-error transition-colors disabled:opacity-50"
          aria-label="Eliminar"
        >
          <Trash2 size={14} />
        </button>
        <span className="text-sm font-semibold text-white">
          {formatCurrency(item.quantity * item.product.price)}
        </span>
      </div>
    </div>
  )
}
