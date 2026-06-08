export const CHAPTER_IDS = [
  { id: 'hero', name: 'Hero' },
  { id: 'about', name: 'Who We Are' },
  { id: 'services', name: 'Services' },
  { id: 'work', name: 'Work' },
  { id: 'team', name: 'Team' },
  { id: 'process', name: 'Process' },
  { id: 'pricing', name: 'Pricing' },
  { id: 'cta', name: 'Get in Touch' },
] as const

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

export const COLORS = {
  bg: '#0a0a0b',
  surface: '#111114',
  surface2: '#18181c',
  blue: '#1d7ef5',
  blueDim: '#1560c0',
  silver: '#c0c0cc',
  green: '#22c55e',
} as const

export const EASING = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const
