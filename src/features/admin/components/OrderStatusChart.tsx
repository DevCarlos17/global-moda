import { Card, CardHeader } from '@/components/ui/Card'
import type { OrderStatusCounts } from '@/types/database.types'

interface OrderStatusChartProps {
  statusCounts: OrderStatusCounts
  total: number
}

const STATUS_CONFIG = [
  { key: 'pending' as const, label: 'Pendiente', color: 'bg-warning' },
  { key: 'confirmed' as const, label: 'Confirmado', color: 'bg-info' },
  { key: 'processing' as const, label: 'En proceso', color: 'bg-gold' },
  { key: 'shipped' as const, label: 'Enviado', color: 'bg-purple-400' },
  { key: 'delivered' as const, label: 'Entregado', color: 'bg-success' },
  { key: 'cancelled' as const, label: 'Cancelado', color: 'bg-error' },
]

export function OrderStatusChart({ statusCounts, total }: OrderStatusChartProps) {
  const activeTotal = STATUS_CONFIG.reduce((sum, s) => sum + (statusCounts[s.key] ?? 0), 0)

  return (
    <Card>
      <CardHeader title="Distribución de estados" description={`${total} pedidos en total`} />

      {/* Horizontal stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden gap-px mb-5">
        {STATUS_CONFIG.map((s) => {
          const count = statusCounts[s.key] ?? 0
          const pct = activeTotal > 0 ? (count / activeTotal) * 100 : 0
          if (pct === 0) return null
          return (
            <div
              key={s.key}
              className={`${s.color} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${s.label}: ${count}`}
            />
          )
        })}
        {activeTotal === 0 && <div className="bg-white/10 w-full" />}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {STATUS_CONFIG.map((s) => {
          const count = statusCounts[s.key] ?? 0
          const pct = activeTotal > 0 ? Math.round((count / activeTotal) * 100) : 0
          return (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`size-2 rounded-full flex-shrink-0 ${s.color}`} />
              <span className="text-xs text-white/50 truncate">{s.label}</span>
              <span className="text-xs font-medium text-white ml-auto tabular-nums">
                {count}
              </span>
              {count > 0 && (
                <span className="text-[10px] text-white/25 tabular-nums">({pct}%)</span>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
