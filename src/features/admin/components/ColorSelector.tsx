import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ColorOption {
  name: string
  hex: string
}

const FASHION_COLORS: ColorOption[] = [
  { name: 'Negro', hex: '#111111' },
  { name: 'Blanco', hex: '#F5F5F5' },
  { name: 'Beige', hex: '#D4B896' },
  { name: 'Rojo', hex: '#C0392B' },
  { name: 'Azul marino', hex: '#1A3A5C' },
  { name: 'Azul', hex: '#2980B9' },
  { name: 'Verde', hex: '#27AE60' },
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Gris', hex: '#7F8C8D' },
  { name: 'Rosa', hex: '#E91E8C' },
  { name: 'Marrón', hex: '#795548' },
  { name: 'Mostaza', hex: '#F39C12' },
]

interface ColorSelectorProps {
  selected: string[]
  onChange: (colors: string[]) => void
}

export function ColorSelector({ selected, onChange }: ColorSelectorProps) {
  const toggle = (colorName: string) => {
    if (selected.includes(colorName)) {
      onChange(selected.filter((c) => c !== colorName))
    } else {
      onChange([...selected, colorName])
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {FASHION_COLORS.map((color) => {
        const isSelected = selected.includes(color.name)
        const isLight = ['Blanco', 'Beige'].includes(color.name)

        return (
          <button
            key={color.name}
            type="button"
            onClick={() => toggle(color.name)}
            title={color.name}
            className={cn(
              'flex flex-col items-center gap-1.5 group',
            )}
          >
            <div
              className={cn(
                'size-8 rounded-full border-2 flex items-center justify-center transition-all',
                isSelected
                  ? 'border-gray-900 scale-110 shadow-[0_0_0_2px_rgba(0,0,0,0.15)]'
                  : 'border-transparent hover:scale-105',
              )}
              style={{ backgroundColor: color.hex }}
            >
              {isSelected && (
                <Check
                  size={14}
                  className={isLight ? 'text-black' : 'text-white'}
                  strokeWidth={3}
                />
              )}
            </div>
            <span
              className={cn(
                'text-[10px] leading-tight transition-colors',
                isSelected ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-800',
              )}
            >
              {color.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
