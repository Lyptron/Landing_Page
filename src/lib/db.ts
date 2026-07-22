import { supabase, isSupabaseConfigured } from './supabase'
import type { ProjectRow } from './db-types'

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
    .select('*, milestones(*)')
    .order('created_at', { ascending: false })
}

// Routes through a SECURITY DEFINER RPC that verifies the access code
// server-side and returns the project plus every related table the client
// portal needs — direct SELECT on these tables is admin-only (see
// supabase-schema.sql PHASE F), so this is the only way the anon key can
// read a client's project data.
export async function fetchProjectByAccessCode(code: string) {
  const { data, error } = await supabase.rpc('get_client_project_bundle', { p_code: code })
  return { data: data as ProjectRow | null, error }
}

export async function fetchProjectsKanban() {
  return supabase
    .from('projects')
    .select('*, project_team(team_member_id, team_members(initials)), clients(id, company, email)')
    .order('created_at', { ascending: false })
}

export async function insertProject(data: {
  name: string
  client_id?: string | null
  client_email?: string
  client_name?: string
  status?: string
  progress?: number
  description?: string
  access_code?: string
  stage?: string
}) {
  return supabase.from('projects').insert(data).select('*, clients(id, company, email)').single()
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
  owner?: string
  priority?: string
  quality_score?: number
  next_followup_at?: string
  sla_due_at?: string
}) {
  return supabase.from('leads').insert({ stage: 'New', ...data }).select().single()
}

export async function updateLead(id: string, data: Record<string, unknown>) {
  return supabase.from('leads').update(data).eq('id', id)
}

// ─── Invoices ────────────────────────────────────────────────
export async function fetchInvoices() {
  return supabase.from('invoices').select('*, projects(id, name)').order('created_at', { ascending: false })
}

export async function insertInvoice(data: {
  invoice_number: string
  client_name: string
  amount: number
  status?: string
  issued_date?: string
  due_date?: string
  reason?: string
  project_id?: string
}) {
  return supabase.from('invoices').insert(data).select('*, projects(id, name)').single()
}

export async function deleteInvoice(id: string) {
  return supabase.from('invoices').delete().eq('id', id)
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

export async function fetchPendingApprovals() {
  return supabase
    .from('approvals')
    .select('*, projects(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
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

// Client-portal write. Verifies p_code server-side and resolves
// project_id there — the caller cannot spoof project_id or bypass the
// code. See submit_client_feedback SECURITY DEFINER RPC.
export async function submitClientFeedback(args: {
  code: string
  type: string
  title: string
  description?: string
}) {
  return supabase.rpc('submit_client_feedback', {
    p_code: args.code,
    p_type: args.type,
    p_title: args.title,
    p_description: args.description ?? null,
  })
}

// Client-portal write. Same pattern — code-authenticated RPC that
// resolves project_id server-side after upload to Storage.
export async function submitClientGalleryItem(args: {
  code: string
  title: string
  image_url: string
  week_label?: string
}) {
  return supabase.rpc('submit_client_gallery_item', {
    p_code: args.code,
    p_title: args.title,
    p_image_url: args.image_url,
    p_week_label: args.week_label ?? null,
  })
}

// Client-portal write. Approvals UPDATE is admin-only at the RLS
// layer; the client goes through this RPC which verifies the code
// AND that the approval belongs to the code's project.
export async function updateClientApproval(args: {
  code: string
  approvalId: string
  status: 'approved' | 'rejected'
}) {
  return supabase.rpc('update_client_approval', {
    p_code: args.code,
    p_approval_id: args.approvalId,
    p_status: args.status,
  })
}

// ─── Gallery ─────────────────────────────────────────────────
export async function fetchGallery(projectId: string) {
  return supabase.from('gallery').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
}

// ─── Announcements ───────────────────────────────────────────
export async function fetchAnnouncements(projectId: string) {
  return supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .or(`project_id.eq.${projectId},project_id.is.null`)
    .order('created_at', { ascending: false })
}

export async function fetchProjectAnnouncements(projectId: string) {
  return supabase.from('announcements').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
}

export async function insertAnnouncement(data: {
  project_id: string
  title: string
  body?: string
  tone?: string
}) {
  return supabase.from('announcements').insert(data).select().single()
}

export async function updateAnnouncement(id: string, data: Record<string, unknown>) {
  return supabase.from('announcements').update(data).eq('id', id)
}

export async function deleteAnnouncement(id: string) {
  return supabase.from('announcements').delete().eq('id', id)
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
    .select('id, name, client_name, client_email, access_code, status, stage, progress, created_at')
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

export async function fetchAllPayments() {
  return supabase
    .from('payments')
    .select('*, projects(id, name, client_email, clients(id, company, contact))')
    .order('created_at', { ascending: false })
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
  category?: 'onboarding' | 'deliverable' | 'general'
}) {
  return supabase.from('documents').insert(data).select().single()
}

// ─── Meetings CRUD ───────────────────────────────────────────
// `medium` is the physical medium (Video Call / In Person / Phone Call)
// and is what the admin form actually collects. `type` remains as the
// legacy upcoming/past bucket column with a default of 'upcoming'; the
// client portal derives upcoming/past from meeting_date, so callers
// should generally leave `type` unset.
export async function insertMeeting(data: {
  project_id: string
  title: string
  medium?: 'Video Call' | 'In Person' | 'Phone Call'
  type?: 'upcoming' | 'past'
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

// ─── Upload validation ──────────────────────────────────────
// Client-side gate before hitting Supabase Storage. Advisory only —
// real enforcement is the bucket policy (MIME allowlist + size cap
// configured in the Supabase Dashboard). But this catches the honest
// mistakes (wrong file picked, oversized screenshot) with a clear
// message, and blocks the two upload paths from accepting arbitrary
// content-types (e.g. SVG, which is a stored-XSS vector) even when
// the bucket policy is misconfigured.
//
// Allowlist is raster-only: SVG is *deliberately* excluded — it can
// carry embedded scripts and, because getPublicUrl returns a
// same-origin (per Supabase) URL, a rendered SVG would execute JS
// against that origin. If SVG support is ever needed, it must be
// served with Content-Disposition: attachment and never rendered.
export const ALLOWED_IMAGE_MIME: ReadonlySet<string> = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
])
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10 MB

const EXT_FOR_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

function validateImageUpload(file: File): { error: Error | null; ext: string } {
  if (!ALLOWED_IMAGE_MIME.has(file.type)) {
    return {
      error: new Error(
        `Unsupported file type: ${file.type || 'unknown'}. Use PNG, JPEG, or WebP.`
      ),
      ext: '',
    }
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const shownMB = (file.size / 1024 / 1024).toFixed(1)
    const maxMB = MAX_UPLOAD_BYTES / 1024 / 1024
    return {
      error: new Error(`File too large: ${shownMB}MB. Maximum is ${maxMB}MB.`),
      ext: '',
    }
  }
  return { error: null, ext: EXT_FOR_MIME[file.type] }
}

// ─── Logo / Storage ─────────────────────────────────────────
export async function uploadLogo(file: File) {
  const { error: validationError, ext } = validateImageUpload(file)
  if (validationError) return { data: null, error: validationError }
  // Extension derived from MIME (not the user-supplied filename) so
  // an .exe.png trick can't leave a stale extension on the object.
  const path = `agency-logo.${ext}`
  // Upload to 'logos' bucket (must be created in Supabase Dashboard → Storage)
  const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true, cacheControl: '0' })
  if (error) return { data: null, error }
  const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path)
  // Add cache-busting timestamp so the browser always loads the fresh logo
  const bustUrl = `${urlData.publicUrl}?t=${Date.now()}`
  return { data: bustUrl, error: null }
}

// Shared by admin + client gallery upload UI. Uploads to the 'project-gallery'
// bucket (must be created in Supabase Dashboard → Storage, public, with an
// insert policy scoped to authenticated admins and anon client-portal writes)
// under a per-project folder so files from different projects never collide.
export async function uploadGalleryImage(file: File, projectId: string) {
  const { error: validationError, ext } = validateImageUpload(file)
  if (validationError) return { data: null, error: validationError }
  // projectId comes from a UUID column via useProject / useClientPortalProject;
  // reject anything that doesn't look like a UUID as a belt-and-braces guard
  // against path traversal into a sibling project's folder.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)) {
    return { data: null, error: new Error('Invalid project id.') }
  }
  const path = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('project-gallery').upload(path, file, { cacheControl: '3600' })
  if (error) return { data: null, error }
  const { data: urlData } = supabase.storage.from('project-gallery').getPublicUrl(path)
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

// ─── Subscriptions (Founder-only business tool/expense tracker) ─
export async function fetchSubscriptions() {
  return supabase.from('subscriptions').select('*').order('renewal_date', { ascending: true })
}

export async function insertSubscription(data: {
  name: string
  category?: string
  monthly_cost?: number
  yearly_cost?: number
  billing_cycle?: string
  renewal_date?: string
  owner?: string
  status?: string
  priority?: string
  notes?: string
}) {
  return supabase.from('subscriptions').insert(data).select().single()
}

export async function updateSubscription(id: string, data: Record<string, unknown>) {
  return supabase.from('subscriptions').update(data).eq('id', id)
}

export async function deleteSubscription(id: string) {
  return supabase.from('subscriptions').delete().eq('id', id)
}

// ─── Tasks (general ops/admin tasks) ─────────────────────────
export async function fetchTasks() {
  return supabase.from('tasks').select('*').order('due_date', { ascending: true })
}

export async function insertTask(data: {
  title: string
  description?: string
  type?: string
  related_client_id?: string
  related_lead_id?: string
  assignee?: string
  due_date?: string
  status?: string
  priority?: string
  sla_due_at?: string
}) {
  return supabase.from('tasks').insert(data).select().single()
}

export async function updateTask(id: string, data: Record<string, unknown>) {
  return supabase.from('tasks').update(data).eq('id', id)
}

export async function deleteTask(id: string) {
  return supabase.from('tasks').delete().eq('id', id)
}

// ─── Expenses (Founder-only) ─────────────────────────────────
export async function fetchExpenses() {
  return supabase.from('expenses').select('*, subscriptions(name)').order('expense_date', { ascending: false })
}

export async function insertExpense(data: {
  label: string;
  category?: string;
  amount: number;
  expense_date: string;
  subscription_id?: string;
  notes?: string;
}) {
  return supabase.from('expenses').insert(data).select('*, subscriptions(name)').single()
}

export async function deleteExpense(id: string) {
  return supabase.from('expenses').delete().eq('id', id)
}

// ─── Campaigns (Marketing) ───────────────────────────────────
export async function fetchCampaigns() {
  return supabase.from('campaigns').select('*').order('created_at', { ascending: false })
}

export async function insertCampaign(data: {
  name: string
  channel?: string
  status?: string
  budget?: number
  leads_generated?: number
  conversion_rate?: number
  start_date?: string
  end_date?: string
}) {
  return supabase.from('campaigns').insert(data).select().single()
}

export async function updateCampaign(id: string, data: Record<string, unknown>) {
  return supabase.from('campaigns').update(data).eq('id', id)
}

export async function deleteCampaign(id: string) {
  return supabase.from('campaigns').delete().eq('id', id)
}

// ─── Marketing Tasks (content calendar) ──────────────────────
export async function fetchMarketingTasks() {
  return supabase.from('marketing_tasks').select('*, campaigns(name)').order('due_date', { ascending: true })
}

export async function insertMarketingTask(data: {
  title: string
  platform?: string
  status?: string
  owner?: string
  due_date?: string
  campaign_id?: string
}) {
  return supabase.from('marketing_tasks').insert(data).select().single()
}

export async function updateMarketingTask(id: string, data: Record<string, unknown>) {
  return supabase.from('marketing_tasks').update(data).eq('id', id)
}

export async function deleteMarketingTask(id: string) {
  return supabase.from('marketing_tasks').delete().eq('id', id)
}

// ─── Team Hierarchy ───────────────────────────────────────────
export async function fetchTeamHierarchy() {
  return supabase
    .from('team_members')
    .select('*, manager:manager_id(id, name, initials), project_team(id, project_id, projects(id, name))')
    .eq('is_active', true)
    .order('department', { ascending: true })
}

export async function fetchMemberProjects(teamMemberId: string) {
  return supabase
    .from('project_team')
    .select('*, projects(id, name, status, stage)')
    .eq('team_member_id', teamMemberId)
}

// ─── Roadmap / Hiring Plan (Founder-only) ────────────────────
export async function fetchRoadmapItems() {
  return supabase.from('roadmap_items').select('*').order('created_at', { ascending: true })
}

export async function insertRoadmapItem(data: {
  type?: string
  title: string
  description?: string
  status?: string
  target_quarter?: string
  department?: string
}) {
  return supabase.from('roadmap_items').insert(data).select().single()
}

export async function updateRoadmapItem(id: string, data: Record<string, unknown>) {
  return supabase.from('roadmap_items').update(data).eq('id', id)
}

export async function deleteRoadmapItem(id: string) {
  return supabase.from('roadmap_items').delete().eq('id', id)
}

// ─── Admin Users (Role & Permission Management) ──────────────
export async function fetchAdminUsers() {
  return supabase.from('admin_users').select('*').order('created_at', { ascending: true })
}

export async function insertAdminUser(data: { email: string; role: string }) {
  return supabase.from('admin_users').insert(data).select().single()
}

export async function updateAdminUserRole(id: string, role: string) {
  return supabase.from('admin_users').update({ role }).eq('id', id)
}

export async function deleteAdminUser(id: string) {
  return supabase.from('admin_users').delete().eq('id', id)
}

// ─── Project Data Reset (Client Portal Settings) ─────────────
// Deletes every payment/invoice for this project. Used by the
// "Reset finance" danger action in the client portal.
export async function resetProjectFinance(projectId: string) {
  const invoiceResult = await supabase.from('invoices').delete().eq('project_id', projectId)
  if (invoiceResult.error) return invoiceResult
  return supabase.from('payments').delete().eq('project_id', projectId)
}

// Wipes every row tied to this project across all per-project
// tables. The project row itself stays — only its contents are
// cleared. Used by the "Reset all data" danger action.
export async function resetAllProjectData(projectId: string) {
  return supabase.rpc('reset_project_data', { p_project_id: projectId })
}

// ─── Client-level reset/delete (admin Clients page) ──────────
// Resets every payment row tied to any project owned by this
// client. Projects, milestones, documents, etc. are untouched.
export async function resetClientFinance(clientId: string) {
  const { data: clientProjects, error: projErr } = await supabase
    .from('projects')
    .select('id')
    .eq('client_id', clientId)
  if (projErr) return { error: projErr }
  const projectIds = (clientProjects ?? []).map((p) => p.id)
  if (projectIds.length === 0) return { error: null }
  const invoiceResult = await supabase.from('invoices').delete().in('project_id', projectIds)
  if (invoiceResult.error) return invoiceResult
  return supabase.from('payments').delete().in('project_id', projectIds)
}

// Wipes every per-project row (payments, milestones, documents,
// meetings, etc.) for every project this client owns. Projects
// themselves and the client record stay intact.
export async function resetAllClientData(clientId: string) {
  return supabase.rpc('reset_client_data', { p_client_id: clientId })
}

// ─── Agency-wide Danger Zone ─────────────────────────────────
//
// These wipe-the-database operations now route through
// /api/admin/danger (see src/app/api/admin/danger/route.ts). The
// endpoint verifies the caller's JWT, checks the admin_users role
// table, and performs the destructive work with the service-role key
// — so the browser anon key can never trigger these directly even if
// RLS is misconfigured.

type DangerAction =
  | { type: 'reset_all_finance' }
  | { type: 'reset_all_projects_data' }
  | { type: 'reset_all_leads' }
  | { type: 'factory_reset_agency' }
  | { type: 'delete_client_cascade'; clientId: string }

async function callDangerEndpoint(action: DangerAction): Promise<{ error: unknown }> {
  const { data: { session }, error: sessionErr } = await supabase.auth.getSession()
  if (sessionErr || !session?.access_token) {
    return { error: 'Not signed in' }
  }
  try {
    const res = await fetch('/api/admin/danger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(action),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }))
      return { error: body.error || res.statusText }
    }
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Network error' }
  }
}

// Hard-deletes the client, every project they own, and every row in any
// per-project table tied to those projects. Runs client-side under the
// founder/admin session (RLS gates it): delete the client's projects first —
// every per-project child table FKs with `on delete cascade`, so Postgres
// wipes milestones/payments/invoices/approvals/activities/deployments/
// documents/meetings/feedback/gallery/project_team/announcements
// automatically — then delete the client row itself.
export async function deleteClientCascade(clientId: string): Promise<{ error: unknown }> {
  return callDangerEndpoint({ type: 'delete_client_cascade', clientId })
}

// Deletes every finance row across the entire agency.
export async function resetAllFinance() {
  return callDangerEndpoint({ type: 'reset_all_finance' })
}

// Wipes every per-project record across the agency. Projects and
// clients stay; everything attached to projects goes.
export async function resetAllProjectsData() {
  return callDangerEndpoint({ type: 'reset_all_projects_data' })
}

// Nukes inquiries + leads (lead funnel reset). Useful when seeded
// or test data is polluting the CRM.
export async function resetAllLeads() {
  return callDangerEndpoint({ type: 'reset_all_leads' })
}

// Factory reset — clients, projects, every per-project child
// table, plus leads/inquiries. Keeps admin_users, agency_settings,
// team_members. The "scorched-earth" option.
export async function factoryResetAgency() {
  return callDangerEndpoint({ type: 'factory_reset_agency' })
}

// ─── Generic helper ──────────────────────────────────────────
export { isSupabaseConfigured }
