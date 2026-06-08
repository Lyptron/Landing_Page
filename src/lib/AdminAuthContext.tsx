'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, getSession, onAuthStateChange, signOut } from './supabase'

type User = {
  id: string
  email: string
  name?: string
  avatar_url?: string
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
    // Check existing session
    getSession().then(({ data }) => {
      if (data.session?.user) {
        const u = data.session.user
        setUser({
          id: u.id,
          email: u.email || '',
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
          avatar_url: u.user_metadata?.avatar_url,
        })
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user
        setUser({
          id: u.id,
          email: u.email || '',
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
          avatar_url: u.user_metadata?.avatar_url,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
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
