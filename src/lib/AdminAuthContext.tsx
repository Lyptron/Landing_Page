'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, getSession, onAuthStateChange, signOut } from './supabase'

import { AdminRole } from './adminRoles'

type User = {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role?: AdminRole
}

type AdminAuthContextType = {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
})

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchUserRole = async (u: SupabaseUser) => {
      const email = (u.email || '').toLowerCase()
      if (!email) return undefined
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('email', email)
        .maybeSingle()
      if (error && process.env.NODE_ENV !== 'production') {
        console.error('Error fetching user role:', error.message)
      }
      return data?.role as AdminRole | undefined
    }

    const buildUser = (u: SupabaseUser, role: AdminRole | undefined): User => ({
      id: u.id,
      email: u.email || '',
      name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
      avatar_url: u.user_metadata?.avatar_url,
      role,
    })

    // Check existing session
    getSession()
      .then(async ({ data }) => {
        if (cancelled) return
        if (data.session?.user) {
          const role = await fetchUserRole(data.session.user)
          if (cancelled) return
          setUser(buildUser(data.session.user, role))
        }
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (_event, session) => {
      if (cancelled) return
      if (session?.user) {
        setLoading(true)
        const role = await fetchUserRole(session.user)
        if (cancelled) return
        setUser(buildUser(session.user, role))
        setLoading(false)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await signOut()
    setUser(null)
  }

  return (
    <AdminAuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}
