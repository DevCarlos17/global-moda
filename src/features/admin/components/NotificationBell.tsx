import { useState, useRef, useEffect } from 'react'
import { Bell, ClipboardList, Ship, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdminNotifications } from '@/features/admin/hooks/useAdminNotifications'
import { cn } from '@/utils/cn'
import type { AdminNotification, NotificationType } from '@/features/admin/hooks/useAdminNotifications'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Ahora mismo'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} día${days !== 1 ? 's' : ''}`
}

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  order:     { icon: ClipboardList, color: 'text-gray-700', bg: 'bg-gray-100' },
  preorder:  { icon: Ship,          color: 'text-info',     bg: 'bg-info/10' },
  container: { icon: Ship,          color: 'text-success',  bg: 'bg-success/10' },
}

// ─── NotificationItem ─────────────────────────────────────────────────────────

function NotificationItem({
  item,
  isUnread,
  onClick,
}: {
  item: AdminNotification
  isUnread: boolean
  onClick: () => void
}) {
  const { icon: Icon, color, bg } = TYPE_CONFIG[item.type]

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
    >
      {/* Icon */}
      <span className={cn('p-1.5 rounded-lg flex-shrink-0 mt-0.5', bg)}>
        <Icon size={13} className={color} />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              'text-sm truncate',
              isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-500',
            )}
          >
            {item.title}
          </p>
          {isUnread && <span className="size-1.5 rounded-full bg-gray-900 flex-shrink-0" />}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{item.description}</p>
        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(item.timestamp)}</p>
      </div>
    </button>
  )
}

// ─── NotificationBell ─────────────────────────────────────────────────────────

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { notifications, unreadCount, markAllRead, lastReadAt } = useAdminNotifications()

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleToggle() {
    const isOpening = !open
    setOpen(isOpening)
    // Mark all as read when opening the panel
    if (isOpening && unreadCount > 0) markAllRead()
  }

  function handleItemClick(href: string) {
    navigate(href)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={handleToggle}
        className={cn(
          'relative p-2 rounded-lg transition-colors',
          open
            ? 'text-gray-700 bg-gray-100'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
        )}
        aria-label="Notificaciones"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-gray-900 text-white text-[10px] font-bold rounded-full leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">Notificaciones</p>
              {notifications.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                  {notifications.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2.5 py-12 text-center px-4">
                <Bell size={28} className="text-gray-300" />
                <p className="text-sm text-gray-500">Sin notificaciones recientes</p>
                <p className="text-xs text-gray-400">
                  Los nuevos pedidos y cambios de container aparecerán aquí
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  item={n}
                  isUnread={!lastReadAt || n.timestamp > lastReadAt}
                  onClick={() => handleItemClick(n.href)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-2.5 flex items-center justify-between">
              <button
                onClick={() => { navigate('/admin/orders'); setOpen(false) }}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Ver todos los pedidos →
              </button>
              <span className="text-[10px] text-gray-400">Últimos 7 días</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
