'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Save, Trash2, Plus, CheckCircle2, Image as ImageIcon,
  FileText, Calendar, Zap, Users, GitCommit, Shield,
  Key, Copy, ExternalLink, ChevronDown, ChevronUp, X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  updateProject, deleteProject,
  insertMilestone, updateMilestone, deleteMilestone,
  insertPayment, updatePayment, deletePayment,
  insertApproval,
  insertGalleryImage,
  insertDocument,
  insertMeeting,
  insertDeployment,
  insertActivity,
  fetchTeamMembers, assignTeamMember, removeTeamFromProject,
  generateAccessCode, removeAccessCode,
} from '@/lib/db'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'

function generateRandomCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

// ─── Section wrapper ───
function Section({ title, icon: Icon, count, children, defaultOpen = true }: { title: string; icon: any; count?: number; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.01] transition-colors rounded-2xl">
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-white/25" />
          <h3 className="text-[13px] font-bold text-white/70">{title}</h3>
          {count !== undefined && <span className="text-[9px] font-mono bg-white/[0.06] text-white/30 px-1.5 py-0.5 rounded-md">{count}</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-white/[0.03] pt-4">{children}</div>}
    </div>
  )
}

// ─── Field helper ───
function Field({ label, value, onChange, type = 'text', full = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; full?: boolean }) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? 'md:col-span-2' : ''}`}>
      <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20">{label}</label>
      {full ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="px-3 py-2 rounded-xl text-[12px] text-white/70 outline-none resize-none" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', colorScheme: 'dark' }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} className="px-3 py-2 rounded-xl text-[12px] text-white/70 outline-none" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', colorScheme: 'dark' }} />
      )}
    </div>
  )
}

// ─── Modal footer helper ───
function ModalFooter({ saving, disabled, onCancel, onSave, label }: { saving: boolean; disabled: boolean; onCancel: () => void; onSave: () => void; label: string }) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.04]">
      <button onClick={onCancel} className="px-4 py-2 rounded-xl text-[12px] font-medium text-white/30 hover:text-white/60 transition-colors">Cancel</button>
      <button onClick={onSave} disabled={saving || disabled} className="px-5 py-2 bg-white text-[#050505] font-semibold text-[12px] rounded-xl hover:bg-white/90 transition-all disabled:opacity-30">
        {saving ? 'Saving...' : label}
      </button>
    </div>
  )
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Editable fields
  const [name, setName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('starting')
  const [progress, setProgress] = useState(0)

  // Related data
  const [milestones, setMilestones] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [approvals, setApprovals] = useState<any[]>([])
  const [gallery, setGallery] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [meetings, setMeetings] = useState<any[]>([])
  const [deployments, setDeployments] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [teamAssigned, setTeamAssigned] = useState<any[]>([])
  const [allTeamMembers, setAllTeamMembers] = useState<any[]>([])

  // Modals
  const [modalType, setModalType] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formSaving, setFormSaving] = useState(false)

  // Access code
  const [accessCode, setAccessCode] = useState<string | null>(null)
  const [customCode, setCustomCode] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)

  useEffect(() => { loadProject() }, [projectId])

  async function loadProject() {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*, milestones(*), payments(*), approvals(*), gallery(*), documents(*), meetings(*), deployments(*), activities(*), project_team(*, team_members(*))')
      .eq('id', projectId)
      .single()

    if (error || !data) { setLoading(false); return }

    setProject(data)
    setName(data.name || '')
    setClientEmail(data.client_email || '')
    setDescription(data.description || '')
    setStatus(data.status || 'starting')
    setProgress(data.progress || 0)
    setAccessCode(data.access_code || null)
    setMilestones(data.milestones || [])
    setPayments(data.payments || [])
    setApprovals(data.approvals || [])
    setGallery(data.gallery || [])
    setDocuments(data.documents || [])
    setMeetings(data.meetings || [])
    setDeployments(data.deployments || [])
    setActivities((data.activities || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    setTeamAssigned((data.project_team || []).map((pt: any) => ({ ...pt.team_members, assignment_id: pt.id, role_on_project: pt.role_on_project })))

    const { data: team } = await fetchTeamMembers()
    if (team) setAllTeamMembers(team)
    setLoading(false)
  }

  // ─── Save — only send columns that definitely exist ───
  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setSaveError('')
    const { error } = await updateProject(projectId, {
      name,
      client_email: clientEmail,
      description,
      status,
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

  // ─── Delete ───
  async function handleDelete() {
    if (!confirm('Are you sure? This will permanently delete this project and all its data.')) return
    setDeleting(true)
    await deleteProject(projectId)
    router.push('/admin/projects')
  }

  // ─── Generic modal add ───
  async function handleModalAdd() {
    setFormSaving(true)
    const f = formValues
    try {
      switch (modalType) {
        case 'milestone': {
          const { data } = await insertMilestone({ name: f.name, status: 'upcoming', project_id: projectId })
          if (data) setMilestones(prev => [...prev, data])
          break
        }
        case 'payment': {
          const { data } = await insertPayment({ amount: Number(f.amount), status: 'pending', project_id: projectId })
          if (data) setPayments(prev => [...prev, data])
          break
        }
        case 'approval': {
          const { data } = await insertApproval({ project_id: projectId, title: f.title, type: f.type || 'Design', description: f.description || '' })
          if (data) setApprovals(prev => [...prev, data])
          break
        }
        case 'gallery': {
          const { data } = await insertGalleryImage({ project_id: projectId, title: f.title, image_url: f.image_url, week_label: f.week_label || '' })
          if (data) setGallery(prev => [...prev, data])
          break
        }
        case 'document': {
          const { data } = await insertDocument({ project_id: projectId, title: f.title, type: f.type || 'PDF', file_url: f.file_url || '' })
          if (data) setDocuments(prev => [...prev, data])
          break
        }
        case 'meeting': {
          const { data } = await insertMeeting({ project_id: projectId, title: f.title, type: f.type || 'Video Call', meeting_date: f.meeting_date, meeting_time: f.meeting_time || '', link: f.link || '' })
          if (data) setMeetings(prev => [...prev, data])
          break
        }
        case 'deployment': {
          const { data } = await insertDeployment({ project_id: projectId, environment: f.environment || 'Production', version: f.version || '', status: f.dep_status || 'success', url: f.url || '' })
          if (data) setDeployments(prev => [...prev, data])
          break
        }
        case 'activity': {
          await insertActivity({ project_id: projectId, type: f.activity_type || 'milestone', actor_name: f.actor_name || 'Admin', action_text: f.action_text })
          setActivities(prev => [{ id: Date.now().toString(), type: f.activity_type, actor_name: f.actor_name || 'Admin', action_text: f.action_text, created_at: new Date().toISOString() }, ...prev])
          break
        }
      }
    } catch (err) { console.error(err) }
    setFormSaving(false)
    setFormValues({})
    setModalType(null)
  }

  // ─── Access code ───
  async function handleGenerateCode() {
    const code = customCode.trim().toUpperCase() || generateRandomCode()
    await generateAccessCode(projectId, code)
    setAccessCode(code)
    setCustomCode('')
  }

  async function handleRemoveCode() {
    await removeAccessCode(projectId)
    setAccessCode(null)
  }

  // ─── Team ───
  async function handleAssignTeam(memberId: string) {
    await assignTeamMember(projectId, memberId)
    await loadProject()
  }

  async function handleRemoveTeam(memberId: string) {
    await removeTeamFromProject(projectId, memberId)
    setTeamAssigned(prev => prev.filter(t => t.id !== memberId))
  }

  function setForm(key: string, value: string) {
    setFormValues(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <h2 className="text-white/50 font-bold text-lg mb-2">Project not found</h2>
        <Link href="/admin/projects" className="text-blue-400 text-[13px] hover:underline">Back to projects</Link>
      </div>
    )
  }

  const assignedIds = teamAssigned.map(t => t.id)
  const unassignedMembers = allTeamMembers.filter(m => !assignedIds.includes(m.id))

  return (
    <div className="min-h-0 pb-20">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 -mx-5 lg:-mx-8 px-5 lg:px-8 py-3 mb-4" style={{ background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/projects" className="p-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-white/90">{name || 'Untitled'}</h1>
              <p className="text-[10px] text-white/20 font-mono">{clientEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Saved</span>}
            {saveError && <span className="text-[11px] text-red-400 font-medium">{saveError}</span>}
            <button onClick={handleDelete} disabled={deleting} className="p-2 rounded-xl text-red-400/40 hover:text-red-400 hover:bg-red-500/[0.04] transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#050505] font-semibold text-[12px] rounded-xl hover:bg-white/90 transition-all disabled:opacity-30" style={{ boxShadow: '0 0 12px rgba(255,255,255,0.06)' }}>
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* All sections */}
      <div className="flex flex-col gap-4">
        {/* ─── PROJECT DETAILS ─── */}
        <Section title="Project Details" icon={FileText}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Project Name" value={name} onChange={setName} />
            <Field label="Client Email" value={clientEmail} onChange={setClientEmail} type="email" />
            <Field label="Description" value={description} onChange={setDescription} full />
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 rounded-xl text-[12px] text-white/70 outline-none [&>option]:bg-[#111] [&>option]:text-white/80" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', colorScheme: 'dark' }}>
                <option value="starting">Starting</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20">Progress ({progress}%)</label>
              <input type="range" min="0" max="100" value={progress} onChange={e => setProgress(Number(e.target.value))} className="w-full accent-white mt-1" style={{ colorScheme: 'dark' }} />
            </div>
          </div>
        </Section>

        {/* ─── ACCESS CODE ─── */}
        <Section title="Client Access Code" icon={Key}>
          {accessCode ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)' }}>
                <Key className="w-4 h-4 text-blue-400/60 shrink-0" />
                <span className="font-mono text-[15px] font-bold text-blue-400 tracking-[0.2em]">{accessCode}</span>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(accessCode); setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000) }} className="p-3 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all">
                {copiedCode ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button onClick={handleRemoveCode} className="p-3 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/[0.04] transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input type="text" placeholder="Custom code or leave blank" value={customCode} onChange={e => setCustomCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 rounded-xl text-[13px] text-white/80 font-mono tracking-widest outline-none"
                style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', colorScheme: 'dark' }} />
              <button onClick={handleGenerateCode} className="px-5 py-3 bg-white text-[#050505] font-semibold text-[12px] rounded-xl hover:bg-white/90 transition-all">Generate</button>
            </div>
          )}
          <p className="text-[10px] text-white/15 mt-2">Client enters this at <span className="font-mono text-blue-400/40">/client</span> to view their portal.</p>
        </Section>

        {/* ─── MILESTONES ─── */}
        <Section title="Milestones" icon={CheckCircle2} count={milestones.length}>
          <div className="flex flex-col gap-2">
            {milestones.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-2.5">
                  <button onClick={async () => { const ns = m.status === 'completed' ? 'upcoming' : 'completed'; setMilestones(milestones.map(x => x.id === m.id ? { ...x, status: ns } : x)); await updateMilestone(m.id, { status: ns }) }}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${m.status === 'completed' ? 'border-emerald-400 bg-emerald-500/20' : 'border-white/15 hover:border-white/30'}`}>
                    {m.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </button>
                  <span className={`text-[13px] ${m.status === 'completed' ? 'text-white/40 line-through' : 'text-white/70'}`}>{m.name || m.title}</span>
                </div>
                <button onClick={async () => { await deleteMilestone(m.id); setMilestones(milestones.filter(x => x.id !== m.id)) }} className="p-1.5 text-white/15 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button onClick={() => { setFormValues({}); setModalType('milestone') }} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-white/25 hover:text-white/50 hover:bg-white/[0.02] transition-colors border border-dashed border-white/[0.06]">
              <Plus className="w-3.5 h-3.5" /> Add Milestone
            </button>
          </div>
        </Section>

        {/* ─── PAYMENTS ─── */}
        <Section title="Payments" icon={Shield} count={payments.length}>
          <div className="flex flex-col gap-2">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-3">
                  <button onClick={async () => { const ns = p.status === 'paid' ? 'pending' : 'paid'; setPayments(payments.map(x => x.id === p.id ? { ...x, status: ns } : x)); await updatePayment(p.id, { status: ns }) }}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.1em] border transition-colors cursor-pointer ${p.status === 'paid' ? 'bg-emerald-500/[0.06] border-emerald-500/15 text-emerald-400' : 'bg-orange-500/[0.06] border-orange-500/15 text-orange-400'}`}>
                    {p.status}
                  </button>
                  <span className="text-[14px] font-mono text-white/70">₹{(p.amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <button onClick={async () => { await deletePayment(p.id); setPayments(payments.filter(x => x.id !== p.id)) }} className="p-1.5 text-white/15 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button onClick={() => { setFormValues({}); setModalType('payment') }} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-white/25 hover:text-white/50 hover:bg-white/[0.02] transition-colors border border-dashed border-white/[0.06]">
              <Plus className="w-3.5 h-3.5" /> Add Payment
            </button>
          </div>
        </Section>

        {/* ─── APPROVALS ─── */}
        <Section title="Approvals" icon={CheckCircle2} count={approvals.length} defaultOpen={false}>
          <div className="flex flex-col gap-2">
            {approvals.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-white/70">{a.title}</span>
                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.1em]">{a.type} • {a.status || 'pending'}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-[0.1em] border ${a.status === 'approved' ? 'bg-emerald-500/[0.06] border-emerald-500/15 text-emerald-400' : a.status === 'rejected' ? 'bg-red-500/[0.06] border-red-500/15 text-red-400' : 'bg-orange-500/[0.06] border-orange-500/15 text-orange-400'}`}>
                  {a.status || 'pending'}
                </span>
              </div>
            ))}
            <button onClick={() => { setFormValues({}); setModalType('approval') }} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-white/25 hover:text-white/50 hover:bg-white/[0.02] transition-colors border border-dashed border-white/[0.06]">
              <Plus className="w-3.5 h-3.5" /> Add Approval Request
            </button>
          </div>
        </Section>

        {/* ─── GALLERY ─── */}
        <Section title="Gallery" icon={ImageIcon} count={gallery.length} defaultOpen={false}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {gallery.map(g => (
              <div key={g.id} className="rounded-xl overflow-hidden aspect-video relative" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                {g.image_url ? <img src={g.image_url} alt={g.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-white/10" /></div>}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1"><span className="text-[10px] text-white/70 truncate block">{g.title}</span></div>
              </div>
            ))}
          </div>
          <button onClick={() => { setFormValues({}); setModalType('gallery') }} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-white/25 hover:text-white/50 hover:bg-white/[0.02] transition-colors border border-dashed border-white/[0.06] w-full justify-center">
            <Plus className="w-3.5 h-3.5" /> Add Image
          </button>
        </Section>

        {/* ─── DOCUMENTS ─── */}
        <Section title="Documents" icon={FileText} count={documents.length} defaultOpen={false}>
          <div className="flex flex-col gap-2">
            {documents.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-white/20" />
                  <div><span className="text-[13px] text-white/70 block">{d.title}</span><span className="text-[9px] font-mono text-white/20 uppercase">{d.type}</span></div>
                </div>
                {d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer" className="text-blue-400/50 hover:text-blue-400 transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>}
              </div>
            ))}
            <button onClick={() => { setFormValues({}); setModalType('document') }} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-white/25 hover:text-white/50 hover:bg-white/[0.02] transition-colors border border-dashed border-white/[0.06]">
              <Plus className="w-3.5 h-3.5" /> Add Document
            </button>
          </div>
        </Section>

        {/* ─── MEETINGS ─── */}
        <Section title="Meetings" icon={Calendar} count={meetings.length} defaultOpen={false}>
          <div className="flex flex-col gap-2">
            {meetings.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div><span className="text-[13px] text-white/70 block">{m.title}</span><span className="text-[10px] text-white/25">{m.meeting_date}{m.meeting_time && ` at ${m.meeting_time}`}</span></div>
                {m.link && <a href={m.link} target="_blank" rel="noreferrer" className="text-blue-400/50 hover:text-blue-400 text-[11px]">Join</a>}
              </div>
            ))}
            <button onClick={() => { setFormValues({}); setModalType('meeting') }} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-white/25 hover:text-white/50 hover:bg-white/[0.02] transition-colors border border-dashed border-white/[0.06]">
              <Plus className="w-3.5 h-3.5" /> Add Meeting
            </button>
          </div>
        </Section>

        {/* ─── DEPLOYMENTS ─── */}
        <Section title="Deployments" icon={Zap} count={deployments.length} defaultOpen={false}>
          <div className="flex flex-col gap-2">
            {deployments.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${d.status === 'success' ? 'bg-emerald-400' : d.status === 'failed' ? 'bg-red-400' : 'bg-blue-400 animate-pulse'}`} />
                  <div><span className="text-[13px] text-white/70 block">{d.environment}{d.version && ` v${d.version}`}</span>{d.url && <span className="text-[10px] text-blue-400/50 font-mono">{d.url}</span>}</div>
                </div>
                <span className={`text-[9px] font-mono uppercase ${d.status === 'success' ? 'text-emerald-400' : d.status === 'failed' ? 'text-red-400' : 'text-blue-400'}`}>{d.status}</span>
              </div>
            ))}
            <button onClick={() => { setFormValues({}); setModalType('deployment') }} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-white/25 hover:text-white/50 hover:bg-white/[0.02] transition-colors border border-dashed border-white/[0.06]">
              <Plus className="w-3.5 h-3.5" /> Add Deployment
            </button>
          </div>
        </Section>

        {/* ─── TEAM ─── */}
        <Section title="Team" icon={Users} count={teamAssigned.length} defaultOpen={false}>
          <div className="flex flex-col gap-2">
            {teamAssigned.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600/80 to-purple-600/80 flex items-center justify-center shrink-0"><span className="text-[9px] font-bold text-white">{m.initials}</span></div>
                  <div><span className="text-[13px] text-white/70 block">{m.name}</span><span className="text-[10px] text-white/25">{m.role}</span></div>
                </div>
                <button onClick={() => handleRemoveTeam(m.id)} className="p-1.5 text-white/15 hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
              </div>
            ))}
            {unassignedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {unassignedMembers.map(m => (
                  <button key={m.id} onClick={() => handleAssignTeam(m.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-colors border border-dashed border-white/[0.06]">
                    <Plus className="w-3 h-3" /> {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* ─── ACTIVITY LOG ─── */}
        <Section title="Activity Feed" icon={GitCommit} count={activities.length} defaultOpen={false}>
          <div className="flex flex-col gap-2">
            {activities.slice(0, 10).map((a, i) => (
              <div key={a.id || i} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1.5 shrink-0" />
                <div><span className="text-[13px] text-white/70 block">{a.action_text}</span><span className="text-[9px] font-mono text-white/20">{a.actor_name} • {a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span></div>
              </div>
            ))}
            <button onClick={() => { setFormValues({}); setModalType('activity') }} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-white/25 hover:text-white/50 hover:bg-white/[0.02] transition-colors border border-dashed border-white/[0.06]">
              <Plus className="w-3.5 h-3.5" /> Log Activity
            </button>
          </div>
        </Section>
      </div>

      {/* ─── ALL MODALS ─── */}
      <Modal open={modalType === 'milestone'} onClose={() => setModalType(null)} title="Add Milestone">
        <div className="flex flex-col gap-4">
          <ModalInput label="Milestone Name" value={formValues.name || ''} onChange={v => setForm('name', v)} placeholder="e.g. UI/UX Design Complete" required />
          <ModalFooter saving={formSaving} disabled={!formValues.name} onCancel={() => setModalType(null)} onSave={handleModalAdd} label="Add" />
        </div>
      </Modal>

      <Modal open={modalType === 'payment'} onClose={() => setModalType(null)} title="Add Payment">
        <div className="flex flex-col gap-4">
          <ModalInput label="Amount (₹)" value={formValues.amount || ''} onChange={v => setForm('amount', v)} placeholder="50000" type="number" required />
          <ModalFooter saving={formSaving} disabled={!formValues.amount} onCancel={() => setModalType(null)} onSave={handleModalAdd} label="Add" />
        </div>
      </Modal>

      <Modal open={modalType === 'approval'} onClose={() => setModalType(null)} title="Add Approval Request" subtitle="Client sees this under 'Needs Your Review'.">
        <div className="flex flex-col gap-4">
          <ModalInput label="Title" value={formValues.title || ''} onChange={v => setForm('title', v)} placeholder="e.g. Homepage Design v2" required />
          <ModalSelect label="Type" value={formValues.type || 'Design'} onChange={v => setForm('type', v)} options={[{ value: 'Design', label: 'Design' }, { value: 'Copy', label: 'Copy' }, { value: 'Feature', label: 'Feature' }, { value: 'Deployment', label: 'Deployment' }]} />
          <ModalInput label="Description" value={formValues.description || ''} onChange={v => setForm('description', v)} placeholder="Optional details..." />
          <ModalFooter saving={formSaving} disabled={!formValues.title} onCancel={() => setModalType(null)} onSave={handleModalAdd} label="Add" />
        </div>
      </Modal>

      <Modal open={modalType === 'gallery'} onClose={() => setModalType(null)} title="Add Gallery Image" subtitle="Client sees this in Gallery.">
        <div className="flex flex-col gap-4">
          <ModalInput label="Title" value={formValues.title || ''} onChange={v => setForm('title', v)} placeholder="Homepage Screenshot" required />
          <ModalInput label="Image URL" value={formValues.image_url || ''} onChange={v => setForm('image_url', v)} placeholder="https://..." required />
          <ModalInput label="Week Label" value={formValues.week_label || ''} onChange={v => setForm('week_label', v)} placeholder="Week 3" />
          <ModalFooter saving={formSaving} disabled={!formValues.title || !formValues.image_url} onCancel={() => setModalType(null)} onSave={handleModalAdd} label="Add" />
        </div>
      </Modal>

      <Modal open={modalType === 'document'} onClose={() => setModalType(null)} title="Add Document">
        <div className="flex flex-col gap-4">
          <ModalInput label="Title" value={formValues.title || ''} onChange={v => setForm('title', v)} placeholder="Brand Guidelines" required />
          <ModalSelect label="Type" value={formValues.type || 'PDF'} onChange={v => setForm('type', v)} options={[{ value: 'PDF', label: 'PDF' }, { value: 'Doc', label: 'Doc' }, { value: 'Spreadsheet', label: 'Spreadsheet' }, { value: 'Figma', label: 'Figma' }, { value: 'Link', label: 'Link' }]} />
          <ModalInput label="File URL" value={formValues.file_url || ''} onChange={v => setForm('file_url', v)} placeholder="https://..." />
          <ModalFooter saving={formSaving} disabled={!formValues.title} onCancel={() => setModalType(null)} onSave={handleModalAdd} label="Add" />
        </div>
      </Modal>

      <Modal open={modalType === 'meeting'} onClose={() => setModalType(null)} title="Add Meeting">
        <div className="flex flex-col gap-4">
          <ModalInput label="Title" value={formValues.title || ''} onChange={v => setForm('title', v)} placeholder="Weekly Standup" required />
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Date" value={formValues.meeting_date || ''} onChange={v => setForm('meeting_date', v)} type="date" required />
            <ModalInput label="Time" value={formValues.meeting_time || ''} onChange={v => setForm('meeting_time', v)} placeholder="3:00 PM" />
          </div>
          <ModalSelect label="Type" value={formValues.type || 'Video Call'} onChange={v => setForm('type', v)} options={[{ value: 'Video Call', label: 'Video Call' }, { value: 'In Person', label: 'In Person' }, { value: 'Phone Call', label: 'Phone Call' }]} />
          <ModalInput label="Meeting Link" value={formValues.link || ''} onChange={v => setForm('link', v)} placeholder="https://meet.google.com/..." />
          <ModalFooter saving={formSaving} disabled={!formValues.title || !formValues.meeting_date} onCancel={() => setModalType(null)} onSave={handleModalAdd} label="Add" />
        </div>
      </Modal>

      <Modal open={modalType === 'deployment'} onClose={() => setModalType(null)} title="Add Deployment">
        <div className="flex flex-col gap-4">
          <ModalSelect label="Environment" value={formValues.environment || 'Production'} onChange={v => setForm('environment', v)} options={[{ value: 'Production', label: 'Production' }, { value: 'Staging', label: 'Staging' }, { value: 'Preview', label: 'Preview' }]} />
          <ModalInput label="Version" value={formValues.version || ''} onChange={v => setForm('version', v)} placeholder="1.2.0" />
          <ModalSelect label="Status" value={formValues.dep_status || 'success'} onChange={v => setForm('dep_status', v)} options={[{ value: 'success', label: 'Success' }, { value: 'building', label: 'Building' }, { value: 'failed', label: 'Failed' }]} />
          <ModalInput label="URL" value={formValues.url || ''} onChange={v => setForm('url', v)} placeholder="https://myapp.vercel.app" />
          <ModalFooter saving={formSaving} disabled={false} onCancel={() => setModalType(null)} onSave={handleModalAdd} label="Add" />
        </div>
      </Modal>

      <Modal open={modalType === 'activity'} onClose={() => setModalType(null)} title="Log Activity" subtitle="Shows in client's activity feed.">
        <div className="flex flex-col gap-4">
          <ModalInput label="What happened?" value={formValues.action_text || ''} onChange={v => setForm('action_text', v)} placeholder="Deployed homepage update" required />
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Actor Name" value={formValues.actor_name || ''} onChange={v => setForm('actor_name', v)} placeholder="Arjun" />
            <ModalSelect label="Type" value={formValues.activity_type || 'milestone'} onChange={v => setForm('activity_type', v)} options={[{ value: 'milestone', label: 'Milestone' }, { value: 'commit', label: 'Commit' }, { value: 'deployment', label: 'Deployment' }, { value: 'approval', label: 'Approval' }]} />
          </div>
          <ModalFooter saving={formSaving} disabled={!formValues.action_text} onCancel={() => setModalType(null)} onSave={handleModalAdd} label="Log" />
        </div>
      </Modal>
    </div>
  )
}
