/**
 * Minimal row types for Supabase tables touched by the admin/client portal.
 * Fields are optional + permissive on purpose: this file's job is to remove
 * `any` from contexts and props without forcing a full schema migration.
 * Tighten field-by-field as downstream code starts depending on the types.
 */

export interface BaseRow {
  id: string
  created_at?: string
  updated_at?: string
}

export type ProjectChildRow = BaseRow & {
  project_id?: string
  [key: string]: any
}

export interface ProjectRow extends BaseRow {
  name?: string
  client_email?: string
  description?: string
  status?: string
  stage?: string
  progress?: number
  health?: string
  access_code?: string | null
  // Joined relations (present when fetched with nested select)
  milestones?: MilestoneRow[]
  payments?: PaymentRow[]
  approvals?: ApprovalRow[]
  gallery?: GalleryItemRow[]
  documents?: DocumentRow[]
  meetings?: MeetingRow[]
  deployments?: DeploymentRow[]
  activities?: ActivityRow[]
  announcements?: AnnouncementRow[]
  feedback?: FeedbackRow[]
  project_team?: ProjectTeamRow[]
  [key: string]: any
}

export type MilestoneRow = ProjectChildRow
export type PaymentRow = ProjectChildRow
export type ApprovalRow = ProjectChildRow
export type GalleryItemRow = ProjectChildRow
export type DocumentRow = ProjectChildRow
export type MeetingRow = ProjectChildRow
export type DeploymentRow = ProjectChildRow
export type ActivityRow = ProjectChildRow & { action_text?: string }
export type AnnouncementRow = ProjectChildRow
export type FeedbackRow = ProjectChildRow

export interface TeamMemberRow extends BaseRow {
  name?: string
  email?: string
  role?: string
  avatar_url?: string
  [key: string]: any
}

export interface ProjectTeamRow extends BaseRow {
  project_id?: string
  role_on_project?: string
  team_members?: TeamMemberRow | TeamMemberRow[] | null
}

export type AssignedTeamMember = TeamMemberRow & {
  assignment_id: string
  role_on_project?: string
}
