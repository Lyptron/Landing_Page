import type { Dispatch, SetStateAction } from 'react'

/**
 * Optimistic state update with automatic rollback on failure.
 *
 * Uses the functional updater form so `prev` is the *true* previous state,
 * not a stale render closure — this fixes lost-update clobbering when two
 * optimistic edits fire before a re-render, and guarantees rollback reverts
 * exactly this change.
 */
export async function optimistic<T>(
  setState: Dispatch<SetStateAction<T>>,
  apply: (prev: T) => T,
  persist: () => Promise<{ error: unknown }>,
): Promise<{ error: unknown }> {
  let prev!: T
  setState((p) => {
    prev = p
    return apply(p)
  })
  const { error } = await persist()
  if (error) setState(prev)
  return { error }
}
