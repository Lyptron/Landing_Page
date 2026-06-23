import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_HOST = 'admin.lyptron.com'
const CLIENT_HOST = 'client.lyptron.com'
const MAIN_HOSTS = ['lyptron.com', 'www.lyptron.com']

/** Static assets and framework internals should never be prefix-rewritten. */
function isStaticOrApi(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // favicon.ico, robots.txt, /images/foo.png, etc.
  )
}

export async function proxy(request: NextRequest) {
  const host = (request.headers.get('host') || '').split(':')[0]
  const { pathname, search } = request.nextUrl
  const skipRouting = isStaticOrApi(pathname)

  // Production main domain: push anyone who lands on /admin or /client to
  // the dedicated subdomain so cookies/sessions stay scoped to the right
  // origin. Skipped on localhost/preview hosts so local dev keeps working.
  if (!skipRouting && MAIN_HOSTS.includes(host)) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL(`https://${ADMIN_HOST}${pathname}${search}`, request.url), 308)
    }
    if (pathname.startsWith('/client')) {
      return NextResponse.redirect(new URL(`https://${CLIENT_HOST}${pathname}${search}`, request.url), 308)
    }
  }

  // admin.lyptron.com / client.lyptron.com — serve the matching /admin or
  // /client route internally without the prefix showing in the URL bar.
  // Paths that already carry the prefix pass through untouched.
  let effectivePathname = pathname
  let rewriteUrl: URL | null = null

  if (!skipRouting) {
    if (host === ADMIN_HOST && !pathname.startsWith('/admin')) {
      effectivePathname = `/admin${pathname}`
      rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = effectivePathname
    } else if (host === CLIENT_HOST && !pathname.startsWith('/client')) {
      effectivePathname = `/client${pathname}`
      rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = effectivePathname
    }
  }

  let response = rewriteUrl ? NextResponse.rewrite(rewriteUrl, { request }) : NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  // The Supabase session refresh + admin auth gate is only relevant for
  // admin routes — skip the extra round-trip for marketing/client traffic.
  if (!effectivePathname.startsWith('/admin')) {
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = rewriteUrl ? NextResponse.rewrite(rewriteUrl, { request }) : NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Securely retrieve the authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  // Protect Admin dashboard routes (allow access to /admin/login)
  if (!effectivePathname.includes('/admin/login') && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
