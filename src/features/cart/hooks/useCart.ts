import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { cartService } from '@/features/cart/services/cartService'
import { useCartStore } from '@/features/cart/store/cartStore'
import { useAuthStore } from '@/store/authStore'

export function useCart() {
  const userId = useAuthStore((s) => s.user?.id)
  const setItems = useCartStore((s) => s.setItems)

  const query = useQuery({
    queryKey: ['cart', userId],
    queryFn: () => cartService.getCartItems(userId!),
    enabled: Boolean(userId),
  })

  // Sync server data to store
  useEffect(() => {
    if (query.data) {
      setItems(query.data)
    }
  }, [query.data, setItems])

  return query
}
