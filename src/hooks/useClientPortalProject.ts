'use client'
import { useClientProject } from '@/lib/ClientProjectContext'
import type { ProjectRow } from '@/lib/db-types'

/**
 * Reads the client-project bundle from context (fetched once in
 * client/[code]/layout via ClientProjectProvider). Kept as a thin wrapper so
 * existing pages keep importing from here unchanged. Page-to-page navigation
 * is now instant — there is no per-page network fetch or loading spinner,
 * because the layout persists the data across navigation.
 */
export function useClientPortalProject(): {
  project: ProjectRow | null
  loading: boolean
  code: string
} {
  return useClientProject()
}
