'use client'
import { useState } from 'react'
import {
  FileText, Key, Megaphone, CheckCircle2, Copy, Trash2, Mail, LucideIcon
} from 'lucide-react'
import { generateAccessCode, removeAccessCode, insertAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/lib/db'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'
import { ListBox, ListRow, Textarea, IconButton } from '@/components/admin/AdminUI'
import { Badge } from '@/components/portal/PortalUI'
import { useProject } from './layout'

const ANNOUNCEMENT_TONES = [
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'alert', label: 'Alert' },
]

const ANNOUNCEMENT_TONE_COLORS: Record<string, 'cyan' | 'emerald' | 'amber' | 'red'> = {
  info: 'cyan',
  success: 'emerald',
  warning: 'amber',
  alert: 'red',
}

interface Announcement {
  id: string
  title?: string
  body?: string
  tone?: string
  is_active?: boolean
  created_at?: string
}

function Section({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string
  icon: LucideIcon
  count?: number
  children: React.ReactNode
}) {
  return (
    <div className="cp-card p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <Icon className="w-4 h-4" style={{ color: 'var(--cp-text-faint)' }} />
        <h3 className="text-[13px] font-bold" style={{ color: 'var(--cp-text-secondary)' }}>{title}</h3>
        {count !== undefined && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md" style={{ background: 'var(--cp-bg-soft)', color: 'var(--cp-text-muted)' }}>
            {count}
          </span>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  full = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  full?: boolean
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? 'md:col-span-2' : ''}`}>
      <label className="text-[9px] font-mono uppercase tracking-[0.15em]" style={{ color: 'var(--cp-text-faint)' }}>{label}</label>
      {full ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none"
          style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)', color: 'var(--cp-text)' }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-[13px] outline-none"
          style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)', color: 'var(--cp-text)' }}
        />
      )}
    </div>
  )
}

export default function ProjectOverviewPage() {
  const {
    projectId,
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
    announcements,
    setAnnouncements,
  } = useProject()

  const [copiedCode, setCopiedCode] = useState(false)
  const [customCode, setCustomCode] = useState('')
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false)
  const [announcementSaving, setAnnouncementSaving] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', body: '', tone: 'info' })

  // Access Code functions
  async function handleGenerateCode() {
    const code = customCode.trim().toUpperCase() || Math.random().toString(36).substring(2, 10).toUpperCase()
    await generateAccessCode(projectId, code)
    setAccessCode(code)
    setCustomCode('')
  }

  async function handleRemoveCode() {
    await removeAccessCode(projectId)
    setAccessCode(null)
  }

  // Announcements functions
  async function handleAddAnnouncement() {
    if (!newAnnouncement.title) return
    setAnnouncementSaving(true)
    const { data } = await insertAnnouncement({
      project_id: projectId,
      title: newAnnouncement.title,
      body: newAnnouncement.body || undefined,
      tone: newAnnouncement.tone,
    })
    if (data) setAnnouncements([data, ...announcements])
    setNewAnnouncement({ title: '', body: '', tone: 'info' })
    setAnnouncementSaving(false)
    setAnnouncementModalOpen(false)
  }

  async function toggleAnnouncement(a: Announcement) {
    const ns = !a.is_active
    setAnnouncements(announcements.map(x => x.id === a.id ? { ...x, is_active: ns } : x))
    await updateAnnouncement(a.id, { is_active: ns })
  }

  async function handleDeleteAnnouncement(id: string) {
    await deleteAnnouncement(id)
    setAnnouncements(announcements.filter(x => x.id !== id))
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ─── PROJECT DETAILS ─── */}
      <Section title="Project Details" icon={FileText}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Project Name" value={name} onChange={setName} />
          <Field label="Client Email" value={clientEmail} onChange={setClientEmail} type="email" />
          <Field label="Description" value={description} onChange={setDescription} full />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono uppercase tracking-[0.15em]" style={{ color: 'var(--cp-text-faint)' }}>Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-[13px] outline-none [&>option]:bg-(--cp-bg-elevated) [&>option]:text-(--cp-text)"
              style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)', color: 'var(--cp-text)' }}
            >
              <option value="starting">Starting</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono uppercase tracking-[0.15em]" style={{ color: 'var(--cp-text-faint)' }}>Current Phase</label>
            <select
              value={stage}
              onChange={e => setStage(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-[13px] outline-none [&>option]:bg-(--cp-bg-elevated) [&>option]:text-(--cp-text)"
              style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)', color: 'var(--cp-text)' }}
            >
              <option value="Backlog">Backlog</option>
              <option value="Design">Design</option>
              <option value="Development">Development</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[9px] font-mono uppercase tracking-[0.15em]" style={{ color: 'var(--cp-text-faint)' }}>
              Progress ({progress}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={e => setProgress(Number(e.target.value))}
              className="w-full mt-1 cursor-pointer"
              style={{ accentColor: 'var(--cp-cyan)' }}
            />
          </div>
        </div>
      </Section>

      {/* ─── CLIENT ACCESS CODE ─── */}
      <Section title="Client Access Code" icon={Key}>
        {accessCode ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--cp-cyan-soft)', border: '1px solid var(--cp-cyan-border)' }}>
              <Key className="w-4 h-4 shrink-0" style={{ color: 'var(--cp-cyan)' }} />
              <span className="font-mono text-[15px] font-bold tracking-[0.2em]" style={{ color: 'var(--cp-cyan)' }}>{accessCode}</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(accessCode)
                setCopiedCode(true)
                setTimeout(() => setCopiedCode(false), 2000)
              }}
              className="p-3 rounded-xl transition-all hover:bg-(--cp-bg-soft) hover:text-(--cp-text) cursor-pointer"
              style={{ color: 'var(--cp-text-muted)' }}
            >
              {copiedCode ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--cp-emerald)' }} /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleRemoveCode}
              className="p-3 rounded-xl transition-all hover:text-(--cp-red) hover:bg-(--cp-red-soft) cursor-pointer"
              style={{ color: 'var(--cp-text-muted)' }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Custom code or leave blank"
              value={customCode}
              onChange={e => setCustomCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-3 rounded-xl text-[13px] font-mono tracking-widest outline-none placeholder:text-(--cp-text-faint)"
              style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)', color: 'var(--cp-text)' }}
            />
            <button onClick={handleGenerateCode} className="cp-btn-primary px-5 py-3 text-[12px] cursor-pointer">Generate</button>
          </div>
        )}
        <p className="text-[10px] mt-2" style={{ color: 'var(--cp-text-faint)' }}>
          Client enters this at <span className="font-mono" style={{ color: 'var(--cp-cyan)' }}>/client</span> to view their portal.
        </p>
      </Section>

      {/* ─── SEND-TO-CLIENT COMMUNICATIONS ─── */}
      <Section title="Send-to-Client Communications" icon={Mail}>
        <div className="flex flex-wrap gap-3">
          <a
            href={`mailto:${clientEmail}?subject=Welcome%20to%20Lyptron!&body=Hi%20there,%0D%0A%0D%0AHere%20are%20your%20project%20portal%20access%20details:%0D%0A%0D%0AAccess%20Code:%20${accessCode || '—'}%0D%0APortal%20Link:%20${typeof window !== 'undefined' ? window.location.origin : ''}/client/${accessCode || ''}/dashboard%0D%0A%0D%0AWelcome%20onboard!`}
            className="cp-btn-secondary px-4 py-2 text-[12px] flex items-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" /> Welcome Email
          </a>
          <a
            href={`mailto:${clientEmail}?subject=Your%20Lyptron%20Portal%20Access%20Code&body=Hi,%0D%0A%0D%0AHere%20is%20the%20access%20code%20for%20your%20project%20portal:%0D%0A%0D%0ACode:%20${accessCode || '—'}%0D%0ALink:%20${typeof window !== 'undefined' ? window.location.origin : ''}/client/${accessCode || ''}/dashboard`}
            className="cp-btn-secondary px-4 py-2 text-[12px] flex items-center gap-1.5 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" /> Send Access Code
          </a>
        </div>
      </Section>

      {/* ─── ANNOUNCEMENTS ─── */}
      <Section title="Announcements" icon={Megaphone} count={announcements.length}>
        <div className="flex flex-col gap-2">
          {announcements.length > 0 && (
            <ListBox>
              {announcements.map(a => (
                <ListRow key={a.id}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge tone={ANNOUNCEMENT_TONE_COLORS[a.tone] || 'cyan'}>{a.tone}</Badge>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-semibold truncate text-(--cp-text)">{a.title}</span>
                      {a.body && <span className="text-[11px] truncate text-(--cp-text-muted)">{a.body}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleAnnouncement(a)}
                      className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.1em] transition-colors cursor-pointer"
                      style={a.is_active ? { color: 'var(--cp-emerald)', background: 'var(--cp-emerald-soft)' } : { color: 'var(--cp-text-faint)', background: 'var(--cp-bg-soft)' }}
                    >
                      {a.is_active ? 'Active' : 'Hidden'}
                    </button>
                    <IconButton icon={Trash2} label="Delete announcement" variant="danger" onClick={() => handleDeleteAnnouncement(a.id)} />
                  </div>
                </ListRow>
              ))}
            </ListBox>
          )}
          <button
            onClick={() => {
              setNewAnnouncement({ title: '', body: '', tone: 'info' })
              setAnnouncementModalOpen(true)
            }}
            className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] transition-colors w-full justify-center cursor-pointer border border-dashed"
            style={{ color: 'var(--cp-text-faint)', borderColor: 'var(--cp-border)' }}
          >
            Add Announcement
          </button>
        </div>
      </Section>

      {/* New Announcement Modal */}
      <Modal open={announcementModalOpen} onClose={() => setAnnouncementModalOpen(false)} title="Add Announcement" subtitle="Surfaced in the client's dashboard feed.">
        <div className="flex flex-col gap-4">
          <ModalInput
            label="Title"
            value={newAnnouncement.title}
            onChange={v => setNewAnnouncement({ ...newAnnouncement, title: v })}
            placeholder="e.g. New milestone unlocked"
            required
          />
          <Textarea
            label="Message"
            value={newAnnouncement.body}
            onChange={e => setNewAnnouncement({ ...newAnnouncement, body: e.target.value })}
            placeholder="Optional details..."
            rows={3}
          />
          <ModalSelect
            label="Tone"
            value={newAnnouncement.tone}
            onChange={v => setNewAnnouncement({ ...newAnnouncement, tone: v })}
            options={ANNOUNCEMENT_TONES}
          />
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button onClick={() => setAnnouncementModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-(--cp-text-muted) hover:text-(--cp-text)">Cancel</button>
            <button onClick={handleAddAnnouncement} disabled={announcementSaving || !newAnnouncement.title} className="cp-btn-primary px-5 py-2 text-[12px] cursor-pointer">
              {announcementSaving ? 'Adding...' : 'Add Announcement'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
