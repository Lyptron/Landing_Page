const ADMIN_HOST = 'admin.lyptron.com'
const CLIENT_HOST = 'client.lyptron.com'

/**
 * usePathname() reflects the browser-visible URL, which on admin.lyptron.com /
 * client.lyptron.com no longer carries the /admin or /client prefix — proxy.ts
 * rewrites it away server-side. Anything gating on that prefix needs the
 * logical path instead, reconstructed from the current hostname.
 */
export function toLogicalPathname(pathname: string | null | undefined): string {
  const p = pathname || '/'
  if (typeof window === 'undefined') return p

  const host = window.location.hostname
  if (host === ADMIN_HOST && !p.startsWith('/admin')) {
    return p === '/' ? '/admin' : `/admin${p}`
  }
  if (host === CLIENT_HOST && !p.startsWith('/client')) {
    return p === '/' ? '/client' : `/client${p}`
  }
  return p
}
