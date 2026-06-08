import { AdminAuthProvider } from '@/lib/AdminAuthContext'
import AdminAuthGate from '@/components/layout/AdminAuthGate'

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminAuthGate>
        {children}
      </AdminAuthGate>
    </AdminAuthProvider>
  )
}
