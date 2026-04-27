import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/app/config/supabaseClient'

/**
 * Supabase Realtime subscription for the containers table.
 *
 * Mounted in both SellerLayout and AdminLayout so that:
 *  - Sellers see the OrderWindowBanner appear/disappear instantly when the
 *    admin opens or closes the order window — no page refresh needed.
 *  - Admins see container lists and detail pages update in real time when
 *    a container is created or modified.
 */
export function useContainersRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('containers-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'containers' },
        () => {
          // Invalidates every query that starts with ['containers']:
          //   ['containers']                              → admin containers list
          //   ['containers', id]                          → container detail
          //   ['containers', 'open-window']               → seller banner
          //   ['containers', id, 'orders']                → pedidos incluidos
          //   ['containers', id, 'aggregation']           → lista de compra
          queryClient.invalidateQueries({ queryKey: ['containers'] })
          queryClient.invalidateQueries({ queryKey: ['admin', 'notifications', 'containers'] })
          queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
