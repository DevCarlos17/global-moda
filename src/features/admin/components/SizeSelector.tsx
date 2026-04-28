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
                ? 'bg-gray-900 border-gray-900 text-white'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800',
            )}
          >
            {size}
          </button>
        )
      })}
    </div>
  )
}
