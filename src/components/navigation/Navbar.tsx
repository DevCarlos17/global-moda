import { useState, useRef, useEffect } from 'react'
import { ShoppingBag, Menu, LogOut, ClipboardList, LayoutDashboard } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useCartStore } from '@/features/cart/store/cartStore'
import { NotificationBell } from '@/features/admin/components/NotificationBell'
import { cn } from '@/utils/cn'

interface NavbarProps {
  showCart?: boolean
  showMenuToggle?: boolean
  showLogo?: boolean
}

function AvatarMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)
  const { mutate: logout, isPending } = useLogout()
  const location = useLocation()
  const isAdminArea = location.pathname.startsWith('/admin')

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split('@')[0] ??
    ''
  const initial = displayName.charAt(0).toUpperCase() || '?'

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'size-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
          open
            ? 'bg-gray-200 text-gray-900'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900',
        )}
        aria-label="Menú de usuario"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-dropdown p-1.5 z-50">
          {/* User info */}
          <div className="px-3 py-2.5">
            <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>

          <div className="h-px bg-gray-100 my-1" />

          {/* Admin / Catalog toggle */}
          {role === 'admin' && (
            <Link
              to={isAdminArea ? '/catalog' : '/admin'}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <LayoutDashboard size={14} />
              {isAdminArea ? 'Ver catálogo' : 'Panel admin'}
            </Link>
          )}

          <div className="h-px bg-gray-100 my-1" />

          {/* Logout */}
          <button
            onClick={() => logout()}
            disabled={isPending}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

export function Navbar({ showCart = true, showMenuToggle = false, showLogo = true }: NavbarProps) {
  const role = useAuthStore((s) => s.role)
  const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu)
  const location = useLocation()
  const openCart = useCartStore((s) => s.openCart)
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  )

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-3 sticky top-0 z-30">
      {/* Mobile menu toggle */}
      {showMenuToggle && (
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors md:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Logo */}
      {showLogo ? (
        <Link to="/" className="flex items-center gap-2.5 flex-1">
          <span className="font-bold text-lg tracking-widest uppercase text-gray-900">GM</span>
          <span className="hidden sm:block text-gray-400 text-xs tracking-wider uppercase font-light">
            Global Moda
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Orders icon — sellers only */}
        {role === 'seller' && (
          <Link
            to="/orders"
            className={cn(
              'p-2 rounded-lg transition-colors',
              location.pathname.startsWith('/orders')
                ? 'text-gray-900 bg-gray-100'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
            )}
            aria-label="Mis pedidos"
          >
            <ClipboardList size={18} />
          </Link>
        )}

        {/* Notification bell — admin only */}
        {role === 'admin' && <NotificationBell />}

        {/* Cart */}
        {showCart && (
          <button
            onClick={openCart}
            className="relative p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Ver carrito"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-gray-900 text-white text-[10px] font-bold rounded-full">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        )}

        {/* Avatar dropdown */}
        <AvatarMenu />
      </div>
    </header>
  )
}
