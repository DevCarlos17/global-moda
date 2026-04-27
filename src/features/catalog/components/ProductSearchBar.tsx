import { Search, X } from 'lucide-react'

interface ProductSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function ProductSearchBar({ value, onChange }: ProductSearchBarProps) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar productos por nombre o SKU..."
        className={`
          w-full h-10 bg-white/5 border border-white/10 rounded-xl
          pl-9 pr-9 text-sm text-white placeholder:text-white/30
          focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/15
          transition-colors duration-150
        `}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
