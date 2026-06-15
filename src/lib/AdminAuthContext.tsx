'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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
    const fetchUserRole = async (u: any) => {
      console.log('Trying to fetch role for email:', u.email)
      const { data, error } = await supabase.from('admin_users').select('role').ilike('email', u.email).maybeSingle()
      if (error) {
        console.error('Error fetching user role:', JSON.stringify(error))
      }
      console.log('Fetched role for', u.email, ':', data?.role)
      return data?.role as AdminRole | undefined
    }

    // Check existing session
    getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const u = data.session.user
        const role = await fetchUserRole(u)
        setUser({
          id: u.id,
          email: u.email || '',
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
          avatar_url: u.user_metadata?.avatar_url,
          role,
        })
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setLoading(true)
        const u = session.user
        const role = await fetchUserRole(u)
        setUser({
          id: u.id,
          email: u.email || '',
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
          avatar_url: u.user_metadata?.avatar_url,
          role,
        })
        setLoading(false)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
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
