import { cn } from '@/utils/cn'

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL']

interface SizeSelectorProps {
  selected: string[]
  onChange: (sizes: string[]) => void
}

export function SizeSelector({ selected, onChange }: SizeSelectorProps) {
  const toggle = (size: string) => {
    if (selected.includes(size)) {
      onChange(selected.filter((s) => s !== size))
    } else {
      onChange([...selected, size])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_SIZES.map((size) => {
        const isSelected = selected.includes(size)
        return (
          <button
            key={size}
            type="button"
            onClick={() => toggle(size)}
            className={cn(
              'min-w-[44px] h-9 px-3 rounded-lg text-sm font-medium border transition-all',
              isSelected
                ? 'bg-gold/20 border-gold text-gold'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white/80',
            )}
          >
            {size}
          </button>
        )
      })}
    </div>
  )
}
