'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { LyptronLogo, LyptronMark } from '@/components/ui/LyptronLogo'
import { LogoProvider } from '@/lib/LogoContext'

const EMAIL_HELP = 'hello@lyptron.com'

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

function ClientLoginGate() {
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('client_access_code')
    if (stored) router.replace(`/client/${stored}/dashboard`)
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = accessCode.trim().toUpperCase()
    if (!code) return
    setLoading(true)
    setError('')
    // SECURITY DEFINER RPC — see supabase-schema.sql get_project_by_access_code.
    // Falls back to a direct select if the RPC isn't deployed yet.
    const { data, error: err } = await supabase.rpc('get_project_by_access_code', { p_code: code })
    if (err || !data) {
      setError("We couldn't find a project for that code. Please check it and try again.")
      setLoading(false)
      return
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('client_access_code', code)
    }
    router.push(`/client/${code}/dashboard`)
  }

  return (
    <div className="client-shell min-h-screen flex flex-col relative overflow-hidden" data-theme="dark">
      {/* Soft accent ambient — fixed to viewport */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-[-20%] right-[-10%] w-200 h-200 rounded-full z-0"
        style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.05) 0%, transparent 70%)' }}
      />

      {/* Top frame — logo + secured tag */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          <Link href="/" aria-label="Lyptron home" className="flex min-w-0">
            <LyptronLogo size={36} subtitle="Client Portal" textClassName="text-[18px]" />
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="hidden sm:flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: 'var(--cp-text-faint)' }}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secure access</span>
        </motion.div>
      </header>

      {/* Main editorial layout */}
      <main className="relative z-10 flex-1 flex items-center px-6 sm:px-10 lg:px-16 pb-16">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center">

          {/* Left — editorial pitch */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
            className="flex flex-col gap-8"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--cp-cyan)' }}>
              — Welcome back
            </span>
            <h1
              className="font-display font-bold tracking-[-0.035em] leading-[0.95] text-balance"
              style={{
                color: 'var(--cp-text)',
                fontSize: 'clamp(48px, 7vw, 96px)',
              }}
            >
              Your project,<br />
              <span style={{ color: 'var(--cp-cyan)' }}>in one place.</span>
            </h1>
            <p
              className="text-[15px] sm:text-[16px] leading-relaxed max-w-md"
              style={{ color: 'var(--cp-text-secondary)' }}
            >
              Track milestones, review approvals, watch live versions, and pay invoices — all from a single, calm
              workspace your team updates in real time.
            </p>

            {/* Hairline meta strip */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 pt-8 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
              {[
                { label: 'Built for', value: 'Founders & operators' },
                { label: 'Updated', value: 'In real time' },
                { label: 'Hosted', value: 'India' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--cp-text-faint)' }}>
                    {item.label}
                  </span>
                  <span className="text-[13px] mt-1" style={{ color: 'var(--cp-text-secondary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — access form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE_OUT }}
            className="relative"
          >
            {/* Soft surface with champagne left-rule */}
            <div
              className="relative cp-card cp-card-accent pl-8 sm:pl-10 pr-8 sm:pr-10 py-10 sm:py-12"
              style={{ background: 'var(--cp-surface)' }}
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--cp-cyan)' }}>
                  Sign in
                </span>
                <span className="text-[11px]" style={{ color: 'var(--cp-text-faint)' }}>01 / 01</span>
              </div>

              <h2
                className="font-display text-[28px] sm:text-[34px] font-bold tracking-tight mt-3 mb-2 leading-[1.05]"
                style={{ color: 'var(--cp-text)' }}
              >
                Enter your access code.
              </h2>
              <p className="text-[13.5px] mb-10 leading-relaxed max-w-sm" style={{ color: 'var(--cp-text-secondary)' }}>
                Your project manager sent a six-character code with your kickoff email.
              </p>

              <form onSubmit={handleLogin} className="flex flex-col gap-7">
                <div>
                  <label
                    htmlFor="access-code"
                    className="block text-[10.5px] font-semibold uppercase tracking-[0.18em] mb-3"
                    style={{ color: 'var(--cp-text-muted)' }}
                  >
                    Access code
                  </label>
                  <div className="relative">
                    <input
                      id="access-code"
                      type="text"
                      placeholder="AURA123"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                      maxLength={12}
                      autoComplete="off"
                      spellCheck={false}
                      className="w-full px-0 pb-4 pt-2 text-[28px] sm:text-[32px] font-display font-bold tracking-[0.18em] uppercase outline-none bg-transparent border-0 border-b transition-colors"
                      style={{ borderColor: 'var(--cp-border)', color: 'var(--cp-text)' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cp-cyan)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--cp-border)' }}
                    />
                    <span
                      className="absolute right-0 bottom-4 text-[11px] tabular-nums"
                      style={{ color: 'var(--cp-text-faint)' }}
                    >
                      {accessCode.length} chars
                    </span>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 py-3 px-4 border-l-2"
                    style={{ borderColor: 'var(--cp-red)', background: 'var(--cp-red-soft)' }}
                  >
                    <span className="text-[12.5px] leading-relaxed" style={{ color: 'var(--cp-text-secondary)' }}>
                      {error}
                    </span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !accessCode.trim()}
                  className="cp-btn-primary group w-full py-4 text-[13px] font-semibold tracking-[0.04em] uppercase flex items-center justify-center gap-3 mt-2"
                >
                  <span>{loading ? 'Checking…' : 'View my project'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5" />
                </button>
              </form>
            </div>

            {/* Help line */}
            <p className="text-[12px] text-center mt-6 leading-relaxed" style={{ color: 'var(--cp-text-faint)' }}>
              Lost your code? Email{' '}
              <a href={`mailto:${EMAIL_HELP}`} className="transition-colors hover:text-(--cp-text-secondary)" style={{ color: 'var(--cp-text-muted)' }}>
                {EMAIL_HELP}
              </a>
              {' '}and we&apos;ll resend it.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Bottom rail */}
      <footer className="relative z-10 px-6 sm:px-10 lg:px-16 py-5 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--cp-text-faint)' }}>
            © {new Date().getFullYear()} Lyptron
          </span>
          <div className="flex items-center gap-6 text-[11px]" style={{ color: 'var(--cp-text-faint)' }}>
            <a href="https://lyptron.com" className="transition-colors hover:text-(--cp-text-muted)">lyptron.com</a>
            <a href="https://lyptron.com/privacy" className="transition-colors hover:text-(--cp-text-muted) hidden sm:inline">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FullPageSplash() {
  return (
    <div className="client-shell min-h-screen flex flex-col items-center justify-center bg-(--cp-bg) gap-5 text-center select-none" data-theme="dark">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-17 h-17 rounded-full border border-dashed border-(--cp-cyan) animate-spin [animation-duration:3s]" />
        <div className="absolute w-14 h-14 rounded-full border border-(--cp-cyan-border) animate-ping opacity-40 [animation-duration:1.5s]" />
        <LyptronMark size={50} className="relative z-10 shadow-md" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-display font-bold text-[18px] tracking-tight text-(--cp-text)">Lyptron</span>
        <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-(--cp-text-faint)">Loading workspace...</span>
      </div>
    </div>
  )
}

export default function ClientLoginPage() {
  return (
    <LogoProvider>
      <Suspense fallback={<FullPageSplash />}>
        <ClientLoginGate />
      </Suspense>
    </LogoProvider>
  )
}
