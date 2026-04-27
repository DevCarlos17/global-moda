import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/features/cart/store/cartStore'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatCurrency'

export function CartSummary() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const closeCart = useCartStore((s) => s.closeCart)

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0,
  )
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckout = () => {
    closeCart()
    navigate('/orders/review')
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex justify-between text-sm text-gray-500">
        <span>{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</span>
        <span className="text-gray-900 font-semibold">{formatCurrency(subtotal)}</span>
      </div>
      <Button className="w-full" onClick={handleCheckout}>
        Revisar pedido
      </Button>
    </div>
  )
}
