import { useState } from 'react'
import { useDashboardStats } from '@/features/admin/hooks/useDashboardStats'
import { DashboardStats } from '@/features/admin/components/DashboardStats'
import { RecentOrdersList } from '@/features/admin/components/RecentOrdersList'
import { OrderStatusChart } from '@/features/admin/components/OrderStatusChart'
import { LowStockAlerts } from '@/features/admin/components/LowStockAlerts'
import { QuickActions } from '@/features/admin/components/QuickActions'
import { CreateUserModal } from '@/features/sellers/components/CreateUserModal'
import { PageLoader } from '@/components/feedback/Loader'
import { ErrorState } from '@/components/feedback/ErrorState'

export function DashboardPage() {
  const { data: stats, isLoading, error, refetch } = useDashboardStats()
  const [showNewSeller, setShowNewSeller] = useState(false)

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState onRetry={refetch} />
  if (!stats) return null

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>

      {/* Row 1: 4 KPI stat cards */}
      <DashboardStats stats={stats} />

      {/* Row 2: Recent orders + Status chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersList orders={stats.recentOrders} />
        <OrderStatusChart statusCounts={stats.statusCounts} total={stats.totalOrders} />
      </div>

      {/* Row 3: Low stock alerts + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockAlerts products={stats.lowStockProducts} />
        <QuickActions onNewSeller={() => setShowNewSeller(true)} />
      </div>

      <CreateUserModal isOpen={showNewSeller} onClose={() => setShowNewSeller(false)} />
    </div>
  )
}
