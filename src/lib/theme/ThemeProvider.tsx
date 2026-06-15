'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  AutoStrategy,
  GEO_MAX_AGE_MS,
  GeoLocation,
  ResolvedTheme,
  SunTimes,
  ThemeMode,
  getSunTimes,
  isGeoStale,
  resolveTheme,
} from './resolveTheme'

const MODE_KEY = 'lyptron.theme.mode'
const STRATEGY_KEY = 'lyptron.theme.auto.strategy'
const GEO_KEY = 'lyptron.theme.geo'
const SUN_TIMES_KEY = 'lyptron.theme.sunTimes'

/** Re-run the resolver every 15 minutes while the tab is visible. */
const RECHECK_INTERVAL_MS = 15 * 60 * 1000

export const GEOLOCATION_RATIONALE =
  'Lyptron uses your approximate location to switch the dashboard to dark mode at sunset. We don’t store the coordinates on our servers.'

export interface ThemeContextValue {
  mode: ThemeMode
  strategy: AutoStrategy
  resolved: ResolvedTheme
  geo: GeoLocation | null
  sunTimes: SunTimes | null
  /** Human-readable explanation for the current resolved theme, e.g. "auto · dark until sunrise 5:42 AM". */
  reason: string
  setMode: (mode: ThemeMode) => void
  setStrategy: (strategy: AutoStrategy) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readMode(defaultMode: ThemeMode = 'auto'): ThemeMode {
  if (typeof window === 'undefined') return defaultMode
  const v = window.localStorage.getItem(MODE_KEY)
  return v === 'light' || v === 'dark' || v === 'auto' ? v : defaultMode
}

function readStrategy(): AutoStrategy {
  if (typeof window === 'undefined') return 'sunset'
  const v = window.localStorage.getItem(STRATEGY_KEY)
  const strategy = v === 'sunset' || v === 'fixed' || v === 'system' ? v : 'sunset'
  // Geolocation unsupported (or disabled by the embedding environment) —
  // fall back to fixed-hours rather than getting stuck on a strategy
  // that can never resolve its location.
  if (strategy === 'sunset' && !('geolocation' in navigator)) return 'fixed'
  return strategy
}

function readSystemPrefersDark(): boolean | undefined {
  if (typeof window === 'undefined') return undefined
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function readGeo(): GeoLocation | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(GEO_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number' && typeof parsed?.cachedAt === 'number') {
      return parsed as GeoLocation
    }
  } catch {
    // ignore malformed cache
  }
  return null
}

/**
 * Apply `data-theme` to <html> (always present, even before the admin
 * shell hydrates — see the inline pre-paint script in admin/layout.tsx)
 * and directly to every `.admin-shell` element per the redesign plan.
 * The globals.css dark block matches either selector, so the page never
 * flashes the light palette on a dark-mode reload.
 */
function applyDataTheme(resolved: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', resolved)
  document.querySelectorAll<HTMLElement>('.admin-shell, .client-shell').forEach((el) => {
    el.setAttribute('data-theme', resolved)
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function describeReason(mode: ThemeMode, strategy: AutoStrategy, resolved: ResolvedTheme, sunTimes: SunTimes | null, now: Date): string {
  if (mode === 'light') return 'Forced light'
  if (mode === 'dark') return 'Forced dark'

  if (strategy === 'sunset' && sunTimes && !Number.isNaN(sunTimes.sunrise.getTime()) && !Number.isNaN(sunTimes.sunset.getTime())) {
    if (resolved === 'dark') {
      const next = now < sunTimes.sunrise ? sunTimes.sunrise : sunTimes.sunrise
      return `Auto · dark until sunrise ${formatTime(next)}`
    }
    return `Auto · light until sunset ${formatTime(sunTimes.sunset)}`
  }

  if (strategy === 'system') {
    return resolved === 'dark' ? 'Auto · matching system dark mode' : 'Auto · matching system light mode'
  }

  // fixed-hours fallback
  return resolved === 'dark' ? 'Auto · dark until 7:00 AM' : 'Auto · light until 7:00 PM'
}

export function ThemeProvider({ children, defaultMode = 'auto' }: { children: React.ReactNode; defaultMode?: ThemeMode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readMode(defaultMode))
  const [strategy, setStrategyState] = useState<AutoStrategy>(() => readStrategy())
  const [geo, setGeo] = useState<GeoLocation | null>(() => readGeo())
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean | undefined>(() => readSystemPrefersDark())
  const [now, setNow] = useState<Date>(() => new Date())

  // Track system color-scheme preference for the "system" auto strategy.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Request (or refresh) geolocation when the sunset strategy needs it.
  // Denied permission falls back to fixed hours and persists that choice
  // so we don't re-prompt every load. (Unsupported geolocation is handled
  // up front by readStrategy's lazy initializer.)
  useEffect(() => {
    if (mode !== 'auto' || strategy !== 'sunset') return
    if (!isGeoStale(geo)) return
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: GeoLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          cachedAt: Date.now(),
        }
        setGeo(next)
        window.localStorage.setItem(GEO_KEY, JSON.stringify(next))
      },
      () => {
        setStrategyState('fixed')
        window.localStorage.setItem(STRATEGY_KEY, 'fixed')
      },
      { maximumAge: GEO_MAX_AGE_MS, timeout: 10000 }
    )
  }, [mode, strategy, geo])

  // Re-check every 15 minutes while the tab is visible — handles "page
  // left open across sunset" without requiring a reload.
  useEffect(() => {
    const tick = () => setNow(new Date())
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') tick()
    }, RECHECK_INTERVAL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const resolved = useMemo(
    () => resolveTheme(mode, strategy, geo, now, systemPrefersDark),
    [mode, strategy, geo, now, systemPrefersDark]
  )

  const sunTimes = useMemo(() => (geo ? getSunTimes(geo, now) : null), [geo, now])

  // Cache today's sun times so the pre-paint script can use them on the
  // next cold load without waiting for geolocation + suncalc to run again.
  useEffect(() => {
    if (!sunTimes) return
    if (Number.isNaN(sunTimes.sunrise.getTime()) || Number.isNaN(sunTimes.sunset.getTime())) return
    window.localStorage.setItem(
      SUN_TIMES_KEY,
      JSON.stringify({ sunrise: sunTimes.sunrise.toISOString(), sunset: sunTimes.sunset.toISOString() })
    )
  }, [sunTimes])

  useEffect(() => {
    applyDataTheme(resolved)
  }, [resolved])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    window.localStorage.setItem(MODE_KEY, next)
  }, [])

  const setStrategy = useCallback((next: AutoStrategy) => {
    setStrategyState(next)
    window.localStorage.setItem(STRATEGY_KEY, next)
    if (next === 'sunset') setGeo(readGeo())
  }, [])

  const reason = useMemo(() => describeReason(mode, strategy, resolved, sunTimes, now), [mode, strategy, resolved, sunTimes, now])

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, strategy, resolved, geo, sunTimes, reason, setMode, setStrategy }),
    [mode, strategy, resolved, geo, sunTimes, reason, setMode, setStrategy]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeContext must be used within a ThemeProvider')
  return ctx
}
