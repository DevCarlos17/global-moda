import { Search, X } from 'lucide-react'

interface ProductSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function ProductSearchBar({ value, onChange }: ProductSearchBarProps) {
  return (
    <div className="relative">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar productos por nombre o SKU..."
        className="w-full h-9 bg-white border border-gray-200 rounded-lg pl-9 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
