'use client'
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useCursor } from '../providers/CursorProvider'

export default function Cursor() {
  const { cursorState } = useCursor()
  const [isVisible, setIsVisible] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  // Smooth springs for tracking
  const springConfig = { damping: 30, stiffness: 300, mass: 0.6 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener('mousemove', moveCursor)
    document.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      window.removeEventListener('mousemove', moveCursor)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [cursorX, cursorY, isVisible])

  useEffect(() => {
    // Hide default cursor on desktop
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      document.body.style.cursor = 'none'
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.cursor = 'auto'
      }
    }
  }, [])

  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    return null
  }

  if (!isVisible) return null

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

  const transition = { duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] mix-blend-difference"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
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
