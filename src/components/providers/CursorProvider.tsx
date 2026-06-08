'use client'
import React, { createContext, useContext, useState } from 'react'
import { CursorState } from '@/types'

if (typeof window !== 'undefined') {
  const originalWarn = console.warn
  console.warn = (...args: any[]) => {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      (args[0].includes('THREE.Clock: This module has been deprecated') ||
        args[0].includes('THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated'))
    ) {
      return
    }
    originalWarn(...args)
  }
}

interface CursorContextProps {
  cursorState: CursorState
  setCursorState: (state: CursorState) => void
}

const CursorContext = createContext<CursorContextProps>({
  cursorState: 'default',
  setCursorState: () => {},
})

export const CursorProvider = ({ children }: { children: React.ReactNode }) => {
  const [cursorState, setCursorState] = useState<CursorState>('default')
  return (
    <CursorContext.Provider value={{ cursorState, setCursorState }}>
      {children}
    </CursorContext.Provider>
  )
}

export const useCursor = () => useContext(CursorContext)
