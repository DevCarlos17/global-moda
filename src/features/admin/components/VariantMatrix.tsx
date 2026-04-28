import { cn } from '@/utils/cn'

interface VariantMatrixProps {
  sizes: string[]
  colors: string[]
  stocks: Record<string, string>
  onStocksChange: (stocks: Record<string, string>) => void
}

export function VariantMatrix({ sizes, colors, stocks, onStocksChange }: VariantMatrixProps) {
  if (sizes.length === 0 || colors.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-4">
        Seleccioná al menos una talla y un color para ver la matriz
      </p>
    )
  }

  const getKey = (size: string, color: string) => `${size}__${color}`

  const updateStock = (size: string, color: string, value: string) => {
    onStocksChange({ ...stocks, [getKey(size, color)]: value })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left pb-2 pr-3 text-xs text-gray-400 font-medium min-w-[90px]">
              Color / Talla
            </th>
            {sizes.map((size) => (
              <th
                key={size}
                className="pb-2 px-2 text-xs text-gray-500 font-medium text-center min-w-[64px]"
              >
                {size}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {colors.map((color) => (
            <tr key={color}>
              <td className="py-1.5 pr-3">
                <span className="text-xs font-medium text-gray-600">{color}</span>
              </td>
              {sizes.map((size) => {
                const val = stocks[getKey(size, color)] ?? ''
                const hasStock = parseInt(val || '0') > 0
                return (
                  <td key={size} className="py-1.5 px-2">
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => updateStock(size, color, e.target.value)}
                      min="0"
                      placeholder="0"
                      className={cn(
                        'w-full h-8 px-2 rounded-lg border bg-white text-xs text-gray-900 text-center',
                        'focus:outline-none focus:border-gray-400 transition-colors',
                        hasStock ? 'border-gray-300' : 'border-gray-200',
                      )}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
