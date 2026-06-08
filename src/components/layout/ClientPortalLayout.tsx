'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Map,
  GitBranch,
  Package,
  Image as ImageIcon,
  CheckSquare,
  FileText,
  Video,
  CreditCard,
  Users,
  MessageSquare,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { fetchProjectByAccessCode } from '@/lib/db'

const NAV_GROUPS = (code: string) => [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: `/client/${code}/dashboard`, icon: LayoutDashboard },
    ],
  },
  {
    label: 'Project',
    items: [
      { name: 'Timeline', path: `/client/${code}/timeline`, icon: Map },
      { name: 'Development', path: `/client/${code}/development`, icon: GitBranch },
      { name: 'Deliverables', path: `/client/${code}/deliverables`, icon: Package },
      { name: 'Gallery', path: `/client/${code}/gallery`, icon: ImageIcon },
    ],
  },
  {
    label: 'Review',
    items: [
      { name: 'Approvals', path: `/client/${code}/approvals`, icon: CheckSquare },
      { name: 'Feedback', path: `/client/${code}/feedback`, icon: MessageSquare },
    ],
  },
  {
    label: 'Resources',
    items: [
      { name: 'Documents', path: `/client/${code}/documents`, icon: FileText },
      { name: 'Meetings', path: `/client/${code}/meetings`, icon: Video },
      { name: 'Finance', path: `/client/${code}/finance`, icon: CreditCard },
      { name: 'Team', path: `/client/${code}/team`, icon: Users },
    ],
  },
]

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
  const [projectName, setProjectName] = useState('')
  const [projectStatus, setProjectStatus] = useState('')
  const [projectProgress, setProjectProgress] = useState(0)

  const groups = NAV_GROUPS(projectCode)
  const allItems = groups.flatMap((g) => g.items)
  const currentPage = allItems.find((m) => pathname === m.path)?.name || 'Dashboard'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function loadProject() {
      const { data } = await fetchProjectByAccessCode(projectCode)
      if (data) {
        setProjectName(data.name || '')
        setProjectStatus(data.status || '')
        setProjectProgress(data.progress || 0)
      }
    }
    loadProject()
  }, [projectCode])

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {/* Project Header */}
      <div className="p-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-xl p-[1px] shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))' }}
          >
            <div className="w-full h-full bg-[#08080a] rounded-[10px] flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">L</span>
            </div>
          </div>
          <div className="min-w-0">
            <span className="font-display font-bold text-[14px] text-white/90 tracking-tight block truncate">
              {projectName || 'Project Portal'}
            </span>
            {projectStatus && (
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/25">
                {projectStatus}
              </span>
            )}
          </div>
        </div>
        {/* Mini progress */}
        {projectProgress > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${projectProgress}%`,
                  background: 'linear-gradient(90deg, rgba(59,130,246,0.6), rgba(255,255,255,0.6))',
                }}
              />
            </div>
            <span className="text-[10px] font-mono text-white/30 tabular-nums">{projectProgress}%</span>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-1">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="px-3 pt-4 pb-1.5 text-[9px] font-mono uppercase tracking-[0.2em] text-white/15">
              {group.label}
            </div>
            {group.items.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link href={item.path} key={item.name} onClick={onNavigate}>
                  <div
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all group mb-0.5 ${
                      isActive ? 'text-white' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="client-sidebar-active"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                      />
                    )}
                    <item.icon
                      className={`w-[16px] h-[16px] relative z-10 transition-colors ${
                        isActive ? 'text-white/80' : 'group-hover:text-white/50'
                      }`}
                    />
                    <span className="font-medium relative z-10">{item.name}</span>
                    {isActive && (
                      <ChevronRight className="w-3 h-3 ml-auto text-white/20 relative z-10" />
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.04]">
        <Link href="/client">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/25 hover:text-white/50 hover:bg-white/[0.02] transition-all text-[12px]">
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Exit Portal</span>
          </div>
        </Link>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/20 flex relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-[10%]"
          style={{
            width: '140%',
            height: '70%',
            background:
              'conic-gradient(from 180deg at 50% 0%, transparent 37%, rgba(255,248,230,0.025) 45%, rgba(255,250,240,0.04) 50%, rgba(255,248,230,0.025) 55%, transparent 63%)',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 90%)',
          }}
        />
        <div className="absolute top-[40%] right-0 w-[500px] h-[500px] bg-blue-500/[0.015] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-[5%] w-[400px] h-[400px] bg-purple-500/[0.01] rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")',
          }}
        />
      </div>

      {/* Desktop Sidebar */}
      <aside
        className="relative z-20 h-screen w-[240px] flex-shrink-0 hidden lg:flex flex-col sticky top-0"
        style={{
          background: 'rgba(5,5,5,0.6)',
          borderRight: '1px solid rgba(255,255,255,0.04)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
        }}
      >
        <div
          className="absolute top-0 left-[20%] right-[20%] h-px z-10"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          }}
        />
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-screen w-[240px] z-50 lg:hidden flex flex-col"
              style={{
                background: 'rgba(8,8,10,0.98)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(40px)',
              }}
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  className="text-white/40 hover:text-white p-1"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent onNavigate={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar */}
        <header
          className="h-[56px] shrink-0 flex items-center justify-between px-5 lg:px-8 sticky top-0 z-30 transition-all duration-500"
          style={{
            background: scrolled ? 'rgba(5,5,5,0.8)' : 'transparent',
            backdropFilter: scrolled ? 'blur(24px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(255,255,255,0.04)' : '1px solid transparent',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-white/40 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 text-[13px] text-white/25 font-medium">
              <span className="text-white/30 hidden sm:inline">{projectName || 'Portal'}</span>
              <ChevronRight className="w-3 h-3 text-white/15 hidden sm:block" />
              <span className="text-white/70">{currentPage}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono text-white/20" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Powered by Lyptron</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-8 relative z-10">
          <div className="max-w-[1200px] mx-auto">{children}</div>
        </div>
      </main>
    </div>
  )
}
