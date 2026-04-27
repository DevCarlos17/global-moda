import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/app/config/supabaseClient'
import type { OrderWithDetails } from '@/types/database.types'

async function getOrdersByContainer(containerId: string): Promise<OrderWithDetails[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(
      '*, items:order_items!order_id(*, product:products!product_id(*)), seller:profiles!seller_id(*)',
    )
    .eq('container_id', containerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as OrderWithDetails[]
}

export function useContainerOrders(containerId: string | undefined) {
  return useQuery({
    queryKey: ['containers', containerId, 'orders'],
    queryFn: () => getOrdersByContainer(containerId!),
    enabled: Boolean(containerId),
  })
}
