'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { fetchProjectByAccessCode } from '@/lib/db'
import type { ProjectRow } from '@/lib/db-types'

type ClientProjectValue = {
  project: ProjectRow | null
  loading: boolean
  code: string
}

const ClientProjectContext = createContext<ClientProjectValue>({
  project: null,
  loading: true,
  code: '',
})

/**
 * Fetches the full client-project bundle ONCE and holds it. Mounted in the
 * persistent `client/[code]/layout`, so it survives navigation between the
 * portal's pages — every page reads this from memory instead of re-hitting
 * get_client_project_bundle on each click. That's what makes page switches
 * instant instead of showing a spinner + network round-trip each time.
 */
export function ClientProjectProvider({ code, children }: { code: string; children: ReactNode }) {
  const [project, setProject] = useState<ProjectRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchProjectByAccessCode(code)
      .then(({ data }) => {
        if (cancelled) return
        setProject(data)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [code])

  return (
    <ClientProjectContext.Provider value={{ project, loading, code }}>
      {children}
    </ClientProjectContext.Provider>
  )
}

export function useClientProject() {
  return useContext(ClientProjectContext)
}
