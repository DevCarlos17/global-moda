import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh bg-black flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-10 text-center">
        <span className="text-gold font-bold text-4xl tracking-widest uppercase">GM</span>
        <p className="mt-2 text-white/40 text-sm tracking-widest uppercase font-light">
          Global Moda Imports
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-surface border border-white/10 rounded-2xl p-8">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-white/20 text-xs">
        © {new Date().getFullYear()} Global Moda Imports
      </p>
    </div>
  )
}
