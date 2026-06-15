'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { updateProject, deleteProject, fetchTeamMembers } from '@/lib/db'
import Modal from '@/components/ui/Modal'

// Define Context
interface ProjectContextType {
  project: any
  loading: boolean
  loadProject: () => Promise<void>
  saving: boolean
  name: string
  setName: (n: string) => void
  clientEmail: string
  setClientEmail: (e: string) => void
  description: string
  setDescription: (d: string) => void
  status: string
  setStatus: (s: string) => void
  stage: string
  setStage: (s: string) => void
  progress: number
  setProgress: (p: number) => void
  accessCode: string | null
  setAccessCode: (c: string | null) => void
  saveProject: () => Promise<void>
  projectId: string
  teamAssigned: any[]
  setTeamAssigned: React.Dispatch<React.SetStateAction<any[]>>
  allTeamMembers: any[]
  milestones: any[]
  setMilestones: React.Dispatch<React.SetStateAction<any[]>>
  payments: any[]
  setPayments: React.Dispatch<React.SetStateAction<any[]>>
  approvals: any[]
  setApprovals: React.Dispatch<React.SetStateAction<any[]>>
  gallery: any[]
  setGallery: React.Dispatch<React.SetStateAction<any[]>>
  documents: any[]
  setDocuments: React.Dispatch<React.SetStateAction<any[]>>
  meetings: any[]
  setMeetings: React.Dispatch<React.SetStateAction<any[]>>
  deployments: any[]
  setDeployments: React.Dispatch<React.SetStateAction<any[]>>
  activities: any[]
  setActivities: React.Dispatch<React.SetStateAction<any[]>>
  announcements: any[]
  setAnnouncements: React.Dispatch<React.SetStateAction<any[]>>
  feedback: any[]
  setFeedback: React.Dispatch<React.SetStateAction<any[]>>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) throw new Error('useProject must be used within a ProjectProvider')
  return context
}

const TABS = (id: string) => [
  { name: 'Overview', path: `/admin/projects/${id}` },
  { name: 'Timeline', path: `/admin/projects/${id}/timeline` },
  { name: 'Documents', path: `/admin/projects/${id}/documents` },
  { name: 'Deliverables', path: `/admin/projects/${id}/deliverables` },
  { name: 'Gallery', path: `/admin/projects/${id}/gallery` },
  { name: 'Finance', path: `/admin/projects/${id}/finance` },
  { name: 'Meetings', path: `/admin/projects/${id}/meetings` },
  { name: 'Development', path: `/admin/projects/${id}/development` },
  { name: 'Team', path: `/admin/projects/${id}/team` },
  { name: 'Feedback', path: `/admin/projects/${id}/feedback` },
]

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const projectId = params.id as string

  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('starting')
  const [stage, setStage] = useState('Backlog')
  const [progress, setProgress] = useState(0)
  const [accessCode, setAccessCode] = useState<string | null>(null)

  // Related data lists
  const [milestones, setMilestones] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [approvals, setApprovals] = useState<any[]>([])
  const [gallery, setGallery] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [meetings, setMeetings] = useState<any[]>([])
  const [deployments, setDeployments] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [feedback, setFeedback] = useState<any[]>([])
  const [teamAssigned, setTeamAssigned] = useState<any[]>([])
  const [allTeamMembers, setAllTeamMembers] = useState<any[]>([])

  useEffect(() => {
    loadProject()
  }, [projectId])

  async function loadProject() {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*, milestones(*), payments(*), approvals(*), gallery(*), documents(*), meetings(*), deployments(*), activities(*), announcements(*), feedback(*), project_team(*, team_members(*))')
      .eq('id', projectId)
      .single()

    if (error || !data) {
      setLoading(false)
      return
    }

    setProject(data)
    setName(data.name || '')
    setClientEmail(data.client_email || '')
    setDescription(data.description || '')
    setStatus(data.status || 'starting')
    setStage(data.stage || 'Backlog')
    setProgress(data.progress || 0)
    setAccessCode(data.access_code || null)
    
    setMilestones(data.milestones || [])
    setPayments(data.payments || [])
    setApprovals(data.approvals || [])
    setGallery(data.gallery || [])
    setDocuments(data.documents || [])
    setMeetings(data.meetings || [])
    setDeployments(data.deployments || [])
    setFeedback(data.feedback || [])
    setActivities((data.activities || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    setAnnouncements((data.announcements || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    const members = (data.project_team || []).map((pt: any) => {
      const tm = Array.isArray(pt.team_members) ? pt.team_members[0] : pt.team_members
      return tm ? { ...tm, assignment_id: pt.id, role_on_project: pt.role_on_project } : null
    }).filter(Boolean)
    setTeamAssigned(members)

    const { data: team } = await fetchTeamMembers()
    if (team) setAllTeamMembers(team)
    setLoading(false)
  }

  async function saveProject() {
    setSaving(true)
    setSaved(false)
    setSaveError('')
    const { error } = await updateProject(projectId, {
      name,
      client_email: clientEmail,
      description,
      status,
      stage,
      progress,
    })
    if (error) {
      setSaveError('Save failed. Check console.')
      console.error('Save error:', error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteProject(projectId)
    router.push('/admin/projects')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-5 h-5 border-2 border-[var(--cp-border)] border-t-[var(--cp-text-muted)] rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <h2 className="font-bold text-lg mb-2" style={{ color: 'var(--cp-text-secondary)' }}>Project not found</h2>
        <Link href="/admin/projects" className="text-[13px] hover:underline" style={{ color: 'var(--cp-cyan)' }}>Back to projects</Link>
      </div>
    )
  }

  return (
    <ProjectContext.Provider
      value={{
        project,
        loading,
        loadProject,
        saving,
        name,
        setName,
        clientEmail,
        setClientEmail,
        description,
        setDescription,
        status,
        setStatus,
        stage,
        setStage,
        progress,
        setProgress,
        accessCode,
        setAccessCode,
        saveProject,
        projectId,
        teamAssigned,
        setTeamAssigned,
        allTeamMembers,
        milestones,
        setMilestones,
        payments,
        setPayments,
        approvals,
        setApprovals,
        gallery,
        setGallery,
        documents,
        setDocuments,
        meetings,
        setMeetings,
        deployments,
        setDeployments,
        activities,
        setActivities,
        announcements,
        setAnnouncements,
        feedback,
        setFeedback,
      }}
    >
      <div className="min-h-0 pb-20">
        {/* Sticky top bar */}
        <div
          className="sticky top-0 z-30 -mx-5 lg:-mx-8 px-5 lg:px-8 py-3 mb-4"
          style={{
            background: 'color-mix(in srgb, var(--cp-bg-elevated) 80%, transparent)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--cp-border-soft)',
          }}
        >
          <div className="max-w-[1400px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin/projects" className="p-2 rounded-xl transition-colors hover:bg-[var(--cp-bg-soft)]" style={{ color: 'var(--cp-text-muted)' }}>
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="font-display text-lg font-bold tracking-tight text-[var(--cp-text)]">{name || 'Untitled'}</h1>
                <p className="text-[10px] font-mono text-[var(--cp-text-faint)]">{clientEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saved && (
                <span className="text-[11px] font-medium flex items-center gap-1 text-[var(--cp-emerald)]">
                  <CheckCircle2 className="w-3 h-3" /> Saved
                </span>
              )}
              {saveError && <span className="text-[11px] font-medium text-[var(--cp-red)]">{saveError}</span>}
              <button
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={deleting}
                className="p-2 rounded-xl transition-colors hover:text-[var(--cp-red)] hover:bg-[var(--cp-red-soft)] cursor-pointer"
                style={{ color: 'var(--cp-text-faint)' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={saveProject} disabled={saving} className="cp-btn-primary flex items-center gap-1.5 px-4 py-2 text-[12px] cursor-pointer">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-[var(--cp-border-soft)] mb-6 overflow-x-auto pb-px no-scrollbar">
          {TABS(projectId).map((tab) => {
            const isActive = pathname === tab.path
            return (
              <Link key={tab.name} href={tab.path}>
                <div
                  className={`px-4 py-2 text-[12.5px] font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-[var(--cp-cyan)] text-[var(--cp-cyan)]'
                      : 'border-transparent text-[var(--cp-text-muted)] hover:text-[var(--cp-text)]'
                  }`}
                >
                  {tab.name}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Sub-page Render children */}
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} title="Delete Project" width="max-w-md">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--cp-red-soft)', border: '1px solid var(--cp-red-border)' }}>
            <AlertTriangle className="w-6 h-6" style={{ color: 'var(--cp-red)' }} />
          </div>
          <div>
            <p className="text-[14px] font-semibold" style={{ color: 'var(--cp-text)' }}>Are you sure you want to delete</p>
            <p className="text-[15px] font-bold mt-1" style={{ color: 'var(--cp-red)' }}>&quot;{name}&quot;</p>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--cp-text-muted)' }}>
            This will permanently remove the project and all its data — milestones, payments, documents, team assignments, and client portal access. This action cannot be undone.
          </p>
          <div className="flex items-center gap-3 w-full pt-2 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button
              onClick={() => setConfirmDeleteOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl text-[12.5px] font-semibold transition-colors cursor-pointer"
              style={{ color: 'var(--cp-text-muted)', background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)' }}
            >
              Cancel
            </button>
            <button
              onClick={() => { setConfirmDeleteOpen(false); handleDelete() }}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer disabled:opacity-50"
              style={{ background: 'var(--cp-red)', color: '#fff', boxShadow: '0 0 16px color-mix(in srgb, var(--cp-red) 30%, transparent)' }}
            >
              {deleting ? 'Deleting…' : 'Delete Project'}
            </button>
          </div>
        </div>
      </Modal>
    </ProjectContext.Provider>
  )
}
