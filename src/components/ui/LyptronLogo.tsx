'use client'

import { useLogoUrl } from '@/lib/LogoContext'

import Image from 'next/image'

/**
 * Shared Lyptron brand mark — renders the agency logo image.
 * Uses the uploaded logo from Settings (via LogoContext) if available,
 * otherwise falls back to the static /images/logo.gif.
 */
const DEFAULT_LOGO = '/images/logo.gif'
const DEFAULT_LOGO_LIGHT = '/images/logo-light.gif'

// Single universal size for the Lyptron mark across nav, admin, client,
// login, and loading screens. Source artwork is 62x76 (aspect ~0.814).
const MARK_WIDTH = 31
const MARK_HEIGHT = 38

export function LyptronMark({ className = '' }: { size?: number; className?: string }) {
  const src = useLogoUrl()
  // The default mark has a pre-rendered light-mode variant (white lines ->
  // black) swapped via the dark: variant. An admin-uploaded custom logo is
  // a single arbitrary image, so it's rendered as-is in both themes.
  const isDefaultLogo = src === DEFAULT_LOGO

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center ${className}`}
      style={{
        width: MARK_WIDTH,
        height: MARK_HEIGHT,
      }}
    >
      {isDefaultLogo ? (
        <>
          <Image
            src={DEFAULT_LOGO}
            alt="Lyptron"
            width={MARK_WIDTH}
            height={MARK_HEIGHT}
            unoptimized
            className="object-contain hidden dark:block"
          />
          <Image
            src={DEFAULT_LOGO_LIGHT}
            alt="Lyptron"
            width={MARK_WIDTH}
            height={MARK_HEIGHT}
            unoptimized
            className="object-contain dark:hidden"
          />
        </>
      ) : (
        <Image
          src={src}
          alt="Lyptron"
          width={MARK_WIDTH}
          height={MARK_HEIGHT}
          unoptimized
          className="object-contain"
        />
      )}
    </div>
  )
}

/** Lyptron wordmark text, with an optional small uppercase subtitle (e.g. "Client Portal"). */
export function LyptronWordmark({
  className = '',
  textClassName = 'text-[15px]',
  subtitle,
}: {
  className?: string
  textClassName?: string
  subtitle?: string
}) {
  return (
    <div className={`flex flex-col leading-none min-w-0 ${className}`}>
      <span className={`font-display font-bold tracking-tight truncate ${textClassName}`} style={{ color: 'var(--cp-text, #f6f4ef)' }}>
        Lyptron
      </span>
      {subtitle && (
        <span
          className="text-[9px] font-semibold tracking-[0.18em] uppercase mt-1 truncate"
          style={{ color: 'var(--cp-text-muted, rgba(246,244,239,0.46))' }}
        >
          {subtitle}
        </span>
      )}
    </div>
  )
}

/** Combined mark + wordmark, ready to drop into headers, sidebars, and login screens. */
export function LyptronLogo({
  size = 42,
  textClassName = 'text-[16.5px]',
  subtitle,
  className = '',
}: {
  size?: number
  textClassName?: string
  subtitle?: string
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <LyptronMark size={size} />
      <LyptronWordmark textClassName={textClassName} subtitle={subtitle} />
    </div>
  )
}
