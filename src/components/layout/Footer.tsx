'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCursor } from '../providers/CursorProvider'

const EMAIL_USER = 'hello'
const EMAIL_DOMAIN = 'lyptron.com'

export default function Footer() {
  const { setCursorState } = useCursor()
  const [mailHref, setMailHref] = useState('#')
  const [mailLabel, setMailLabel] = useState('hello [at] lyptron [dot] com')

  useEffect(() => {
    // Client-only de-obfuscation so scrapers see the placeholder string in SSR.
    const addr = `${EMAIL_USER}@${EMAIL_DOMAIN}`
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMailHref(`mailto:${addr}`)
    setMailLabel(addr)
  }, [])

  return (
    <footer
      role="contentinfo"
      className="w-full py-8 border-t border-white/4 bg-bg text-white/20 font-mono text-xs select-none z-10 relative"
    >
      <div className="w-full px-6 md:px-30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="tracking-wider uppercase">
          &copy; {new Date().getFullYear()} Lyptron. All rights reserved.
        </div>
        <address className="not-italic flex flex-wrap justify-center gap-x-4 gap-y-2 md:gap-6 items-center">
          <a
            href={mailHref}
            rel="nofollow"
            className="hover:text-white/60 transition-colors duration-300 cursor-none tracking-wider"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            {mailLabel}
          </a>
          <span className="text-white/10" aria-hidden="true">/</span>
          <Link
            href="/privacy"
            className="hover:text-white/60 transition-colors duration-300 cursor-none tracking-wider uppercase"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="hover:text-white/60 transition-colors duration-300 cursor-none tracking-wider uppercase"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            Terms
          </Link>
          <span className="text-white/10" aria-hidden="true">/</span>
          <a
            href="https://www.linkedin.com/company/lyptron"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Lyptron on LinkedIn"
            className="hover:text-white/60 transition-colors duration-300 cursor-none tracking-wider uppercase"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            LinkedIn
          </a>
        </address>
      </div>
    </footer>
  )
}
