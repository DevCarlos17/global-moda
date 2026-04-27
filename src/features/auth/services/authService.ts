import { supabase } from '@/app/config/supabaseClient'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthResult {
  user: User
  session: Session
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (!data.user || !data.session) throw new Error('Login failed: missing user or session')
    return { user: data.user, session: data.session }
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },
}
