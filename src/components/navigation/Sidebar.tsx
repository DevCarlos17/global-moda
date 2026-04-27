import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Users,
  Ship,
  X,
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { usePendingOrdersCount } from '@/features/admin/hooks/usePendingOrdersCount'
import { cn } from '@/utils/cn'

interface NavItem {
  to: string
  icon: ReactNode
  label: string
  badge?: number
}

interface NavSection {
  label?: string
  items: NavItem[]
}

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen)
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen)
  const { data: pendingCount = 0 } = usePendingOrdersCount()

  const sections: NavSection[] = [
    {
      items: [
        { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
      ],
    },
    {
      label: 'Gestión',
      items: [
        {
          to: '/admin/orders',
          icon: <ShoppingCart size={18} />,
          label: 'Pedidos',
          badge: pendingCount > 0 ? pendingCount : undefined,
        },
        { to: '/admin/products', icon: <Package size={18} />, label: 'Productos' },
        { to: '/admin/categories', icon: <Tag size={18} />, label: 'Categorías' },
        { to: '/admin/containers', icon: <Ship size={18} />, label: 'Containers' },
      ],
    },
    {
      label: 'Equipo',
      items: [
        { to: '/admin/sellers', icon: <Users size={18} />, label: 'Usuarios' },
      ],
    },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-40 bg-surface',
          'flex flex-col transition-all duration-300',
          sidebarOpen ? 'md:w-56' : 'md:w-16',
          'w-56',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Header — aligned with navbar height */}
        <div className="h-16 flex items-center justify-between px-4 flex-shrink-0">
          {sidebarOpen ? (
            <span className="text-gold font-bold tracking-widest text-sm uppercase">
              Global Moda
            </span>
          ) : (
            <span className="text-gold font-bold tracking-widest text-sm uppercase mx-auto">
              GM
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors md:hidden"
            aria-label="Cerrar menú"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 flex flex-col gap-4 overflow-y-auto">
          {sections.map((section, si) => (
            <div key={si} className="flex flex-col gap-0.5">
              {section.label && sidebarOpen && (
                <p className="px-3 pb-1 pt-0.5 text-[10px] font-semibold text-white/20 uppercase tracking-widest">
                  {section.label}
                </p>
              )}
              {section.label && !sidebarOpen && (
                <div className="mx-3 h-px bg-white/10 mb-1" />
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 text-sm',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/40 hover:text-white hover:bg-white/10',
                    )
                  }
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="truncate flex-1 font-medium">{item.label}</span>
                  )}
                  {item.badge != null && item.badge > 0 && (
                    <span
                      className={cn(
                        'flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center bg-gold text-black',
                        !sidebarOpen && 'absolute -top-1 -right-1',
                      )}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
