'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Briefcase,
  LineChart,
  Wallet,
  Settings,
  Search,
  Bell,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAdminAuth } from '@/lib/AdminAuthContext'

const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { name: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
      { name: 'Projects', icon: FolderKanban, path: '/admin/projects' },
    ],
  },
  {
    label: 'Business',
    items: [
      { name: 'Clients', icon: Briefcase, path: '/admin/clients' },
      { name: 'CRM Pipeline', icon: Users, path: '/admin/crm' },
      { name: 'Finances', icon: Wallet, path: '/admin/finance' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { name: 'Analytics', icon: LineChart, path: '/admin/analytics' },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Settings', icon: Settings, path: '/admin/settings' },
    ],
  },
]

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items)

export default function EnterpriseAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentPage = ALL_ITEMS.find((m) => pathname === m.path || (m.path === '/admin/dashboard' && pathname === '/admin'))?.name || 'Overview'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      if (e.key === 'Escape') setCommandPaletteOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          {sidebarOpen && (
            <div className="px-3 pt-5 pb-1 text-[9px] font-mono uppercase tracking-[0.2em] text-white/12">
              {group.label}
            </div>
          )}
          {group.items.map((item) => {
            const isActive = pathname === item.path || (item.path === '/admin/dashboard' && pathname === '/admin')
            return (
              <Link key={item.name} href={item.path} onClick={onNavigate}>
                <div
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group mb-0.5 ${
                    isActive ? 'text-white' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-sidebar-active"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}
                      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    />
                  )}
                  <item.icon
                    className={`shrink-0 w-[16px] h-[16px] relative z-10 transition-colors ${
                      isActive ? 'text-white/80' : 'group-hover:text-white/50'
                    }`}
                  />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-[13px] font-medium whitespace-nowrap overflow-hidden relative z-10"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            )
          })}
        </div>
      ))}
    </>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden selection:bg-white/20">
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
        <div className="absolute top-[30%] right-[5%] w-[500px] h-[500px] bg-blue-500/[0.015] rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-purple-500/[0.012] rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")',
          }}
        />
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 64 }}
        className="relative z-20 h-screen flex-shrink-0 hidden md:flex flex-col"
        style={{
          background: 'rgba(5,5,5,0.6)',
          borderRight: '1px solid rgba(255,255,255,0.04)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
        }}
      >
        <div
          className="absolute top-0 left-[20%] right-[20%] h-px z-10"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
        />

        {/* Logo */}
        <div className="p-5 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.6))', color: '#050505' }}
          >
            L
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-display font-bold text-[15px] whitespace-nowrap overflow-hidden tracking-tight text-white/90"
              >
                Lyptron<span className="text-blue-400">.</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-2.5 flex flex-col gap-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <SidebarNav />
        </nav>

        {/* User + Collapse */}
        <div className="p-3 border-t border-white/[0.04] flex flex-col gap-2">
          {sidebarOpen && user && (
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div
                className="w-7 h-7 rounded-full p-[1px] shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(29,126,245,0.5), rgba(139,92,246,0.5))' }}
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#0a0a0c] rounded-full flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white/70">{user.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-medium text-white/60 truncate">{user.name || 'Admin'}</span>
                <span className="text-[9px] text-white/20 truncate">{user.email}</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-white/20 hover:bg-white/[0.03] hover:text-white/50 transition-all"
          >
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-screen w-[240px] z-50 md:hidden flex flex-col"
              style={{
                background: 'rgba(8,8,10,0.98)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(40px)',
              }}
            >
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.6))', color: '#050505' }}
                  >
                    L
                  </div>
                  <span className="font-display font-bold text-[15px] text-white/90 tracking-tight">
                    Lyptron<span className="text-blue-400">.</span>
                  </span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-2.5 flex flex-col gap-0 overflow-y-auto custom-scrollbar">
                <SidebarNav onNavigate={() => setMobileMenuOpen(false)} />
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Top Bar */}
        <header
          className="h-[52px] shrink-0 flex items-center justify-between px-5 lg:px-8 z-30 transition-all duration-500"
          style={{
            background: scrolled ? 'rgba(5,5,5,0.8)' : 'transparent',
            backdropFilter: scrolled ? 'blur(24px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(255,255,255,0.04)' : '1px solid transparent',
          }}
        >
          <div className="flex items-center gap-3">
            <button className="md:hidden text-white/40 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-1.5 text-[13px] text-white/25 font-medium">
              <span className="text-white/30">Admin</span>
              <ChevronRight className="w-3 h-3 text-white/15" />
              <span className="text-white/70">{currentPage}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full text-[12px] text-white/25 hover:text-white/40 transition-all"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <Search className="w-3 h-3" />
              <span>Search</span>
              <kbd className="hidden lg:inline font-mono text-[8px] text-white/15 bg-white/[0.04] px-1 py-0.5 rounded border border-white/[0.06]">
                Ctrl K
              </kbd>
            </button>

            <button className="relative text-white/25 hover:text-white/60 transition-colors">
              <Bell className="w-[17px] h-[17px]" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-400 rounded-full" />
            </button>

            <button onClick={logout} className="text-white/20 hover:text-white/50 transition-colors" title="Sign out">
              <LogOut className="w-[16px] h-[16px]" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-8 relative z-10">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </div>
      </main>

      {/* Command Palette */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommandPaletteOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101] overflow-hidden"
              style={{
                background: 'rgba(10,10,12,0.95)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              }}
            >
              <div className="flex items-center gap-3 p-3.5 border-b border-white/[0.04]">
                <Search className="w-4 h-4 text-white/25" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search or type a command..."
                  className="flex-1 bg-transparent border-none outline-none text-white/80 text-[13px] placeholder:text-white/15"
                />
                <kbd className="font-mono text-[8px] text-white/20 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">ESC</kbd>
              </div>
              <div className="p-1.5 max-h-[320px] overflow-y-auto custom-scrollbar">
                <div className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.15em] text-white/15">Pages</div>
                {ALL_ITEMS.map((item, i) => (
                  <Link href={item.path} key={i} onClick={() => setCommandPaletteOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] text-white/40 hover:text-white/80 transition-colors cursor-pointer">
                      <item.icon className="w-4 h-4" />
                      <span className="text-[13px] font-medium">{item.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
