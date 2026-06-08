'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/AdminAuthContext'
import EnterpriseAdminLayout from './EnterpriseAdminLayout'

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Login page should not be wrapped
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push('/admin/login')
    }
  }, [loading, user, isLoginPage, router])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-lg animate-pulse" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))', color: '#050505' }}>
            L
          </div>
          <p className="text-white/20 text-[13px] font-mono">Loading...</p>
        </div>
      </div>
    )
  }

  // Login page renders without layout
  if (isLoginPage) {
    return <>{children}</>
  }

  // Not logged in — will redirect (useEffect above)
  if (!user) {
    return null
  }

  // Logged in — render with admin layout
  return (
    <EnterpriseAdminLayout>
      {children}
    </EnterpriseAdminLayout>
  )
}
