import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/app/config/supabaseClient'
import { usePublicCartStore } from '@/store/publicCartStore'
import type { CustomerOrderPayload } from '@/features/orders/types/order.types'

export function useCreateCustomerOrder() {
  const navigate = useNavigate()
  const clearCart = usePublicCartStore((s) => s.clearCart)

  return useMutation({
    mutationFn: async (payload: CustomerOrderPayload) => {
      const { data, error } = await supabase.rpc('create_customer_order', {
        p_customer_name:  payload.customerName,
        p_customer_phone: payload.customerPhone,
        p_customer_email: payload.customerEmail ?? null,
        p_address:        payload.address ?? null,
        p_notes:          payload.notes ?? null,
        p_total_amount:   payload.totalAmount,
        p_items: payload.items.map((i) => ({
          product_id: i.product_id,
          quantity:   i.quantity,
          unit_price: i.unit_price,
          subtotal:   i.subtotal,
        })),
      })

      if (error) throw error
      return { orderId: data as string, payload }
    },
    onSuccess: ({ orderId, payload }) => {
      clearCart()
      navigate('/public/success', {
        state: { orderId, payload },
      })
      toast.success('¡Pedido creado!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear el pedido')
    },
  })
}
