import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type DangerAction =
  | { type: 'reset_all_finance' }
  | { type: 'reset_all_projects_data' }
  | { type: 'reset_all_leads' }
  | { type: 'factory_reset_agency' }
  | { type: 'delete_client_cascade'; clientId: string }

const PROJECT_CHILD_TABLES = [
  'invoices',
  'payments',
  'milestones',
  'approvals',
  'activities',
  'deployments',
  'documents',
  'meetings',
  'feedback',
  'gallery',
  'project_team',
  'announcements',
]

const FINANCE_TABLES = [
  'invoices',
  'payments',
  'expenses',
  'subscriptions',
  'revenue_analytics',
]

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function parseAction(input: unknown): DangerAction | null {
  if (!input || typeof input !== 'object') return null
  const payload = input as Record<string, unknown>
  if (payload.type === 'delete_client_cascade') {
    return typeof payload.clientId === 'string' && payload.clientId
      ? { type: payload.type, clientId: payload.clientId }
      : null
  }
  if (
    payload.type === 'reset_all_finance' ||
    payload.type === 'reset_all_projects_data' ||
    payload.type === 'reset_all_leads' ||
    payload.type === 'factory_reset_agency'
  ) {
    return { type: payload.type }
  }
  return null
}

function serverSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return null

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

async function deleteAll(
  supabase: SupabaseClient,
  table: string
) {
  const { error } = await supabase.from(table).delete().not('id', 'is', null)
  if (error) throw new Error(error.message)
}

export async function POST(request: NextRequest) {
  const supabase = serverSupabase()
  if (!supabase) return jsonError('Server Supabase credentials are not configured.', 500)

  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : ''
  if (!token) return jsonError('Missing bearer token.', 401)

  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  const authUser = userData.user
  if (userError || !authUser) return jsonError('Invalid session.', 401)

  const email = (authUser.email || '').toLowerCase()
  const { data: userIdRole, error: userIdRoleError } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', authUser.id)
    .maybeSingle()

  if (userIdRoleError) return jsonError('Could not verify admin role.', 403)

  const { data: emailRole, error: emailRoleError } = userIdRole
    ? { data: null, error: null }
    : await supabase
      .from('admin_users')
      .select('role')
      .ilike('email', email)
      .maybeSingle()

  if (emailRoleError) return jsonError('Could not verify admin role.', 403)

  const role = userIdRole?.role || emailRole?.role
  if (role !== 'founder') return jsonError('Founder role required.', 403)

  const action = parseAction(await request.json().catch(() => null))
  if (!action) return jsonError('Invalid danger action.', 400)

  try {
    if (action.type === 'reset_all_finance') {
      for (const table of FINANCE_TABLES) await deleteAll(supabase, table)
    }

    if (action.type === 'reset_all_projects_data') {
      for (const table of PROJECT_CHILD_TABLES) await deleteAll(supabase, table)
    }

    if (action.type === 'reset_all_leads') {
      await deleteAll(supabase, 'leads')
      await deleteAll(supabase, 'inquiries')
    }

    if (action.type === 'delete_client_cascade') {
      const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', action.clientId)
      if (projectError) throw new Error(projectError.message)

      const projectIds = (projects || []).map((project) => project.id)
      if (projectIds.length) {
        for (const table of PROJECT_CHILD_TABLES) {
          const { error } = await supabase.from(table).delete().in('project_id', projectIds)
          if (error && error.code !== '42703') throw new Error(error.message)
        }

        const { error } = await supabase.from('projects').delete().in('id', projectIds)
        if (error) throw new Error(error.message)
      }

      const { error } = await supabase.from('clients').delete().eq('id', action.clientId)
      if (error) throw new Error(error.message)
    }

    if (action.type === 'factory_reset_agency') {
      for (const table of PROJECT_CHILD_TABLES) await deleteAll(supabase, table)
      await deleteAll(supabase, 'projects')
      await deleteAll(supabase, 'clients')
      await deleteAll(supabase, 'tasks')
      await deleteAll(supabase, 'marketing_tasks')
      await deleteAll(supabase, 'campaigns')
      await deleteAll(supabase, 'leads')
      await deleteAll(supabase, 'inquiries')
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Danger action failed.', 500)
  }
}
