'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { signInWithPassword, signInWithGoogle } from '@/lib/supabase'
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

  const handleGoogleLogin = async () => {
    setError('')
    const { error: err } = await signInWithGoogle()
    if (err) setError(err.message)
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

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleLogin}
            className="cp-btn-secondary w-full py-3.5 text-[13px] font-semibold flex items-center justify-center gap-3 mb-6"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: 'var(--cp-border-soft)' }} />
            <span className="text-[11px] font-mono uppercase tracking-widest" style={{ color: 'var(--cp-text-faint)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--cp-border-soft)' }} />
          </div>

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
