import { useNavigate } from 'react-router-dom'
import { Clock, Plus, UserPlus } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface QuickActionsProps {
  onNewSeller?: () => void
}

export function QuickActions({ onNewSeller }: QuickActionsProps) {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader title="Acciones rápidas" />
      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          className="justify-start gap-3"
          onClick={() => navigate('/admin/orders?filter=pending')}
        >
          <Clock size={16} />
          Ver pedidos pendientes
        </Button>
        <Button
          variant="secondary"
          className="justify-start gap-3"
          onClick={() => navigate('/admin/inventory/new')}
        >
          <Plus size={16} />
          Nuevo producto
        </Button>
        {onNewSeller && (
          <Button
            variant="secondary"
            className="justify-start gap-3"
            onClick={onNewSeller}
          >
            <UserPlus size={16} />
            Nuevo vendedor
          </Button>
        )}
      </div>
    </Card>
  )
}
