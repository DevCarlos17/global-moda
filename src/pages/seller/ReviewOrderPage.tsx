import { useCartStore } from '@/features/cart/store/cartStore'
import { OrderReviewForm } from '@/features/orders/components/OrderReviewForm'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ShoppingBag } from 'lucide-react'

export function ReviewOrderPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-4">
        <EmptyState
          title="Carrito vacío"
          description="Agrega productos antes de revisar tu pedido"
          icon={<ShoppingBag size={48} />}
          action={
            <Button onClick={() => navigate('/catalog')}>
              Ir al catálogo
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Revisar Pedido</h1>
      <OrderReviewForm />
    </div>
  )
}
