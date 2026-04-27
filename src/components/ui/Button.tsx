import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gray-900 text-white font-semibold hover:bg-gray-800 active:bg-gray-700 disabled:opacity-50',
  secondary:
    'bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 active:bg-gray-200 disabled:opacity-50',
  outline:
    'border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50',
  ghost:
    'text-gray-500 font-medium hover:text-gray-900 hover:bg-gray-100 active:bg-gray-100 disabled:opacity-50',
  danger:
    'bg-red-600 text-white font-medium hover:bg-red-700 active:bg-red-800 disabled:opacity-50',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm rounded-md',
  md: 'h-10 px-5 text-sm rounded-lg',
  lg: 'h-12 px-6 text-base rounded-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer select-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {isLoading && (
        <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
