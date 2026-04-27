import { useNavigate } from 'react-router-dom'
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { usePublicCartStore } from '@/store/publicCartStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export function PublicCartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem } = usePublicCartStore()

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const navigate = useNavigate()

  const handleCheckout = () => {
    closeCart()
    navigate('/public/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-sm z-50',
          'bg-black border-l border-white/10 flex flex-col',
          'transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0">
          <span className="font-semibold text-white">
            Carrito
            {items.length > 0 && (
              <span className="ml-2 text-white/40 text-sm font-normal">
                ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </span>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <ShoppingBag size={40} className="text-white/10" />
              <p className="text-white/40 text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-3 bg-surface rounded-xl p-3 border border-white/10"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-14 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="size-14 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag size={16} className="text-white/20" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white line-clamp-1">{item.name}</p>
                    <p className="text-gold text-sm font-bold mt-0.5">{formatCurrency(item.price)}</p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="size-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-sm text-white w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="size-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <Plus size={10} />
                      </button>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto p-1 rounded text-white/30 hover:text-error hover:bg-error/10 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Total</span>
              <span className="text-white font-bold text-lg">{formatCurrency(total)}</span>
            </div>
            <Button onClick={handleCheckout} size="lg" className="w-full">
              Hacer pedido
            </Button>
          </div>
        )}
      </aside>
    </>
  )
}
