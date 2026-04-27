import { useState, useRef, type TouchEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ImageCarouselProps {
  images: string[]
  alt: string
  className?: string
}

export function ImageCarousel({ images, alt, className }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const count = images.length

  const prev = () => setCurrent((i) => (i === 0 ? count - 1 : i - 1))
  const next = () => setCurrent((i) => (i === count - 1 ? 0 : i + 1))

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      if (diff > 0) next()
      else prev()
    }
    touchStartX.current = null
  }

  if (count === 0) {
    return (
      <div
        className={cn(
          'aspect-[3/4] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 text-sm',
          className,
        )}
      >
        Sin imagen
      </div>
    )
  }

  if (count === 1) {
    return (
      <div className={cn('aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100', className)}>
        <img src={images[0]} alt={alt} className="size-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={cn('relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 select-none', className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images */}
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${alt} ${i + 1}`}
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity duration-300',
            i === current ? 'opacity-100' : 'opacity-0',
          )}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        aria-label="Anterior"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        aria-label="Siguiente"
      >
        <ChevronRight size={16} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              'rounded-full transition-all',
              i === current ? 'bg-gray-900 w-4 h-1.5' : 'bg-gray-300 size-1.5',
            )}
            aria-label={`Imagen ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
