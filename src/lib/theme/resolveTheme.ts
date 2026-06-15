import SunCalc from 'suncalc'

export type ThemeMode = 'light' | 'dark' | 'auto'
export type AutoStrategy = 'sunset' | 'fixed' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface GeoLocation {
  lat: number
  lng: number
  cachedAt: number
}

export interface SunTimes {
  sunrise: Date
  sunset: Date
}

/** Cached geolocation is considered fresh for 7 days. */
export const GEO_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function isGeoStale(geo: GeoLocation | null, now: Date = new Date()): boolean {
  if (!geo) return true
  return now.getTime() - geo.cachedAt > GEO_MAX_AGE_MS
}

export function getSunTimes(geo: GeoLocation, now: Date): SunTimes {
  const times = SunCalc.getTimes(now, geo.lat, geo.lng)
  return { sunrise: times.sunrise, sunset: times.sunset }
}

/** Fixed-hours fallback: dark before 7am or from 7pm onward. */
function resolveFixed(now: Date): ResolvedTheme {
  const hour = now.getHours()
  return hour < 7 || hour >= 19 ? 'dark' : 'light'
}

function resolveSystem(prefersDark: boolean | undefined, now: Date): ResolvedTheme {
  if (prefersDark === undefined) return resolveFixed(now)
  return prefersDark ? 'dark' : 'light'
}

function resolveSunset(geo: GeoLocation | null, now: Date): ResolvedTheme {
  if (!geo) return resolveFixed(now)
  const { sunrise, sunset } = getSunTimes(geo, now)
  // High-latitude polar day/night: suncalc returns Invalid Date for
  // sunrise/sunset when the sun never rises or sets that day.
  if (Number.isNaN(sunrise.getTime()) || Number.isNaN(sunset.getTime())) {
    return resolveFixed(now)
  }
  return now < sunrise || now >= sunset ? 'dark' : 'light'
}

/** Resolves the "auto" mode for a given strategy. Forced light/dark is handled by resolveTheme. */
export function resolveAutoTheme(
  strategy: AutoStrategy,
  geo: GeoLocation | null,
  now: Date,
  prefersDark?: boolean
): ResolvedTheme {
  switch (strategy) {
    case 'sunset':
      return resolveSunset(geo, now)
    case 'system':
      return resolveSystem(prefersDark, now)
    case 'fixed':
    default:
      return resolveFixed(now)
  }
}

/**
 * Pure resolver for the full theme decision tree (§3.1 of the redesign plan).
 * `mode: 'light' | 'dark'` short-circuits to that value; `mode: 'auto'`
 * delegates to `resolveAutoTheme`.
 */
export function resolveTheme(
  mode: ThemeMode,
  strategy: AutoStrategy,
  geo: GeoLocation | null,
  now: Date,
  prefersDark?: boolean
): ResolvedTheme {
  if (mode === 'light' || mode === 'dark') return mode
  return resolveAutoTheme(strategy, geo, now, prefersDark)
}
