import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#050505',
        surface: '#111113',
        blue:    '#1d7ef5',
        silver:  '#c0c0cc',
        green:   '#22c55e',
        ivory:   '#F5F2EB', // Warm Ivory
        gold:    '#D6B370', // Champagne Gold
        slate:   '#8A8A8A', // Slate Gray
      },
      fontFamily: {
        display: ['var(--font-satoshi)'],
        body:    ['var(--font-inter)'],
        mono:    ['var(--font-ibm-plex-mono)'],
      },
      fontSize: {
        hero: ['clamp(64px,8.5vw,96px)',  { lineHeight: '0.94', letterSpacing: '-0.045em' }],
        h2:   ['clamp(40px,5vw,64px)',    { lineHeight: '1.05', letterSpacing: '-0.035em' }],
        h3:   ['clamp(22px,2.5vw,32px)', { lineHeight: '1.1',  letterSpacing: '-0.02em'  }],
      },
      animation: {
        'live-pulse':      'livePulse 2s ease-out infinite',
        'gradient-shift':  'gradientShift 6s ease infinite',
        'border-sweep':    'borderSweep 1.5s linear infinite',
        'float-slow':      'floatSlow 8s ease-in-out infinite',
        'float-medium':    'floatMedium 6s ease-in-out infinite',
        'float-fast':      'floatFast 5s ease-in-out infinite',
        'shimmer':         'shimmer 2.5s ease-in-out infinite',
        'orb-pulse':       'orbPulse 8s ease-in-out infinite',
        'dash-flow':       'dashFlow 1.5s linear infinite',
      },
      backdropBlur: {
        glass: '32px',
        nav:   '28px',
        pill:  '20px',
      },
      boxShadow: {
        glass:    'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.2), 0 32px 64px rgba(0,0,0,0.4)',
        'glass-hover': 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.25), 0 48px 80px rgba(0,0,0,0.5)',
        'blue-glow':   '0 0 32px rgba(29,126,245,0.25)',
        'progress':    '0 0 8px rgba(29,126,245,0.6)',
      },
    },
  },
  plugins: [],
}

export default config
