'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { signInWithPassword, signInWithGoogle, signUpWithPassword } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [success, setSuccess] = useState('')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'signup') {
      const { error: err } = await signUpWithPassword(email, password)
      if (err) {
        setError(err.message)
      } else {
        setSuccess('Account created! Check your email for confirmation, then log in.')
        setMode('login')
      }
      setLoading(false)
      return
    }

    const { error: err } = await signInWithPassword(email, password)
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    router.push('/admin/dashboard')
  }

  const handleGoogleLogin = async () => {
    setError('')
    const { error: err } = await signInWithGoogle()
    if (err) setError(err.message)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-[10%]"
          style={{
            width: '140%',
            height: '85%',
            background: 'conic-gradient(from 180deg at 50% 0%, transparent 35%, rgba(255,248,230,0.04) 45%, rgba(255,250,240,0.07) 50%, rgba(255,248,230,0.04) 55%, transparent 65%)',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 95%)',
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[15%]"
          style={{
            width: '50%',
            maxWidth: '700px',
            height: '400px',
            background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(255,250,235,0.05) 0%, rgba(255,248,225,0.02) 40%, transparent 70%)',
          }}
        />
        <div className="absolute top-[40%] right-[15%] w-[400px] h-[400px] bg-blue-500/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-purple-500/[0.02] rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
      </div>

      {/* Top accent line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px z-30"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3 mb-10 relative z-10"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-lg" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))', color: '#050505' }}>
          L
        </div>
        <span className="font-display font-bold text-xl text-white/80 tracking-tight">Lyptron<span className="text-blue-400">.</span></span>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-md w-full mx-6 z-10"
      >
        <div
          className="relative overflow-hidden p-10"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
          }}
        >
          <div className="absolute top-0 left-[15%] right-[15%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(29,126,245,0.3), rgba(129,140,248,0.15), transparent)' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 40%, rgba(29,126,245,0.015) 100%)', borderRadius: 'inherit' }} />
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

          <h2 className="font-display text-[28px] font-bold tracking-tight mb-2 relative z-10">
            <span className="text-white/90">Admin </span>
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)' }}>Panel</span>
          </h2>
          <p className="text-[13px] text-white/30 mb-8 relative z-10 leading-relaxed">
            {mode === 'login' ? 'Sign in to manage your agency dashboard.' : 'Create your admin account.'}
          </p>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-3 transition-all hover:bg-white/[0.06] relative z-10 mb-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-white/70">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-white/20 font-mono uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 relative z-10">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type="email"
                placeholder="admin@lyptron.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 text-[13px] text-white/90 outline-none transition-all rounded-xl"
                style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 text-[13px] text-white/90 outline-none transition-all rounded-xl"
                style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && <p className="text-red-400 text-[12px] text-center">{error}</p>}
            {success && <p className="text-emerald-400 text-[12px] text-center">{success}</p>}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-4 font-semibold text-[13px] rounded-full transition-all disabled:opacity-40 mt-2"
              style={{
                background: 'white',
                color: '#050505',
                boxShadow: '0 0 25px rgba(255,255,255,0.1)',
              }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle login/signup */}
          <p className="text-center text-[12px] text-white/25 mt-6 relative z-10">
            {mode === 'login' ? (
              <>No account? <button onClick={() => { setMode('signup'); setError('') }} className="text-blue-400 hover:underline">Create one</button></>
            ) : (
              <>Already have an account? <button onClick={() => { setMode('login'); setError('') }} className="text-blue-400 hover:underline">Sign in</button></>
            )}
          </p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="text-[11px] text-white/15 mt-8 font-mono tracking-[0.1em] relative z-10"
      >
        LYPTRON ADMIN
      </motion.p>
    </div>
  )
}
