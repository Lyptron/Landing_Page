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
  const value = React.useMemo(() => ({ cursorState, setCursorState }), [cursorState])
  return (
    <CursorContext.Provider value={value}>
      {children}
    </CursorContext.Provider>
  )
}

export const useCursor = () => useContext(CursorContext)
