'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children, isAdmin = false }: { children: React.ReactNode, isAdmin?: boolean }) {
  const pathname = usePathname()

  const links = isAdmin ? [
    { name: 'Inquiries', href: '/admin#inquiries' },
    { name: 'Projects', href: '/admin#projects' },
  ] : [
    { name: 'Dashboard', href: '/client' },
  ]

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-body selection:bg-white/20">
      
      {/* Left Sidebar / Window Pane */}
      <aside className="fixed top-0 left-0 h-screen w-[260px] border-r border-white/[0.06] bg-black/40 backdrop-blur-xl flex flex-col justify-between py-10 px-8 z-50">
        
        {/* Lyptron Logo */}
        <div>
          <Link href="/" className="inline-block mb-16">
            <h1 className="font-display font-bold text-2xl tracking-tight text-white/90">
              Lyptron<span className="text-white/40">.</span>
            </h1>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-3">
            <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">
              {isAdmin ? 'Admin' : 'Client Portal'}
            </div>
            {links.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors py-2"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom User Area */}
        <div className="border-t border-white/[0.06] pt-6 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/[0.15] flex items-center justify-center text-xs font-mono">
              {isAdmin ? 'AD' : 'CL'}
            </div>
            <div>
              <p className="text-xs font-bold text-white/80">{isAdmin ? 'Admin User' : 'Client'}</p>
              <p className="text-[10px] text-white/40">Secured Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[260px] w-full min-h-screen p-10 lg:p-16 relative">
        {/* Subtle background glow */}
        <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-white/[0.015] rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
