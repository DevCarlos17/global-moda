import { useState, useRef, useEffect } from 'react'
import { ShoppingBag, Menu, LogOut, ClipboardList, Sun, Moon, LayoutDashboard } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useCartStore } from '@/features/cart/store/cartStore'
import { useThemeStore } from '@/store/themeStore'
import { NotificationBell } from '@/features/admin/components/NotificationBell'
import { cn } from '@/utils/cn'

interface NavbarProps {
  showCart?: boolean
  showMenuToggle?: boolean
}

function AvatarMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)
  const { mutate: logout, isPending } = useLogout()
  const { theme, toggleTheme } = useThemeStore()
  const location = useLocation()
  const isAdminArea = location.pathname.startsWith('/admin')

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split('@')[0] ??
    ''
  const initial = displayName.charAt(0).toUpperCase() || '?'

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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'size-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
          open
            ? 'bg-white/15 text-white'
            : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white',
        )}
        aria-label="Menú de usuario"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-white/10 rounded-xl shadow-luxury-lg p-1.5 z-50">
          {/* User info */}
          <div className="px-3 py-2.5">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>

          <div className="h-px bg-white/10 my-1" />

          {/* Admin / Catalog toggle */}
          {role === 'admin' && (
            <Link
              to={isAdminArea ? '/catalog' : '/admin'}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LayoutDashboard size={14} />
              {isAdminArea ? 'Ver catálogo' : 'Panel admin'}
            </Link>
          )}

          {/* Theme toggle */}
          <button
            onClick={() => { toggleTheme(); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </button>

          <div className="h-px bg-white/10 my-1" />

          {/* Logout */}
          <button
            onClick={() => logout()}
            disabled={isPending}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-error/70 hover:text-error hover:bg-error/10 transition-colors disabled:opacity-50"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

export function Navbar({ showCart = true, showMenuToggle = false }: NavbarProps) {
  const role = useAuthStore((s) => s.role)
  const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu)
  const location = useLocation()
  const openCart = useCartStore((s) => s.openCart)
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  )

  return (
    <header className="h-16 bg-black flex items-center px-4 gap-3 sticky top-0 z-30">
      {/* Mobile menu toggle */}
      {showMenuToggle && (
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors md:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 flex-1">
        <span className="text-gold font-bold text-lg tracking-widest uppercase">GM</span>
        <span className="hidden sm:block text-white/30 text-xs tracking-wider uppercase font-light">
          Global Moda
        </span>
      </Link>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Orders icon — sellers only */}
        {role === 'seller' && (
          <Link
            to="/orders"
            className={cn(
              'p-2 rounded-lg transition-colors',
              location.pathname.startsWith('/orders')
                ? 'text-white bg-white/10'
                : 'text-white/50 hover:text-white hover:bg-white/10',
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
            className="relative p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Ver carrito"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-gold text-black text-[10px] font-bold rounded-full">
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
