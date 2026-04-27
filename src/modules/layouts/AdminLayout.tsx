import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/navigation/Navbar'
import { Sidebar } from '@/components/navigation/Sidebar'
import { useUIStore } from '@/store/uiStore'
import { useOrdersRealtime } from '@/features/admin/hooks/useOrdersRealtime'
import { useContainersRealtime } from '@/features/containers/hooks/useContainersRealtime'
import { useProductsRealtime } from '@/features/catalog/hooks/useProductsRealtime'
import { cn } from '@/utils/cn'

function RealtimeSync() {
  useOrdersRealtime()
  useContainersRealtime()
  useProductsRealtime()
  return null
}

export function AdminLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  return (
    <div className="flex min-h-dvh">
      <RealtimeSync />
      <Sidebar />

      {/* Main content — offset by sidebar width */}
      <div
        className={cn(
          'flex flex-col flex-1 transition-all duration-300',
          sidebarOpen ? 'md:ml-56' : 'md:ml-16',
        )}
      >
        <Navbar showCart={false} showMenuToggle />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
