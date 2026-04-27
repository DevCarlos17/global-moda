import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/app/config/supabaseClient'

/**
 * Supabase Realtime subscription for the orders table.
 * Mounted in AdminLayout — stays active for the entire admin session.
 *
 * When any order is INSERT/UPDATE/DELETE:
 *  - orders table refetches immediately
 *  - sidebar pending badge refetches immediately
 *  - notification bell refetches immediately
 */
export function useOrdersRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
          queryClient.invalidateQueries({ queryKey: ['admin', 'pending-count'] })
          queryClient.invalidateQueries({ queryKey: ['admin', 'notifications', 'orders'] })
          queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
          queryClient.invalidateQueries({ queryKey: ['orders'] })
          queryClient.invalidateQueries({ queryKey: ['unassigned-pre-orders'] })
          // Keeps container order lists and aggregation in sync when orders
          // are created, assigned, or their status changes.
          queryClient.invalidateQueries({ queryKey: ['containers'] })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
