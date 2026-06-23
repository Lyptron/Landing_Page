'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { fetchProjectByAccessCode } from '@/lib/db'
import type { ProjectRow } from '@/lib/db-types'

/**
 * The pattern every client/[code]/* page repeats: read `code` from the route,
 * fetch the project by access code, optionally fetch a follow-up resource
 * keyed on the project id, and track loading state.
 *
 * Pass `fetcher` when the page needs more than the joined relations the
 * project query already returns. Pages that only read `project.milestones`,
 * `project.documents`, etc. should leave `fetcher` undefined.
 */
export function useClientPortalProject<T = unknown>(
  fetcher?: (projectId: string) => Promise<{ data: T | null }>,
): { project: ProjectRow | null; resource: T | null; loading: boolean; code: string } {
  const params = useParams()
  const code = params.code as string
  const [project, setProject] = useState<ProjectRow | null>(null)
  const [resource, setResource] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: proj } = await fetchProjectByAccessCode(code)
      if (cancelled) return
      if (!proj) {
        setLoading(false)
        return
      }
      setProject(proj as ProjectRow)
      if (fetcher) {
        const { data } = await fetcher(proj.id)
        if (cancelled) return
        setResource(data)
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
    // fetcher is intentionally omitted from deps — callers should pass a stable
    // reference (module-level function or useCallback) so the hook fires only
    // when the access code changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  return { project, resource, loading, code }
}
