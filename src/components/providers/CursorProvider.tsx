'use client'
import React, { createContext, useContext, useState } from 'react'
import { CursorState } from '@/types'

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
