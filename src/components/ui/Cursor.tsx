'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useCursor } from '../providers/CursorProvider'

export default function Cursor() {
  const { cursorState } = useCursor()
  const [isVisible, setIsVisible] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const isVisibleRef = useRef(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  // Snappier spring — the old config (stiffness 600 / mass 0.4) trailed
  // noticeably behind the pointer. Higher stiffness + lower mass makes it
  // track the mouse almost 1:1 while keeping motion smooth (not jittery).
  const springConfig = { stiffness: 1500, damping: 45, mass: 0.22 }
  const springX = useSpring(cursorX, springConfig)
  const springY = useSpring(cursorY, springConfig)

  useEffect(() => {
    // Resolves on the client only — SSR can't know viewport width.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDesktop(window.innerWidth > 768)
  }, [])

  useEffect(() => {
    if (!isDesktop) return

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      if (!isVisibleRef.current) {
        isVisibleRef.current = true
        setIsVisible(true)
      }
    }

    const handleMouseLeave = () => {
      isVisibleRef.current = false
      setIsVisible(false)
    }

    window.addEventListener('mousemove', moveCursor, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [cursorX, cursorY, isDesktop])

  useEffect(() => {
    if (!isDesktop) return
    document.body.style.cursor = 'none'
    return () => { document.body.style.cursor = 'auto' }
  }, [isDesktop])

  if (!isDesktop || !isVisible) return null

  // Dimension details based on CursorState
  let size = 7
  let color = '#ffffff'
  let opacity = 1

  switch (cursorState) {
    case 'hover':
      size = 16
      color = '#ffffff'
      break
    case 'cta':
      size = 20
      color = '#4da6ff'
      break
    case 'drag':
      size = 13
      color = '#ffffff'
      opacity = 0.7
      break
    case 'default':
    default:
      size = 7
      color = '#ffffff'
      break
  }

  const transition = { duration: 0.12, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-9999 mix-blend-difference"
      style={{
        x: springX,
        y: springY,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
      animate={{
        backgroundColor: color,
        opacity: opacity,
        // Soft glow makes the cursor read brighter over busy/mid-tone areas.
        boxShadow: `0 0 8px ${color}, 0 0 3px ${color}`,
      }}
      transition={transition}
    />
  )
}
