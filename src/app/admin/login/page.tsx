'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { signInWithPassword } from '@/lib/supabase'
import { LyptronMark } from '@/components/ui/LyptronLogo'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    setError('')

    const { error: err } = await signInWithPassword(email, password)
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    router.push('/admin')
  }

  return (
    <div className="admin-shell min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'var(--cp-bg)', color: 'var(--cp-text)' }}>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 relative z-10"
      >
        <Link href="/" aria-label="Lyptron home" className="flex items-center gap-3">
          <LyptronMark size={36} />
          <span className="font-display font-bold text-xl tracking-tight" style={{ color: 'var(--cp-text)' }}>
            Lyptron<span style={{ color: 'var(--cp-cyan)' }}>.</span>
          </span>
        </Link>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-md w-full mx-6 z-10"
      >
        <div className="cp-card p-10">
          <h2 className="font-display text-[28px] font-bold tracking-tight mb-2">
            <span style={{ color: 'var(--cp-text)' }}>Admin </span>
            <span style={{ color: 'var(--cp-cyan)' }}>Panel</span>
          </h2>
          <p className="text-[13px] mb-8 leading-relaxed" style={{ color: 'var(--cp-text-muted)' }}>
            Sign in to manage your agency dashboard.
          </p>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
            <div className="relative">
              <label htmlFor="admin-email" className="sr-only">Email</label>
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--cp-text-faint)' }} aria-hidden="true" />
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@lyptron.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 text-[13px] outline-none transition-colors rounded-xl"
                style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)', color: 'var(--cp-text)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cp-cyan)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--cp-border-soft)' }}
              />
            </div>

            <div className="relative">
              <label htmlFor="admin-password" className="sr-only">Password</label>
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--cp-text-faint)' }} aria-hidden="true" />
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 text-[13px] outline-none transition-colors rounded-xl"
                style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)', color: 'var(--cp-text)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cp-cyan)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--cp-border-soft)' }}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--cp-text-faint)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--cp-text-muted)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--cp-text-faint)' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && <p role="alert" className="text-[12px] text-center" style={{ color: 'var(--cp-red)' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="cp-btn-primary w-full py-4 text-[13px] mt-2"
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-[11px] mt-6 leading-relaxed" style={{ color: 'var(--cp-text-faint)' }}>
            Accounts are invite-only. Contact a Lyptron founder if you need access.
          </p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="text-[11px] mt-8 font-mono tracking-widest relative z-10"
        style={{ color: 'var(--cp-text-faint)' }}
      >
        LYPTRON ADMIN
      </motion.p>
    </div>
  )
}
