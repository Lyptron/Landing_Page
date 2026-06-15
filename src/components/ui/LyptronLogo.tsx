'use client'

import { useLogoUrl } from '@/lib/LogoContext'

import Image from 'next/image'

/**
 * Shared Lyptron brand mark — renders the agency logo image.
 * Uses the uploaded logo from Settings (via LogoContext) if available,
 * otherwise falls back to the static /images/logo.gif.
 */
export function LyptronMark({ size = 42, className = '' }: { size?: number; className?: string }) {
  const src = useLogoUrl()
  const imageSize = Math.round(size * 0.75)

  return (
    <div
      className={`relative shrink-0 rounded-full flex items-center justify-center bg-[#14120F] dark:bg-transparent transition-colors ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <Image
        src={src}
        alt="Lyptron"
        width={imageSize}
        height={imageSize}
        unoptimized
        className="w-[75%] h-[75%] object-contain rounded-full"
        style={{ width: '75%', height: '75%' }}
      />
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
