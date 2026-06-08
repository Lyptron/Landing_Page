'use client'
import { motion } from 'framer-motion'

interface ConnectionLinesProps {
  activeIsland: string | null
}

const LINES = [
  { id: 'nexusflow', x: 6, y: 16 },
  { id: 'metrics', x: 92, y: 13 },
  { id: 'stratum', x: 4, y: 46 },
  { id: 'services', x: 90, y: 49 },
  { id: 'team', x: 7, y: 84 },
  { id: 'availability', x: 88, y: 83 },
]

export default function ConnectionLines({ activeIsland }: ConnectionLinesProps) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5] overflow-visible">
      <defs>
        <radialGradient id="center-glow" cx="50%" cy="50%" r="3%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id="dot-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dot-glow-sm" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Center glow */}
      <circle cx="50%" cy="50%" r="40" fill="url(#center-glow)" />
      <circle cx="50%" cy="50%" r="3" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <circle cx="50%" cy="50%" r="1.5" fill="rgba(255,255,255,0.25)" />

      {LINES.map((line) => {
        const isActive = activeIsland === line.id

        return (
          <g key={line.id}>
            {/* Base dashed line */}
            <line
              x1="50%" y1="50%"
              x2={`${line.x}%`} y2={`${line.y}%`}
              stroke={isActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.035)'}
              strokeWidth={isActive ? '0.8' : '0.5'}
              strokeDasharray="3 9"
              style={{
                animation: 'dashFlow 2.5s linear infinite',
                transition: 'stroke 0.4s ease, stroke-width 0.4s ease',
              }}
            />

            {isActive && (
              <motion.line
                x1="50%" y1="50%"
                x2={`${line.x}%`} y2={`${line.y}%`}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
            )}

            {isActive && (
              <>
                <motion.circle
                  r="2"
                  fill="rgba(255,255,255,0.7)"
                  filter="url(#dot-glow)"
                  animate={{
                    cx: ['50%', `${line.x}%`],
                    cy: ['50%', `${line.y}%`],
                    opacity: [0, 0.8, 0.6, 0.3, 0],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.circle
                  r="1.2"
                  fill="rgba(255,255,255,0.45)"
                  filter="url(#dot-glow-sm)"
                  animate={{
                    cx: ['50%', `${line.x}%`],
                    cy: ['50%', `${line.y}%`],
                    opacity: [0, 0.6, 0.4, 0.15, 0],
                  }}
                  transition={{ duration: 1.8, delay: 0.6, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
                />
              </>
            )}

            {isActive && (
              <>
                <motion.circle
                  cx={`${line.x}%`} cy={`${line.y}%`}
                  fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"
                  initial={{ r: 2, opacity: 0 }}
                  animate={{ r: [2, 8], opacity: [0.4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.circle
                  cx={`${line.x}%`} cy={`${line.y}%`}
                  r="2" fill="rgba(255,255,255,0.35)" filter="url(#dot-glow-sm)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </>
            )}

            {isActive && (
              <motion.circle
                cx="50%" cy="50%"
                fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5"
                initial={{ r: 1.5, opacity: 0 }}
                animate={{ r: [1.5, 5], opacity: [0.3, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}
