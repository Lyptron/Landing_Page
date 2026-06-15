export type AdminRole = 'founder' | 'admin' | 'marketing'

export const ROLE_ROUTE_MAP: Record<string, AdminRole[]> = {
  '/admin/founder': ['founder'],
  '/admin/finance': ['founder'],
  '/admin/subscriptions': ['founder'],
  '/admin/permissions': ['founder'],
  '/admin/settings': ['founder', 'admin'],
  '/admin/dashboard': ['founder', 'admin', 'marketing'],
  '/admin/projects': ['founder', 'admin', 'marketing'],
  '/admin/clients': ['founder', 'admin'],
  '/admin/crm': ['founder', 'admin', 'marketing'],
  '/admin/leads': ['founder', 'admin', 'marketing'],
  '/admin/tasks': ['founder', 'admin', 'marketing'],
  '/admin/team': ['founder', 'admin', 'marketing'],
  '/admin/reports': ['founder', 'admin', 'marketing'],
  '/admin/marketing': ['founder', 'marketing'],
  '/admin/campaigns': ['founder', 'admin', 'marketing'],
  '/admin/analytics': ['founder', 'admin', 'marketing'],
}

export function canAccessRoute(role: AdminRole | undefined, pathname: string): boolean {
  if (!role) return false
  
  // Exact match first
  if (ROLE_ROUTE_MAP[pathname]) {
    return ROLE_ROUTE_MAP[pathname].includes(role)
  }
  
  // Handle dynamic routes like /admin/projects/[id]
  const basePath = Object.keys(ROLE_ROUTE_MAP).find(path => pathname.startsWith(path + '/'))
  if (basePath) {
    return ROLE_ROUTE_MAP[basePath].includes(role)
  }

  // Default to false for unknown routes
  // But if it's just /admin, we can map it to dashboard
  if (pathname === '/admin') {
    return ROLE_ROUTE_MAP['/admin/dashboard'].includes(role)
  }

  return false
}

export function getFallbackRoute(role: AdminRole | undefined): string {
  if (role === 'founder') return '/admin/dashboard'
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'marketing') return '/admin/marketing'
  return '/admin/login'
}
