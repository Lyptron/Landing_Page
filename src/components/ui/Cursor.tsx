'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, useMotionValue } from 'framer-motion'
import { useCursor } from '../providers/CursorProvider'

export default function Cursor() {
  const { cursorState } = useCursor()
  const [isVisible, setIsVisible] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const isVisibleRef = useRef(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  useEffect(() => {
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
  let size = 5
  let color = '#ffffff'
  let opacity = 1

  switch (cursorState) {
    case 'hover':
      size = 14
      color = '#ffffff'
      break
    case 'cta':
      size = 18
      color = '#1d7ef5'
      break
    case 'drag':
      size = 12
      color = '#ffffff'
      opacity = 0.6
      break
    case 'default':
    default:
      size = 5
      color = '#ffffff'
      break
  }

  const transition = { duration: 0.12, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] mix-blend-difference"
      style={{
        x: cursorX,
        y: cursorY,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
      animate={{
        backgroundColor: color,
        opacity: opacity,
      }}
      transition={transition}
    />
  )
}
