import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/app/config/supabaseClient'

const STORAGE_KEY = 'admin_notifications_read_at'

const CONTAINER_STATUS_LABEL: Record<string, string> = {
  ordered:    'pedido al proveedor',
  in_transit: 'en tránsito',
  in_customs: 'en aduana',
  arrived:    'llegó al depósito',
}

export type NotificationType = 'order' | 'preorder' | 'container'

export interface AdminNotification {
  id: string
  type: NotificationType
  title: string
  description: string
  timestamp: string
  href: string
}

export function useAdminNotifications() {
  const [lastReadAt, setLastReadAt] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY),
  )

  // ── New seller orders (pending OR confirmed via container) ────────────────
  const { data: orders = [] } = useQuery({
    queryKey: ['admin', 'notifications', 'orders'],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data, error } = await supabase
        .from('orders')
        .select(
          'id, order_number, store_name, created_at, items:order_items!order_id(fulfillment_source)',
        )
        .in('status', ['pending', 'confirmed'])
        .is('parent_order_id', null)
        .not('seller_id', 'is', null)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data ?? []
    },
    // useOrdersRealtime in AdminLayout triggers instant invalidation.
    // Fallback polling in case realtime drops.
    refetchInterval: 60_000,
  })

  // ── Recent container status changes ───────────────────────────────────────
  const { data: containers = [] } = useQuery({
    queryKey: ['admin', 'notifications', 'containers'],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data, error } = await supabase
        .from('containers')
        .select('id, container_number, status, updated_at')
        .in('status', ['ordered', 'in_transit', 'in_customs', 'arrived'])
        .gte('updated_at', since)
        .order('updated_at', { ascending: false })
        .limit(5)
      if (error) throw error
      return data ?? []
    },
    // useContainersRealtime in AdminLayout triggers instant invalidation.
    // Fallback polling in case realtime drops or SQL migration not yet applied.
    refetchInterval: 60_000,
  })

  // ── Build unified notification list ───────────────────────────────────────
  const notifications = useMemo<AdminNotification[]>(() => {
    const items: AdminNotification[] = []

    for (const order of orders) {
      const isPreorder = (order.items as { fulfillment_source: string | null }[])
        ?.some((i) => i.fulfillment_source === 'container')

      items.push({
        id: `order-${order.id}`,
        type: isPreorder ? 'preorder' : 'order',
        title: isPreorder ? 'Nuevo pre-pedido' : 'Nuevo pedido',
        description: `${order.store_name} · #${order.order_number}`,
        timestamp: order.created_at,
        href: '/admin/orders',
      })
    }

    for (const container of containers) {
      items.push({
        id: `container-${container.id}`,
        type: 'container',
        title: 'Container actualizado',
        description: `${container.container_number} — ${CONTAINER_STATUS_LABEL[container.status] ?? container.status}`,
        timestamp: container.updated_at,
        href: `/admin/containers/${container.id}`,
      })
    }

    return items
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 20)
  }, [orders, containers])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !lastReadAt || n.timestamp > lastReadAt).length,
    [notifications, lastReadAt],
  )

  const markAllRead = useCallback(() => {
    const now = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, now)
    setLastReadAt(now)
  }, [])

  return { notifications, unreadCount, markAllRead, lastReadAt }
}
