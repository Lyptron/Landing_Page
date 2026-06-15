'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { fetchAgencySettings } from '@/lib/db'

interface LogoContextType {
  logoUrl: string
  setLogoUrl: (url: string) => void
}

const LogoContext = createContext<LogoContextType>({
  logoUrl: '/images/logo.gif',
  setLogoUrl: () => {},
})

export function useLogoUrl() {
  return useContext(LogoContext).logoUrl
}

/** Imperatively update the global logo URL (e.g. after upload in Settings). */
export function useSetLogoUrl() {
  return useContext(LogoContext).setLogoUrl
}

/**
 * Provides the uploaded agency logo URL to all children.
 * Falls back to `/images/logo.gif` if no custom logo is configured.
 */
export function LogoProvider({ children }: { children: React.ReactNode }) {
  const [logoUrl, setLogoUrl] = useState('/images/logo.gif')

  useEffect(() => {
    async function load() {
      try {
        const { data } = await fetchAgencySettings()
        if (data?.logo_url) setLogoUrl(data.logo_url)
      } catch {
        // Silently fall back to default logo
      }
    }
    load()
  }, [])

  return (
    <LogoContext.Provider value={{ logoUrl, setLogoUrl }}>
      {children}
    </LogoContext.Provider>
  )
}
