import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending, error } = useLogin()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    login({ email, password })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <h1 className="text-xl font-semibold text-gray-900">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-gray-500">Accede a tu cuenta para continuar</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
          {error.message || 'Credenciales incorrectas'}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail size={14} />}
        required
        autoComplete="email"
      />

      <Input
        label="Contraseña"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock size={14} />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        }
        required
        autoComplete="current-password"
      />

      <Button
        type="submit"
        isLoading={isPending}
        className="w-full mt-2"
        size="lg"
      >
        {isPending ? 'Ingresando...' : 'Ingresar'}
      </Button>
    </form>
  )
}
