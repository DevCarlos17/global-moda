import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/navigation/Navbar'
import { Sidebar } from '@/components/navigation/Sidebar'
import { useOrdersRealtime } from '@/features/admin/hooks/useOrdersRealtime'
import { useContainersRealtime } from '@/features/containers/hooks/useContainersRealtime'
import { useProductsRealtime } from '@/features/catalog/hooks/useProductsRealtime'

function RealtimeSync() {
  useOrdersRealtime()
  useContainersRealtime()
  useProductsRealtime()
  return null
}

export function AdminLayout() {
  return (
    <div className="flex min-h-dvh">
      <RealtimeSync />
      <Sidebar />

      {/* Main content — always offset by collapsed sidebar width */}
      <div className="flex flex-col flex-1 md:ml-16">
        <Navbar showCart={false} showMenuToggle showLogo={false} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
