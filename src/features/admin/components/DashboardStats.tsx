import type { ReactNode } from 'react'
import { ShoppingCart, Package, DollarSign, Clock } from 'lucide-react'
import { formatCurrency } from '@/utils/formatCurrency'
import type { ExtendedDashboardStats } from '@/types/database.types'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  iconColor?: string
  sub?: string
}

function StatCard({ title, value, icon, iconColor = 'text-gold', sub }: StatCardProps) {
  return (
    <div className="bg-surface border border-white/10 rounded-2xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-white/5 flex-shrink-0 ${iconColor}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-white/40 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

interface DashboardStatsProps {
  stats: ExtendedDashboardStats
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Pendientes"
        value={stats.pendingOrders}
        icon={<Clock size={20} />}
        iconColor="text-warning"
        sub="Requieren atención"
      />
      <StatCard
        title="En proceso"
        value={stats.statusCounts.processing + stats.statusCounts.shipped}
        icon={<ShoppingCart size={20} />}
        iconColor="text-gold"
        sub={`${stats.statusCounts.processing} procesando · ${stats.statusCounts.shipped} enviados`}
      />
      <StatCard
        title="Ingresos del mes"
        value={formatCurrency(stats.revenueMonth)}
        icon={<DollarSign size={20} />}
        iconColor="text-gold"
        sub={`Hoy: ${formatCurrency(stats.revenueToday)}`}
      />
      <StatCard
        title="Productos activos"
        value={stats.activeProducts}
        icon={<Package size={20} />}
        iconColor="text-info"
        sub={`${stats.totalProducts} en total`}
      />
    </div>
  )
}
