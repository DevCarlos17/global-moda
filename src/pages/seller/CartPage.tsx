import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/features/cart/store/cartStore'
import { CartList } from '@/features/cart/components/CartList'
import { CartSummary } from '@/features/cart/components/CartSummary'

export function CartPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)

  return (
    <div className="max-w-xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        <span className="text-sm">Seguir comprando</span>
      </button>

      <h1 className="text-xl font-semibold text-white mb-6">Mi Carrito</h1>

      <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden">
        <CartList />
        {items.length > 0 && (
          <div className="border-t border-white/10">
            <CartSummary />
          </div>
        )}
      </div>
    </div>
  )
}
