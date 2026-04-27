import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, padding = 'md', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-xl',
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
