'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Map,
  Hammer,
  Package,
  Image as ImageIcon,
  ClipboardCheck,
  MessageSquare,
  FileText,
  Video,
  Wallet,
  Users,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { fetchProjectByAccessCode } from '@/lib/db'
import { LyptronLogo, LyptronMark } from '@/components/ui/LyptronLogo'
import ThemeToggle from '@/components/admin/ThemeToggle'

const NAV_GROUPS = (code: string) => [
  {
    label: 'Progress',
    items: [
      { name: 'Dashboard', path: `/client/${code}/dashboard`, icon: LayoutDashboard },
      { name: 'Timeline', path: `/client/${code}/timeline`, icon: Map },
      { name: 'Development Updates', path: `/client/${code}/development`, icon: Hammer },
      { name: 'Deliverables', path: `/client/${code}/deliverables`, icon: Package },
    ],
  },
  {
    label: 'Review',
    items: [
      { name: 'Approvals', path: `/client/${code}/approvals`, icon: ClipboardCheck },
      { name: 'Feedback', path: `/client/${code}/feedback`, icon: MessageSquare },
      { name: 'Finance', path: `/client/${code}/finance`, icon: Wallet },
    ],
  },
  {
    label: 'Assets',
    items: [
      { name: 'Documents', path: `/client/${code}/documents`, icon: FileText },
      { name: 'Meetings', path: `/client/${code}/meetings`, icon: Video },
      { name: 'Team', path: `/client/${code}/team`, icon: Users },
      { name: 'Gallery', path: `/client/${code}/gallery`, icon: ImageIcon },
    ],
  },
]

interface ProjectSummary {
  name: string
  status: string
  progress: number
  health: string
}

interface SidebarContentProps {
  project: ProjectSummary | null
  groups: any[]
  pathname: string
  onNavigate?: () => void
  onExit?: (e: React.MouseEvent) => void
}

function SidebarContent({ project, groups, pathname, onNavigate, onExit }: SidebarContentProps) {
  return (
    <>
      {/* Brand + Project header */}
      <div className="p-5 pb-6 border-b" style={{ borderColor: 'var(--cp-border-soft)' }}>
        <div
          className="rounded-[14px] p-3.5 flex items-center gap-3"
          style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}
        >
          <LyptronLogo subtitle={project?.name || 'Client Portal'} textClassName="text-[15px]" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-1">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="px-3 pt-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--cp-text-faint)' }}>
              {group.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item: any) => {
                const isActive = pathname === item.path
                return (
                  <Link href={item.path} key={item.name} onClick={onNavigate}>
                    <div
                      className="relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] transition-colors group hover:bg-[var(--cp-surface)]"
                      style={{ color: isActive ? 'var(--cp-text)' : 'var(--cp-text-muted)' }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="client-sidebar-active"
                          className="absolute inset-0 rounded-[10px]"
                          style={{ background: 'var(--cp-cyan-soft)', border: '1px solid var(--cp-cyan-border)' }}
                          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        />
                      )}
                      <item.icon
                        className="w-[16px] h-[16px] relative z-10 shrink-0 transition-colors"
                        style={{ color: isActive ? 'var(--cp-cyan)' : undefined }}
                      />
                      <span className="font-medium relative z-10 truncate">{item.name}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
        <button
          onClick={onExit}
          className="flex items-center gap-3 px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors hover:text-[var(--cp-text)] w-full text-left bg-transparent border-0 cursor-pointer"
          style={{ color: 'var(--cp-text-muted)' }}
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Portal</span>
        </button>
      </div>
    </>
  )
}

export default function ClientPortalLayout({
  children,
  projectCode,
}: {
  children: React.ReactNode
  projectCode: string
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [project, setProject] = useState<ProjectSummary | null>(null)
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  const handleExit = (e: React.MouseEvent) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('client_access_code')
      window.location.replace('/client')
    }
  }

  const groups = NAV_GROUPS(projectCode)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCode = sessionStorage.getItem('client_access_code')
      if (savedCode !== projectCode) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAuthorized(false)
        window.location.replace('/client')
      } else {
        setAuthorized(true)
      }
    }
  }, [projectCode])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!authorized) return
    let cancelled = false
    async function loadProject() {
      const { data } = await fetchProjectByAccessCode(projectCode)
      if (cancelled) return
      if (data) {
        setProject({
          name: data.name || '',
          status: data.status || '',
          progress: data.progress || 0,
          health: data.health || 'on-track',
        })
      }
    }
    loadProject()
    return () => {
      cancelled = true
    }
  }, [projectCode, authorized])

  if (!authorized || !project) {
    return <FullPageSplash />
  }

  return (
    <div className="client-shell client-shell-bg min-h-screen flex relative">
      {/* Desktop Sidebar */}
      <aside
        className="relative z-20 h-screen w-[260px] flex-shrink-0 hidden lg:flex flex-col sticky top-0"
        style={{ background: 'var(--cp-bg-elevated)', borderRight: '1px solid var(--cp-border-soft)' }}
      >
        <SidebarContent project={project} groups={groups} pathname={pathname} onExit={handleExit} />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 left-0 h-screen w-[280px] z-50 lg:hidden flex flex-col"
              style={{ background: 'var(--cp-bg-elevated)', borderRight: '1px solid var(--cp-border-soft)' }}
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  className="p-1.5 rounded-lg transition-colors active:scale-90 text-[var(--cp-text-muted)] hover:text-[var(--cp-text)] hover:bg-[var(--cp-surface-strong)]"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent project={project} groups={groups} pathname={pathname} onNavigate={() => setSidebarOpen(false)} onExit={handleExit} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        {/* Top bar */}
        <header
          className="h-[60px] shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 transition-all duration-300"
          style={{
            background: scrolled ? 'color-mix(in srgb, var(--cp-bg-elevated) 80%, transparent)' : 'transparent',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
            borderBottom: scrolled ? '1px solid var(--cp-border-soft)' : '1px solid transparent',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden p-1 -ml-1 rounded-lg transition-colors active:scale-90 text-[var(--cp-text-muted)] hover:text-[var(--cp-text)]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden shrink-0">
              <LyptronMark size={28} />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 px-6 sm:px-10 lg:px-14 py-6 sm:py-8 lg:py-10 relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
}

function FullPageSplash() {
  return (
    <div className="client-shell min-h-screen flex flex-col items-center justify-center bg-[var(--cp-bg)] gap-5 text-center select-none" data-theme="dark">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-[68px] h-[68px] rounded-full border border-dashed border-[var(--cp-cyan)] animate-spin [animation-duration:3s]" />
        <div className="absolute w-14 h-14 rounded-full border border-[var(--cp-cyan-border)] animate-ping opacity-40 [animation-duration:1.5s]" />
        <LyptronMark size={50} className="relative z-10 shadow-md" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-display font-bold text-[18px] tracking-tight text-[var(--cp-text)]">Lyptron</span>
        <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-[var(--cp-text-faint)]">Loading workspace...</span>
      </div>
    </div>
  )
}
