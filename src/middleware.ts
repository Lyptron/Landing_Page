import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_HOST = 'admin.lyptron.com'
const CLIENT_HOST = 'client.lyptron.com'
const MAIN_HOSTS = ['lyptron.com', 'www.lyptron.com']

/** Static assets and framework internals should never be prefix-rewritten. */
function isPassthrough(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // favicon.ico, robots.txt, /images/foo.png, etc.
  )
}

export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').split(':')[0]
  const { pathname, search } = request.nextUrl

  if (isPassthrough(pathname)) {
    return NextResponse.next()
  }

  // Production main domain only: push anyone who lands on /admin or /client
  // there to the dedicated subdomain so cookies/sessions stay scoped to the
  // right origin going forward. Skipped on localhost and preview deployments
  // so local dev and Vercel previews keep working against the old paths.
  if (MAIN_HOSTS.includes(host)) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL(`https://${ADMIN_HOST}${pathname}${search}`, request.url), 308)
    }
    if (pathname.startsWith('/client')) {
      return NextResponse.redirect(new URL(`https://${CLIENT_HOST}${pathname}${search}`, request.url), 308)
    }
    return NextResponse.next()
  }

  if (host !== ADMIN_HOST && host !== CLIENT_HOST) {
    return NextResponse.next()
  }

  // admin.lyptron.com — serve /admin/* internally without the prefix showing
  // in the URL bar. Paths that already carry the prefix (old links, direct
  // hits) pass through untouched.
  if (host === ADMIN_HOST && !pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone()
    url.pathname = `/admin${pathname}`
    return NextResponse.rewrite(url)
  }

  // client.lyptron.com — same idea for /client/*.
  if (host === CLIENT_HOST && !pathname.startsWith('/client')) {
    const url = request.nextUrl.clone()
    url.pathname = `/client${pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
