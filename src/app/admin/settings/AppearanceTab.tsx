'use client'
import { motion } from 'framer-motion'
import { Sun, Moon, SunMoon, Sunrise, Sunset, MapPin, Clock, Monitor } from 'lucide-react'
import { useThemeMode, GEOLOCATION_RATIONALE } from '@/hooks/useThemeMode'
import type { AutoStrategy, ThemeMode } from '@/hooks/useThemeMode'

const MODE_OPTIONS: { id: ThemeMode; label: string; desc: string; icon: typeof Sun }[] = [
  { id: 'auto', label: 'Auto', desc: 'Switches with the sun (or your system)', icon: SunMoon },
  { id: 'light', label: 'Light', desc: 'Always use the light palette', icon: Sun },
  { id: 'dark', label: 'Dark', desc: 'Always use the dark palette', icon: Moon },
]

const STRATEGY_OPTIONS: { id: AutoStrategy; label: string; desc: string; icon: typeof Sun }[] = [
  { id: 'sunset', label: 'Sunset & Sunrise', desc: 'Dark from sunset to sunrise, based on your location', icon: Sunset },
  { id: 'fixed', label: 'Fixed Hours', desc: 'Dark from 7 PM to 7 AM', icon: Clock },
  { id: 'system', label: 'Match System', desc: 'Follows your device’s light/dark setting', icon: Monitor },
]

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export default function AppearanceTab() {
  const { mode, strategy, resolved, sunTimes, reason, setMode, setStrategy } = useThemeMode()

  return (
    <motion.div
      id="appearance"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden"
    >
      <div className="mb-6 border-b border-(--cp-border-soft) pb-6">
        <h2 className="font-display text-xl font-bold text-(--cp-text)">Appearance</h2>
        <p className="text-[13px] text-(--cp-text-faint) mt-1">Choose how the admin panel looks, or let it follow the sun.</p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-(--cp-text-muted)">Theme Mode</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODE_OPTIONS.map((opt) => {
            const isActive = mode === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setMode(opt.id)}
                className={`flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all ${
                  isActive
                    ? 'bg-(--cp-surface-strong) border-(--cp-border) text-(--cp-text)'
                    : 'bg-(--cp-surface) border-(--cp-border-soft) text-(--cp-text-muted) hover:text-(--cp-text-secondary) hover:border-(--cp-border)'
                }`}
              >
                <opt.icon className={`w-5 h-5 ${isActive ? 'text-(--cp-cyan)' : ''}`} />
                <div>
                  <p className="text-[13px] font-bold">{opt.label}</p>
                  <p className="text-[11px] mt-0.5 opacity-70">{opt.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {mode === 'auto' && (
        <div className="flex flex-col gap-3 mb-8">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-(--cp-text-muted)">Auto Strategy</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STRATEGY_OPTIONS.map((opt) => {
              const isActive = strategy === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => setStrategy(opt.id)}
                  className={`flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all ${
                    isActive
                      ? 'bg-(--cp-surface-strong) border-(--cp-border) text-(--cp-text)'
                      : 'bg-(--cp-surface) border-(--cp-border-soft) text-(--cp-text-muted) hover:text-(--cp-text-secondary) hover:border-(--cp-border)'
                  }`}
                >
                  <opt.icon className={`w-5 h-5 ${isActive ? 'text-(--cp-cyan)' : ''}`} />
                  <div>
                    <p className="text-[13px] font-bold">{opt.label}</p>
                    <p className="text-[11px] mt-0.5 opacity-70">{opt.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {strategy === 'sunset' && (
            <div className="flex items-start gap-3 p-4 rounded-xl mt-1" style={{ background: 'var(--cp-cyan-soft)', border: '1px solid var(--cp-cyan-border)' }}>
              <MapPin className="w-4 h-4 text-(--cp-cyan) shrink-0 mt-0.5" />
              <p className="text-[12px] text-(--cp-text-secondary) leading-relaxed">{GEOLOCATION_RATIONALE}</p>
            </div>
          )}
        </div>
      )}

      <div className="p-5 rounded-2xl border border-(--cp-border-soft) flex items-center justify-between gap-4 flex-wrap" style={{ background: 'var(--cp-surface-strong)' }}>
        <div className="flex items-center gap-3">
          {resolved === 'dark' ? <Moon className="w-5 h-5 text-(--cp-cyan)" /> : <Sun className="w-5 h-5 text-(--cp-cyan)" />}
          <div>
            <p className="text-[13px] font-bold text-(--cp-text)">Currently {resolved === 'dark' ? 'Dark' : 'Light'}</p>
            <p className="text-[11px] text-(--cp-text-faint) mt-0.5">{reason}</p>
          </div>
        </div>
        {mode === 'auto' && strategy === 'sunset' && sunTimes && !Number.isNaN(sunTimes.sunrise.getTime()) && !Number.isNaN(sunTimes.sunset.getTime()) && (
          <div className="flex items-center gap-4 text-[11px] text-(--cp-text-muted)">
            <span className="flex items-center gap-1.5"><Sunrise className="w-3.5 h-3.5" /> {formatTime(sunTimes.sunrise)}</span>
            <span className="flex items-center gap-1.5"><Sunset className="w-3.5 h-3.5" /> {formatTime(sunTimes.sunset)}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
