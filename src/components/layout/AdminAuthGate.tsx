'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/AdminAuthContext'
import EnterpriseAdminLayout from './EnterpriseAdminLayout'
import { canAccessRoute, getFallbackRoute } from '@/lib/adminRoles'
import { toLogicalPathname } from '@/lib/portalPath'
import { LyptronMark } from '@/components/ui/LyptronLogo'

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAdminAuth()
  const pathname = toLogicalPathname(usePathname())
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  // Login page should not be wrapped
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (loading) return

    // Reset on every dependency change so a previously-authorized
    // page can't briefly render after navigating to a forbidden one.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthorized(false)

    if (!user && !isLoginPage) {
      router.push('/admin/login')
      return
    }

    if (user && !isLoginPage) {
      if (!user.role) return // handled below by the "Access Denied" screen

      if (!canAccessRoute(user.role, pathname)) {
        router.push(getFallbackRoute(user.role))
        return
      }

      setAuthorized(true)
    }
  }, [loading, user, isLoginPage, pathname, router])

  // Loading state
  if (loading) {
    return (
      <div className="admin-shell min-h-screen flex flex-col items-center justify-center bg-(--cp-bg) gap-5 text-center select-none">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-17 h-17 rounded-full border border-dashed border-(--cp-cyan) animate-spin [animation-duration:3s]" />
          <div className="absolute w-14 h-14 rounded-full border border-(--cp-cyan-border) animate-ping opacity-40 [animation-duration:1.5s]" />
          <LyptronMark size={50} className="relative z-10 shadow-md" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-display font-bold text-[18px] tracking-tight text-(--cp-text)">Lyptron</span>
          <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-(--cp-text-faint)">Loading portal...</span>
        </div>
      </div>
    )
  }

  // Login page renders without layout
  if (isLoginPage) {
    return <>{children}</>
  }

  // Not logged in
  if (!user) {
    return null
  }

  // Logged in but no role
  if (user && !user.role && !isLoginPage) {
    return (
      <div className="admin-shell min-h-screen flex items-center justify-center" style={{ background: 'var(--cp-bg)', color: 'var(--cp-text)' }}>
        <div className="cp-card flex flex-col items-center gap-4 text-center max-w-md p-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ background: 'var(--cp-red-soft)', color: 'var(--cp-red)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h2 className="text-xl font-bold font-display" style={{ color: 'var(--cp-text)' }}>Access Denied</h2>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--cp-text-secondary)' }}>
            You are logged in as <strong style={{ color: 'var(--cp-text)' }}>{user.email}</strong>, but your account hasn&apos;t been assigned an admin role yet.
          </p>
          <p className="text-[12px] mt-2 mb-4 p-3 rounded-xl" style={{ color: 'var(--cp-text-muted)', background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)' }}>
            Please ask an existing Founder to add your email to the <code>admin_users</code> table with a valid role.
          </p>
          <button
            onClick={logout}
            className="cp-btn-primary px-5 py-2.5 text-[13px]"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  // Not authorized
  if (!authorized) {
    return null
  }

  // Logged in and authorized — render with admin layout
  return (
    <EnterpriseAdminLayout>
      {children}
    </EnterpriseAdminLayout>
  )
}
