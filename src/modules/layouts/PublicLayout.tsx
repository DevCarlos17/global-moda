import { Outlet } from 'react-router-dom'
import { ShoppingBag, Sun, Moon } from 'lucide-react'
import { usePublicCartStore } from '@/store/publicCartStore'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/utils/cn'
import { PublicCartDrawer } from '@/features/public/components/PublicCartDrawer'

export function PublicLayout() {
  const itemCount = usePublicCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  )
  const openCart = usePublicCartStore((s) => s.openCart)
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="h-16 bg-black border-b border-white/10 flex items-center px-4 gap-4 sticky top-0 z-30">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-1">
          <span className="text-gold font-bold text-lg tracking-widest uppercase">GM</span>
          <span className="hidden sm:block text-white/60 text-xs tracking-wider uppercase font-light">
            Global Moda
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={openCart}
            className="relative p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Ver carrito"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span
                className={cn(
                  'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1',
                  'flex items-center justify-center bg-gold text-black text-[10px] font-bold rounded-full',
                )}
              >
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <PublicCartDrawer />
    </div>
  )
}
