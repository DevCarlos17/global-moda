import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Ocurrió un error',
  description = 'No se pudieron cargar los datos. Inténtalo de nuevo.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center">
      <div className="text-error/60">
        <AlertCircle size={48} />
      </div>
      <div>
        <h3 className="text-base font-semibold text-white/70">{title}</h3>
        <p className="mt-1 text-sm text-white/40">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
