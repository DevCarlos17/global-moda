import { useCartStore } from '@/features/cart/store/cartStore'
import { CartItem } from '@/features/cart/components/CartItem'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ShoppingBag } from 'lucide-react'

export function CartList() {
  const items = useCartStore((s) => s.items)

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag size={48} />}
        title="Tu carrito está vacío"
        description="Agrega productos desde el catálogo"
      />
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {items.map((item) => (
        <li key={item.id}>
          <CartItem item={item} />
        </li>
      ))}
    </ul>
  )
}
