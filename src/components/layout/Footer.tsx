'use client'
import Link from 'next/link'
import { useCursor } from '../providers/CursorProvider'

const CONTACT_EMAIL = 'hello@lyptron.com'

export default function Footer() {
  const { setCursorState } = useCursor()

  return (
    <footer
      role="contentinfo"
      className="w-full py-8 border-t border-white/[0.04] bg-[#050505] text-white/20 font-mono text-xs select-none z-10 relative"
    >
      <div className="w-full px-6 md:px-[120px] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="tracking-wider uppercase">
          &copy; {new Date().getFullYear()} Lyptron. All rights reserved.
        </div>
        <address className="not-italic flex gap-4 md:gap-6 items-center">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="hover:text-white/60 transition-colors duration-300 cursor-none tracking-wider"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            {CONTACT_EMAIL}
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
        </address>
      </div>
    </footer>
  )
}
