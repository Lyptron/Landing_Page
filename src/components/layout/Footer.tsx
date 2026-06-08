'use client'
import { useCursor } from '../providers/CursorProvider'

export default function Footer() {
  const { setCursorState } = useCursor()

  return (
    <footer className="w-full py-8 border-t border-white/[0.04] bg-[#050505] text-white/20 font-mono text-xs select-none z-10 relative">
      <div className="w-full px-6 md:px-[120px] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="tracking-wider uppercase">
          &copy; {new Date().getFullYear()} Lyptron. All rights reserved.
        </div>
        <div className="flex gap-6 items-center">
          <a
            href="#"
            className="hover:text-white/60 transition-colors duration-300 cursor-none tracking-wider uppercase"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            Privacy
          </a>
          <a
            href="#"
            className="hover:text-white/60 transition-colors duration-300 cursor-none tracking-wider uppercase"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            Terms
          </a>
          <span className="text-white/10">/</span>
          <span className="text-white/30">Crafted with precision</span>
        </div>
      </div>
    </footer>
  )
}
