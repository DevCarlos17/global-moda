import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Users,
  Ship,
  Store,
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
  const [hovered, setHovered] = useState(false)
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen)
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen)
  const { data: pendingCount = 0 } = usePendingOrdersCount()

  const isExpanded = hovered

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
        { to: '/admin/inventory', icon: <Package size={18} />, label: 'Inventario' },
        { to: '/admin/categories', icon: <Tag size={18} />, label: 'Categorías' },
        { to: '/admin/containers', icon: <Ship size={18} />, label: 'Containers' },
        { to: '/catalog', icon: <Store size={18} />, label: 'Catálogo' },
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
          className="fixed inset-0 bg-[#0a0a0a]/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'fixed left-0 top-0 h-full z-40 bg-white border-r border-gray-200',
          'flex flex-col overflow-hidden',
          'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          // Desktop: collapsed by default, expands on hover
          isExpanded ? 'md:w-56' : 'md:w-16',
          // Mobile: always full width, shown/hidden via translate
          'w-56',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Header — aligned with navbar height */}
        <div className="h-16 flex items-center px-4 flex-shrink-0 border-b border-gray-200 overflow-hidden">
          <span className={cn(
            'font-bold tracking-widest text-sm uppercase text-gray-900 whitespace-nowrap transition-opacity duration-200',
            isExpanded ? 'opacity-100' : 'opacity-0 md:hidden',
          )}>
            Global Moda
          </span>
          <span className={cn(
            'font-bold tracking-widest text-sm uppercase text-gray-900 whitespace-nowrap transition-opacity duration-200 hidden',
            !isExpanded && 'md:block md:mx-auto',
          )}>
            GM
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors md:hidden"
            aria-label="Cerrar menú"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 flex flex-col overflow-y-auto overflow-x-hidden">
          {/* Top sections */}
          <div className="flex flex-col gap-4">
            {sections.map((section, si) => (
              <div key={si} className="flex flex-col gap-0.5">
                {section.label && (
                  isExpanded ? (
                    <p className="px-3 pb-1 pt-0.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      {section.label}
                    </p>
                  ) : (
                    <div className="mx-3 h-px bg-gray-200 mb-1" />
                  )
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
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
                      )
                    }
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className={cn(
                      'truncate flex-1 font-medium whitespace-nowrap transition-opacity duration-200',
                      isExpanded ? 'opacity-100' : 'opacity-0 w-0',
                    )}>
                      {item.label}
                    </span>
                    {item.badge != null && item.badge > 0 && (
                      <span
                        className={cn(
                          'flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center bg-gray-900 text-white whitespace-nowrap transition-opacity duration-200',
                          !isExpanded && 'absolute -top-1 -right-1',
                          isExpanded ? 'opacity-100' : 'opacity-0 md:opacity-100',
                        )}
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </div>

        </nav>
      </aside>
    </>
  )
}
