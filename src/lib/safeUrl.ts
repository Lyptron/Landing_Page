export function safeHttpUrl(value: string | null | undefined) {
  if (!value) return null

  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

export function isSafeHttpUrl(value: string | null | undefined) {
  return safeHttpUrl(value) !== null
}
