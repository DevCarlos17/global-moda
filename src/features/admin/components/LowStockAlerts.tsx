import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import type { LowStockProduct } from '@/types/database.types'

interface LowStockAlertsProps {
  products: LowStockProduct[]
}

export function LowStockAlerts({ products }: LowStockAlertsProps) {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader
        title="Stock bajo"
        description="Productos con ≤5 unidades"
        action={
          products.length > 0 ? (
            <button
              onClick={() => navigate('/admin/products')}
              className="text-xs text-gold hover:text-gold/80 transition-colors"
            >
              Gestionar →
            </button>
          ) : undefined
        }
      />

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="size-8 rounded-full bg-success/15 flex items-center justify-center">
            <AlertTriangle size={16} className="text-success" />
          </div>
          <p className="text-sm text-white/40">Todo el stock en orden</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
            >
              <div
                className={`size-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  product.stock_quantity === 0
                    ? 'bg-error/15'
                    : 'bg-warning/15'
                }`}
              >
                <AlertTriangle
                  size={14}
                  className={
                    product.stock_quantity === 0 ? 'text-error' : 'text-warning'
                  }
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{product.name}</p>
                <p className="text-xs text-white/30 font-mono">{product.sku}</p>
              </div>
              <span
                className={`text-sm font-bold tabular-nums flex-shrink-0 ${
                  product.stock_quantity === 0 ? 'text-error' : 'text-warning'
                }`}
              >
                {product.stock_quantity === 0 ? 'Sin stock' : `${product.stock_quantity} ud.`}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
