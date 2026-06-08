import { supabase, isSupabaseConfigured } from './supabase'

// ─── Inquiries ───────────────────────────────────────────────
export async function insertInquiry(data: {
  first_name: string
  last_name: string
  email: string
  project_type: string
  description: string
}) {
  return supabase.from('inquiries').insert([data])
}

export async function fetchInquiries() {
  return supabase.from('inquiries').select('*').order('created_at', { ascending: false })
}

// ─── Projects ────────────────────────────────────────────────
export async function fetchProjects() {
  return supabase
    .from('projects')
    .select('*, milestones(*), payments(*)')
    .order('created_at', { ascending: false })
}

export async function fetchProjectByAccessCode(code: string) {
  return supabase
    .from('projects')
    .select('*, milestones(*), payments(*), approvals(*), activities(*), deployments(*), documents(*), meetings(*), feedback(*), gallery(*)')
    .eq('access_code', code)
    .single()
}

export async function fetchProjectsKanban() {
  return supabase
    .from('projects')
    .select('*, project_team(team_member_id, team_members(initials))')
    .order('created_at', { ascending: false })
}

export async function insertProject(data: {
  name: string
  client_email: string
  status?: string
  progress?: number
  description?: string
}) {
  return supabase.from('projects').insert(data).select().single()
}

export async function updateProject(id: string, data: Record<string, unknown>) {
  return supabase.from('projects').update(data).eq('id', id)
}

// ─── Milestones ──────────────────────────────────────────────
export async function insertMilestone(data: { name: string; status: string; project_id: string }) {
  return supabase.from('milestones').insert(data).select().single()
}

export async function updateMilestone(id: string, data: Record<string, unknown>) {
  return supabase.from('milestones').update(data).eq('id', id)
}

// ─── Payments ────────────────────────────────────────────────
export async function insertPayment(data: { amount: number; status: string; project_id: string }) {
  return supabase.from('payments').insert(data).select().single()
}

export async function updatePayment(id: string, data: Record<string, unknown>) {
  return supabase.from('payments').update(data).eq('id', id)
}

// ─── Clients ─────────────────────────────────────────────────
export async function fetchClients() {
  return supabase.from('clients').select('*').order('created_at', { ascending: false })
}

export async function insertClient(data: {
  company: string
  contact: string
  email: string
  phone?: string
  location?: string
  website?: string
  industry?: string
  contract_value?: number
  status?: string
}) {
  return supabase.from('clients').insert(data).select().single()
}

export async function updateClient(id: string, data: Record<string, unknown>) {
  return supabase.from('clients').update(data).eq('id', id)
}

// ─── Leads (CRM) ────────────────────────────────────────────
export async function fetchLeads() {
  return supabase.from('leads').select('*').order('created_at', { ascending: false })
}

export async function insertLead(data: {
  company: string
  contact: string
  stage?: string
  value?: number
  probability?: number
  source?: string
}) {
  return supabase.from('leads').insert(data).select().single()
}

export async function updateLead(id: string, data: Record<string, unknown>) {
  return supabase.from('leads').update(data).eq('id', id)
}

// ─── Invoices ────────────────────────────────────────────────
export async function fetchInvoices() {
  return supabase.from('invoices').select('*').order('created_at', { ascending: false })
}

export async function insertInvoice(data: {
  invoice_number: string
  client_name: string
  amount: number
  status?: string
  issued_date?: string
  due_date?: string
}) {
  return supabase.from('invoices').insert(data).select().single()
}

// ─── Revenue Analytics ──────────────────────────────────────
export async function fetchRevenueAnalytics() {
  return supabase.from('revenue_analytics').select('*').order('month', { ascending: true })
}

// ─── Team Members ───────────────────────────────────────────
export async function fetchTeamMembers() {
  return supabase.from('team_members').select('*').eq('is_active', true)
}

export async function fetchProjectTeam(projectId: string) {
  return supabase
    .from('project_team')
    .select('*, team_members(*)')
    .eq('project_id', projectId)
}

// ─── Activities ──────────────────────────────────────────────
export async function fetchActivities(projectId?: string, limit = 10) {
  let query = supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(limit)
  if (projectId) query = query.eq('project_id', projectId)
  return query
}

export async function insertActivity(data: {
  project_id?: string
  type: string
  actor_name: string
  action_text: string
  metadata?: Record<string, unknown>
}) {
  return supabase.from('activities').insert(data)
}

// ─── Approvals ───────────────────────────────────────────────
export async function fetchApprovals(projectId: string) {
  return supabase.from('approvals').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
}

export async function updateApproval(id: string, status: string) {
  return supabase.from('approvals').update({ status }).eq('id', id)
}

// ─── Deployments ─────────────────────────────────────────────
export async function fetchDeployments(projectId: string) {
  return supabase.from('deployments').select('*').eq('project_id', projectId).order('deployed_at', { ascending: false })
}

// ─── Documents ───────────────────────────────────────────────
export async function fetchDocuments(projectId: string) {
  return supabase.from('documents').select('*').eq('project_id', projectId).order('uploaded_at', { ascending: false })
}

// ─── Meetings ────────────────────────────────────────────────
export async function fetchMeetings(projectId: string) {
  return supabase.from('meetings').select('*').eq('project_id', projectId).order('meeting_date', { ascending: false })
}

// ─── Feedback ────────────────────────────────────────────────
export async function fetchFeedback(projectId: string) {
  return supabase.from('feedback').select('*').eq('project_id', projectId).order('submitted_at', { ascending: false })
}

export async function insertFeedback(data: {
  project_id: string
  type: string
  title: string
  description: string
  priority?: string
}) {
  return supabase.from('feedback').insert(data).select().single()
}

// ─── Gallery ─────────────────────────────────────────────────
export async function fetchGallery(projectId: string) {
  return supabase.from('gallery').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
}

// ─── Access Codes ───────────────────────────────────────────
export async function generateAccessCode(projectId: string, code: string) {
  return supabase.from('projects').update({ access_code: code.toUpperCase() }).eq('id', projectId)
}

export async function removeAccessCode(projectId: string) {
  return supabase.from('projects').update({ access_code: null }).eq('id', projectId)
}

export async function fetchAllProjectsWithCodes() {
  return supabase
    .from('projects')
    .select('id, name, client_email, access_code, status, stage, progress, created_at')
    .order('created_at', { ascending: false })
}

// ─── Full Project CRUD (admin) ───────────────────────────────
export async function deleteProject(id: string) {
  return supabase.from('projects').delete().eq('id', id)
}

export async function deleteClient(id: string) {
  return supabase.from('clients').delete().eq('id', id)
}

export async function deleteLead(id: string) {
  return supabase.from('leads').delete().eq('id', id)
}

// ─── Milestones CRUD ─────────────────────────────────────────
export async function fetchMilestones(projectId: string) {
  return supabase.from('milestones').select('*').eq('project_id', projectId).order('created_at', { ascending: true })
}

export async function deleteMilestone(id: string) {
  return supabase.from('milestones').delete().eq('id', id)
}

// ─── Payments CRUD ───────────────────────────────────────────
export async function fetchPayments(projectId: string) {
  return supabase.from('payments').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
}

export async function deletePayment(id: string) {
  return supabase.from('payments').delete().eq('id', id)
}

// ─── Team CRUD ───────────────────────────────────────────────
export async function insertTeamMember(data: {
  name: string
  initials: string
  role: string
  email?: string
  bio?: string
}) {
  return supabase.from('team_members').insert(data).select().single()
}

export async function updateTeamMember(id: string, data: Record<string, unknown>) {
  return supabase.from('team_members').update(data).eq('id', id)
}

export async function assignTeamMember(projectId: string, teamMemberId: string, role?: string) {
  return supabase.from('project_team').insert({ project_id: projectId, team_member_id: teamMemberId, role_on_project: role }).select().single()
}

export async function removeTeamFromProject(projectId: string, teamMemberId: string) {
  return supabase.from('project_team').delete().eq('project_id', projectId).eq('team_member_id', teamMemberId)
}

// ─── Approvals CRUD ──────────────────────────────────────────
export async function insertApproval(data: {
  project_id: string
  title: string
  type?: string
  description?: string
}) {
  return supabase.from('approvals').insert(data).select().single()
}

// ─── Deployments CRUD ────────────────────────────────────────
export async function insertDeployment(data: {
  project_id: string
  environment: string
  version?: string
  status?: string
  url?: string
}) {
  return supabase.from('deployments').insert(data).select().single()
}

// ─── Documents CRUD ──────────────────────────────────────────
export async function insertDocument(data: {
  project_id: string
  title: string
  type?: string
  file_url?: string
}) {
  return supabase.from('documents').insert(data).select().single()
}

// ─── Meetings CRUD ───────────────────────────────────────────
export async function insertMeeting(data: {
  project_id: string
  title: string
  type?: string
  meeting_date: string
  meeting_time?: string
  link?: string
}) {
  return supabase.from('meetings').insert(data).select().single()
}

// ─── Gallery CRUD ────────────────────────────────────────────
export async function insertGalleryImage(data: {
  project_id: string
  title: string
  image_url: string
  week_label?: string
}) {
  return supabase.from('gallery').insert(data).select().single()
}

// ─── Logo / Storage ─────────────────────────────────────────
export async function uploadLogo(file: File) {
  const ext = file.name.split('.').pop()
  const path = `agency-logo.${ext}`
  // Upload to 'logos' bucket (must be created in Supabase Dashboard → Storage)
  const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true, cacheControl: '3600' })
  if (error) return { data: null, error }
  const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path)
  return { data: urlData.publicUrl, error: null }
}

export async function fetchAgencySettings() {
  return supabase.from('agency_settings').select('*').single()
}

export async function upsertAgencySettings(data: Record<string, unknown>) {
  // Try update first, then insert if no rows exist
  const { data: existing } = await supabase.from('agency_settings').select('id').limit(1).single()
  if (existing) {
    return supabase.from('agency_settings').update(data).eq('id', existing.id).select().single()
  }
  return supabase.from('agency_settings').insert(data).select().single()
}

// ─── Generic helper ──────────────────────────────────────────
export { isSupabaseConfigured }
