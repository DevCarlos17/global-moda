import type { ReactNode } from 'react'
import { PackageOpen } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({
  title = 'Sin resultados',
  description = 'No hay elementos para mostrar.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center">
      <div className="text-white/20">
        {icon ?? <PackageOpen size={48} />}
      </div>
      <div>
        <h3 className="text-base font-semibold text-white/70">{title}</h3>
        <p className="mt-1 text-sm text-white/40">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
