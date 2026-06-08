'use client'
import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

function ClientLoginGate() {
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = accessCode.trim().toUpperCase()
    if (!code) return
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase.from('projects').select('id').eq('access_code', code).single()
    if (err || !data) {
      setError('Invalid access token. Please check and try again.')
      setLoading(false)
      return
    }
    router.push(`/client/${code}/dashboard`)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Spotlight cone */}
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
        {/* Spotlight pool */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[15%]"
          style={{
            width: '50%',
            maxWidth: '700px',
            height: '400px',
            background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(255,250,235,0.05) 0%, rgba(255,248,225,0.02) 40%, transparent 70%)',
          }}
        />
        {/* Ambient orbs */}
        <div className="absolute top-[40%] right-[15%] w-[400px] h-[400px] bg-blue-500/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-purple-500/[0.02] rounded-full blur-[100px]" />
        {/* Noise grain */}
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
        className="flex items-center gap-3 mb-12 relative z-10"
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
          {/* Top accent line */}
          <div className="absolute top-0 left-[15%] right-[15%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(29,126,245,0.3), rgba(129,140,248,0.15), transparent)' }} />
          {/* Inner gradient sheen */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 40%, rgba(29,126,245,0.015) 100%)', borderRadius: 'inherit' }} />
          {/* Subtle corner glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

          <h2 className="font-display text-[28px] font-bold tracking-tight mb-2 relative z-10">
            <span className="text-white/90">Client </span>
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)' }}>Portal</span>
          </h2>
          <p className="text-[13px] text-white/30 mb-8 relative z-10 leading-relaxed">Enter the secure access token provided by your Lyptron project manager.</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5 relative z-10">
            <div>
              <input
                type="text"
                placeholder="Paste Token (e.g. AURA123)"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full px-5 py-4 text-[13px] text-white/90 font-mono tracking-[0.15em] outline-none transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
              />
            </div>
            {error && <p className="text-red-400 text-[12px] text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || !accessCode.trim()}
              className="w-full py-4 font-semibold text-[13px] rounded-full transition-all disabled:opacity-40"
              style={{
                background: 'white',
                color: '#050505',
                boxShadow: '0 0 25px rgba(255,255,255,0.1)',
              }}
            >
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </motion.div>

      {/* Bottom text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="text-[11px] text-white/15 mt-8 font-mono tracking-[0.1em] relative z-10"
      >
        SECURED BY LYPTRON
      </motion.p>
    </div>
  )
}

export default function ClientDashboard() {
  return (
    <Suspense fallback={<div className="text-white/30 p-10 min-h-screen bg-[#050505]">Loading...</div>}>
      <ClientLoginGate />
    </Suspense>
  )
}
