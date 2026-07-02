'use client'
import React, { useState, useEffect, useMemo } from 'react'
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
  CreditCard,
  Megaphone,
  Rocket,
  Target,
  ListChecks,
  Network,
  FileBarChart,
  ShieldCheck,
  PanelLeft,
} from 'lucide-react'
import { useAdminAuth } from '@/lib/AdminAuthContext'
import { canAccessRoute } from '@/lib/adminRoles'
import { LyptronLogo, LyptronMark } from '@/components/ui/LyptronLogo'
import ThemeToggle from '@/components/admin/ThemeToggle'

import Image from 'next/image'

const NAV_GROUPS = [
  {
    label: 'Founder',
    items: [
      { name: 'Founder Overview', icon: Sparkles, path: '/admin/founder' },
      { name: 'Financial Overview', icon: Wallet, path: '/admin/finance' },
      { name: 'Subscriptions', icon: CreditCard, path: '/admin/subscriptions' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { name: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
      { name: 'Projects', icon: FolderKanban, path: '/admin/projects' },
      { name: 'Tasks', icon: ListChecks, path: '/admin/tasks' },
      { name: 'Clients', icon: Briefcase, path: '/admin/clients' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { name: 'Marketing', icon: Megaphone, path: '/admin/marketing' },
      { name: 'Campaigns', icon: Rocket, path: '/admin/campaigns' },
      { name: 'CRM Pipeline', icon: Users, path: '/admin/crm' },
      { name: 'Leads', icon: Target, path: '/admin/leads' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { name: 'Analytics', icon: LineChart, path: '/admin/analytics' },
      { name: 'Reports', icon: FileBarChart, path: '/admin/reports' },
      { name: 'Team', icon: Network, path: '/admin/team' },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Settings', icon: Settings, path: '/admin/settings' },
      { name: 'Permissions', icon: ShieldCheck, path: '/admin/permissions' },
    ],
  },
]

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items)

function roleSubtitle(role?: string) {
  if (role === 'founder') return 'Founder Overview'
  if (role === 'marketing') return 'Marketing Studio'
  return 'Operations'
}

interface SidebarNavProps {
  filteredNavGroups: any[]
  sidebarOpen: boolean
  pathname: string
  onNavigate?: () => void
}

function SidebarNav({ filteredNavGroups, sidebarOpen, pathname, onNavigate }: SidebarNavProps) {
  return (
    <>
      {filteredNavGroups.map((group) => (
        <div key={group.label} className="flex flex-col">
          {sidebarOpen && (
            <div className="text-[10px] uppercase font-semibold tracking-[0.12em] py-2 px-3 mt-2" style={{ color: 'var(--cp-text-faint)' }}>
              {group.label}
            </div>
          )}
          {group.items.map((item: any) => {
            const isActive =
              pathname === item.path || (item.path === '/admin/dashboard' && pathname === '/admin')
            return (
              <Link key={item.name} href={item.path} onClick={onNavigate}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-0.5 ${
                    isActive
                      ? 'font-medium'
                      : 'hover:bg-(--cp-bg-soft)'
                  }`}
                  style={
                    isActive
                      ? { color: 'var(--cp-cyan)', background: 'var(--cp-cyan-soft)' }
                      : { color: 'var(--cp-text-muted)' }
                  }
                >
                  <item.icon className="shrink-0 w-3.75 h-3.75" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-[13px] whitespace-nowrap overflow-hidden"
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
}

export default function EnterpriseAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const filteredNavGroups = useMemo(
    () =>
      NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => canAccessRoute(user?.role, item.path)),
      })).filter((group) => group.items.length > 0),
    [user?.role]
  )

  const currentPage = useMemo(() => {
    const match = ALL_ITEMS.find(
      (m) => pathname === m.path || (m.path === '/admin/dashboard' && pathname === '/admin')
    )?.name
    if (match) return match
    // Per-project sub-pages live under /admin/projects/[id]/…; render
    // a readable fallback instead of the literal "Overview" so the title
    // bar doesn't lie on those routes.
    if (pathname.startsWith('/admin/projects/')) {
      const last = pathname.split('/').filter(Boolean).pop() || 'project'
      return last.charAt(0).toUpperCase() + last.slice(1)
    }
    return 'Overview'
  }, [pathname])

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

  return (
    <div
      className="client-shell admin-shell min-h-screen flex overflow-hidden selection:bg-(--cp-cyan-soft)"
      style={{ background: 'var(--cp-bg)', color: 'var(--cp-text)' }}
    >
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 248 : 68 }}
        className="relative z-20 h-screen shrink-0 hidden md:flex flex-col"
        style={{
          background: 'var(--cp-bg-elevated)',
          borderRight: '1px solid var(--cp-border-soft)',
        }}
      >
        {/* Brand header — unified mark + role subtitle */}
        <div className="px-5 pt-5 pb-4">
          {sidebarOpen ? (
            <Link href="/" aria-label="Lyptron home" className="flex min-w-0">
              <LyptronLogo subtitle={roleSubtitle(user?.role)} />
            </Link>
          ) : (
            <Link href="/" aria-label="Lyptron home" className="flex justify-center">
              <LyptronMark size={30} />
            </Link>
          )}
        </div>

        <div
          className="mx-3 h-px"
          style={{ background: 'var(--cp-border-soft)' }}
        />

        <nav className="flex-1 px-2.5 pt-2 flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar">
          <SidebarNav filteredNavGroups={filteredNavGroups} sidebarOpen={sidebarOpen} pathname={pathname} />
        </nav>

        {/* User + Collapse */}
        <div
          className="p-3 flex flex-col gap-2"
          style={{ borderTop: '1px solid var(--cp-border-soft)' }}
        >
          {sidebarOpen && user && (
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div
                className="w-7 h-7 rounded-full overflow-hidden shrink-0 flex items-center justify-center relative"
                style={{
                  background: 'var(--cp-cyan-soft)',
                  border: '1px solid var(--cp-cyan-border)',
                }}
              >
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt=""
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                ) : (
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: 'var(--cp-cyan)' }}
                  >
                    {user.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-medium truncate" style={{ color: 'var(--cp-text-secondary)' }}>
                  {user.name || 'Admin'}
                </span>
                <span className="text-[10px] truncate capitalize" style={{ color: 'var(--cp-text-faint)' }}>
                  {user.role || 'admin'}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-(--cp-bg-soft) hover:text-(--cp-text) transition-colors text-[11px]"
            style={{ color: 'var(--cp-text-muted)' }}
          >
            <PanelLeft className="w-3.5 h-3.5" />
            {sidebarOpen && <span>Collapse</span>}
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-screen w-62 z-50 md:hidden flex flex-col"
              style={{
                background: 'var(--cp-bg-elevated)',
                borderRight: '1px solid var(--cp-border-soft)',
              }}
            >
              <div className="px-5 pt-5 pb-4 flex items-center justify-between">
                <Link href="/" aria-label="Lyptron home" onClick={() => setMobileMenuOpen(false)} className="flex min-w-0">
                  <LyptronLogo subtitle={roleSubtitle(user?.role)} />
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="hover:text-(--cp-text) transition-colors" style={{ color: 'var(--cp-text-muted)' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div
                className="mx-3 h-px"
                style={{ background: 'var(--cp-border-soft)' }}
              />
              <nav className="flex-1 px-2.5 pt-2 flex flex-col overflow-y-auto custom-scrollbar">
                <SidebarNav filteredNavGroups={filteredNavGroups} sidebarOpen={sidebarOpen} pathname={pathname} onNavigate={() => setMobileMenuOpen(false)} />
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Top Bar */}
        <header
          className="h-14 shrink-0 flex items-center justify-between px-5 lg:px-8 z-30 transition-all duration-300"
          style={{
            background: scrolled ? 'color-mix(in srgb, var(--cp-bg-elevated) 80%, transparent)' : 'transparent',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            borderBottom: `1px solid ${scrolled ? 'var(--cp-border)' : 'transparent'}`,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              className="md:hidden hover:text-(--cp-text) transition-colors"
              style={{ color: 'var(--cp-text-muted)' }}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-[13px] font-medium">
              <span style={{ color: 'var(--cp-text-faint)' }}>Admin</span>
              <ChevronRight className="w-3 h-3" style={{ color: 'var(--cp-text-faint)' }} />
              <span style={{ color: 'var(--cp-text)' }}>{currentPage}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full text-[12px] hover:text-(--cp-text) transition-colors"
              style={{
                background: 'var(--cp-cyan-soft)',
                border: '1px solid var(--cp-border)',
                color: 'var(--cp-text-muted)',
              }}
            >
              <Search className="w-3 h-3" />
              <span>Search</span>
              <kbd
                className="hidden lg:inline font-mono text-[9px] px-1 py-0.5 rounded"
                style={{
                  color: 'var(--cp-text-faint)',
                  background: 'var(--cp-surface-strong)',
                  border: '1px solid var(--cp-border)',
                }}
              >
                Ctrl K
              </kbd>
            </button>

            <button className="relative hover:text-(--cp-text) transition-colors" style={{ color: 'var(--cp-text-faint)' }}>
              <Bell className="w-4.25 h-4.25" />
              <span
                className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--cp-cyan)' }}
              />
            </button>

            <ThemeToggle />

            <button
              onClick={logout}
              className="hover:text-(--cp-text) transition-colors"
              style={{ color: 'var(--cp-text-faint)' }}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content — unconstrained width per Eased Obsidian guidelines */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-10 py-6 sm:py-8 relative z-10 w-full">
          {children}
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-101 overflow-hidden"
              style={{
                background: 'var(--cp-bg-elevated)',
                border: '1px solid var(--cp-border)',
                borderRadius: '16px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.12)',
              }}
            >
              <div
                className="flex items-center gap-3 p-3.5"
                style={{ borderBottom: '1px solid var(--cp-border-soft)' }}
              >
                <Search className="w-4 h-4" style={{ color: 'var(--cp-text-faint)' }} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search or type a command..."
                  className="flex-1 bg-transparent border-none outline-none text-[13px] placeholder:text-(--cp-text-faint)"
                  style={{ color: 'var(--cp-text)' }}
                />
                <kbd
                  className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                  style={{
                    color: 'var(--cp-text-faint)',
                    background: 'var(--cp-surface-strong)',
                    border: '1px solid var(--cp-border)',
                  }}
                >
                  ESC
                </kbd>
              </div>
              <div className="p-1.5 max-h-80 overflow-y-auto custom-scrollbar">
                <div className="px-3 py-1.5 text-[10px] uppercase font-semibold tracking-[0.12em]" style={{ color: 'var(--cp-text-faint)' }}>
                  Pages
                </div>
                {filteredNavGroups.flatMap((g) => g.items).map((item, i) => (
                  <Link href={item.path} key={i} onClick={() => setCommandPaletteOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-(--cp-bg-soft) hover:text-(--cp-text) transition-colors cursor-pointer" style={{ color: 'var(--cp-text-muted)' }}>
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
