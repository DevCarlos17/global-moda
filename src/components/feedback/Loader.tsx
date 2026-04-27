import { cn } from '@/utils/cn'

interface LoaderProps {
  fullPage?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-10 border-[3px]',
}

export function Loader({ fullPage = false, size = 'md', className }: LoaderProps) {
  const spinner = (
    <span
      className={cn(
        'border-white/20 border-t-gold rounded-full animate-spin inline-block',
        sizeClasses[size],
        className,
      )}
    />
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
        <span className="size-10 border-[3px] border-white/20 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  return spinner
}

export function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[60vh]">
      <Loader size="lg" />
    </div>
  )
}
