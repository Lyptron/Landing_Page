'use client'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sun, Moon, SunMoon, type LucideIcon } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useThemeMode, type ThemeMode } from '@/hooks/useThemeMode'

const NEXT_MODE: Record<ThemeMode, ThemeMode> = { auto: 'light', light: 'dark', dark: 'auto' }
const MODE_ICON: Record<ThemeMode, LucideIcon> = { auto: SunMoon, light: Sun, dark: Moon }
const LONG_PRESS_MS = 500

/**
 * Topbar theme control. Click cycles auto → light → dark → auto;
 * right-click or long-press jumps to Settings → Appearance for the
 * full auto-strategy controls.
 */
export default function ThemeToggle() {
  const { mode, reason, setMode } = useThemeMode()
  const router = useRouter()
  const pressTimer = useRef<number | null>(null)
  const longPressed = useRef(false)

  const goToAppearance = () => router.push('/admin/settings#appearance')

  const startPress = () => {
    longPressed.current = false
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true
      goToAppearance()
    }, LONG_PRESS_MS)
  }

  const cancelPress = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  const handleClick = () => {
    if (longPressed.current) {
      longPressed.current = false
      return
    }
    setMode(NEXT_MODE[mode])
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    goToAppearance()
  }

  const Icon = MODE_ICON[mode]

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={startPress}
            onTouchEnd={cancelPress}
            aria-label={`Theme: ${mode}. Click to change, right-click for appearance settings.`}
            className="hover:text-(--cp-text) transition-colors"
            style={{ color: 'var(--cp-text-faint)' }}
          >
            <Icon className="w-4 h-4" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            sideOffset={8}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium z-[200] whitespace-nowrap"
            style={{ background: 'var(--cp-text)', color: 'var(--cp-bg)' }}
          >
            {reason} · right-click for settings
            <Tooltip.Arrow style={{ fill: 'var(--cp-text)' }} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
