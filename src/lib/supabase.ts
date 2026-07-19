import { createClient, Session } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (process.env.NODE_ENV === 'production' && (!supabaseUrl || !supabaseAnonKey)) {
  // Fail loudly in production rather than constructing a fake client that
  // silently looks alive while every query 4xx's.
  throw new Error(
    'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export const isSupabaseConfigured = () =>
  supabaseUrl !== '' && supabaseAnonKey !== '' && !supabaseUrl.includes('placeholder')

// ─── Auth Helpers ────────────────────────────────────────────

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getSession() {
  return supabase.auth.getSession()
}

export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback)
}
