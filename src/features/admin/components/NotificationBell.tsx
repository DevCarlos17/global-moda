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
  order:     { icon: ClipboardList, color: 'text-gold',    bg: 'bg-gold/10' },
  preorder:  { icon: Ship,          color: 'text-info',    bg: 'bg-info/10' },
  container: { icon: Ship,          color: 'text-success', bg: 'bg-success/10' },
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
      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left"
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
              isUnread ? 'font-semibold text-white' : 'font-medium text-white/60',
            )}
          >
            {item.title}
          </p>
          {isUnread && <span className="size-1.5 rounded-full bg-gold flex-shrink-0" />}
        </div>
        <p className="text-xs text-white/40 truncate mt-0.5">{item.description}</p>
        <p className="text-[10px] text-white/25 mt-1">{timeAgo(item.timestamp)}</p>
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
            ? 'text-white bg-white/10'
            : 'text-white/50 hover:text-white hover:bg-white/10',
        )}
        aria-label="Notificaciones"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-gold text-black text-[10px] font-bold rounded-full leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-white/10 rounded-xl shadow-luxury-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white">Notificaciones</p>
              {notifications.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white/60">
                  {notifications.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2.5 py-12 text-center px-4">
                <Bell size={28} className="text-white/15" />
                <p className="text-sm text-white/40">Sin notificaciones recientes</p>
                <p className="text-xs text-white/25">
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
            <div className="border-t border-white/10 px-4 py-2.5 flex items-center justify-between">
              <button
                onClick={() => { navigate('/admin/orders'); setOpen(false) }}
                className="text-xs text-white/40 hover:text-white transition-colors"
              >
                Ver todos los pedidos →
              </button>
              <span className="text-[10px] text-white/20">Últimos 7 días</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
