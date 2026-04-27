import { X, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/features/cart/store/cartStore'
import { CartList } from '@/features/cart/components/CartList'
import { CartSummary } from '@/features/cart/components/CartSummary'

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const items = useCartStore((s) => s.items)

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#0a0a0a]/50 z-40"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white border-l border-gray-200 z-50
          flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-gray-900" />
            <span className="font-semibold text-gray-900">Mi Carrito</span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Cerrar carrito"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <CartList />
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 flex-shrink-0">
            <CartSummary />
          </div>
        )}
      </aside>
    </>
  )
}
