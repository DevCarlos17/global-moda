import { create } from 'zustand'
import type { User, Session, Subscription } from '@supabase/supabase-js'
import { supabase } from '@/app/config/supabaseClient'
import type { UserRole } from '@/types/database.types'

interface AuthState {
  user: User | null
  session: Session | null
  role: UserRole | null
  isLoading: boolean
  isAuthenticated: boolean
  _subscription: Subscription | null
  initialize: () => Promise<() => void>
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setRole: (role: UserRole | null) => void
  clearAuth: () => void
}

async function fetchRoleFromProfile(userId: string): Promise<UserRole | null> {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return (data?.role as UserRole) ?? null
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
  _subscription: null,

  initialize: async () => {
    get()._subscription?.unsubscribe()

    try {
      const { data: { session } } = await supabase.auth.getSession()

      // Read role from profiles table — source of truth
      const role = session?.user
        ? await fetchRoleFromProfile(session.user.id)
        : null

      set({
        session,
        user: session?.user ?? null,
        role,
        isAuthenticated: !!session,
        isLoading: false,
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        set({
          session: newSession,
          user: newSession?.user ?? null,
          isAuthenticated: !!newSession,
          // Role stays as-is on token refresh; cleared on sign-out
          role: newSession ? get().role : null,
        })
      })

      set({ _subscription: subscription })
      return () => subscription.unsubscribe()
    } catch {
      set({ isLoading: false })
      return () => undefined
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setSession: (session) => set({ session }),

  setRole: (role) => set({ role }),

  clearAuth: () =>
    set({ user: null, session: null, role: null, isAuthenticated: false }),
}))
