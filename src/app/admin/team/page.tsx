'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Mail, Users2, Briefcase, UserCog, FolderKanban, Building2 } from 'lucide-react'
import { fetchTeamHierarchy, fetchMemberProjects, insertTeamMember, updateTeamMember } from '@/lib/db'
import { useAdminAuth } from '@/lib/AdminAuthContext'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'

const emptyForm = { name: '', initials: '', email: '', role: '', title: '', department: '' }

const deriveInitials = (name: string) => {
  return name
    .trim()
    .split(/\s+/)
    .map(w => w[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function TeamHierarchyPage() {
  const { user } = useAdminAuth()
  const isFounder = user?.role === 'founder'
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [memberProjects, setMemberProjects] = useState<any[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  // Inline edit state for the selected member
  const [editForm, setEditForm] = useState({ name: '', initials: '', email: '', accent_color: '', title: '', department: '', role: '', manager_id: '' })
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await fetchTeamHierarchy()
      if (!error && data) setMembers(data)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    async function loadMemberDetails() {
      if (!selected) { setMemberProjects([]); return }
      setEditForm({
        name: selected.name || '',
        initials: selected.initials || '',
        email: selected.email || '',
        accent_color: selected.accent_color || '#ffffff',
        title: selected.title || '',
        department: selected.department || '',
        role: selected.role || '',
        manager_id: selected.manager_id || '',
      })
      const { data, error } = await fetchMemberProjects(selected.id)
      if (!error && data) setMemberProjects(data)
    }
    loadMemberDetails()
  }, [selected])

  const grouped = members.reduce((acc: Record<string, any[]>, m) => {
    let dept = m.department
    if (!dept) {
      const assignedProjects = (m.project_team || []).map((pt: any) => {
        const proj = Array.isArray(pt.projects) ? pt.projects[0] : pt.projects
        return proj?.name
      }).filter(Boolean)
      if (assignedProjects.length > 0) {
        dept = `Project: ${assignedProjects.join(', ')}`
      } else {
        dept = 'Unassigned'
      }
    }
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(m)
    return acc
  }, {})

  const directReports = (id: string) => members.filter(m => m.manager_id === id)

  async function handleAdd() {
    if (!form.name || !form.initials || !form.role) return
    setSaving(true)
    const { data } = await insertTeamMember({
      name: form.name,
      initials: form.initials,
      role: form.role,
      email: form.email || undefined,
    })
    if (data) {
      const enriched = { ...data, title: form.title || null, department: form.department || null }
      if (form.title || form.department) {
        await updateTeamMember(data.id, { title: form.title || undefined, department: form.department || undefined })
      }
      setMembers([...members, enriched])
    }
    setForm(emptyForm)
    setSaving(false)
    setModalOpen(false)
  }

  async function handleEditSave() {
    if (!selected || !editForm.name || !editForm.initials || !editForm.role) return
    setEditSaving(true)
    const payload = {
      name: editForm.name,
      initials: editForm.initials,
      email: editForm.email || null,
      accent_color: editForm.accent_color || '#ffffff',
      title: editForm.title || null,
      department: editForm.department || null,
      role: editForm.role,
      manager_id: editForm.manager_id || null,
    }
    await updateTeamMember(selected.id, payload)
    const updated = { ...selected, ...payload, manager: members.find(m => m.id === editForm.manager_id) || null }
    setMembers(members.map(m => m.id === selected.id ? updated : m))
    setSelected(updated)
    setEditSaving(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--cp-text)' }}>Team Hierarchy</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--cp-text-faint)' }}>Departments, reporting lines, and project assignments.</p>
        </div>
        {isFounder && (
          <button onClick={() => setModalOpen(true)} className="cp-btn-primary flex items-center gap-1.5 px-4 py-2 text-[12px]">
            <Plus className="w-3.5 h-3.5" /> New Team Member
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[var(--cp-border)] border-t-[var(--cp-text-muted)] rounded-full animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Users2 className="w-10 h-10 mb-3" style={{ color: 'var(--cp-text-faint)' }} />
          <h3 className="font-bold mb-1" style={{ color: 'var(--cp-text-secondary)' }}>No team members yet</h3>
          <p className="text-[13px]" style={{ color: 'var(--cp-text-faint)' }}>Team members added to the agency will appear here.</p>
        </div>
      ) : (
        <div className={`flex-1 overflow-y-auto custom-scrollbar pr-1 transition-all duration-300 ${selected ? 'lg:pr-[380px]' : ''}`}>
          <div className="flex flex-col gap-6">
            {Object.entries(grouped).map(([dept, list]) => (
              <div key={dept}>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--cp-text-faint)' }} />
                  <h3 className="text-[11px] font-mono uppercase tracking-[0.15em]" style={{ color: 'var(--cp-text-muted)' }}>{dept}</h3>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md" style={{ background: 'var(--cp-bg-soft)', color: 'var(--cp-text-muted)', border: '1px solid var(--cp-border-soft)' }}>{list.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {list.map((m) => (
                    <motion.div
                      key={m.id}
                      onClick={() => setSelected(m)}
                      whileHover={{ borderColor: 'var(--cp-cyan-border)' }}
                      className="p-4 rounded-2xl cursor-pointer transition-all"
                      style={{ background: selected?.id === m.id ? 'var(--cp-cyan-soft)' : 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${m.accent_color || 'var(--cp-cyan)'} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${m.accent_color || 'var(--cp-cyan)'} 19%, transparent)` }}>
                          <span className="text-[12px] font-bold" style={{ color: m.accent_color || 'var(--cp-cyan)' }}>{m.initials}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold truncate" style={{ color: 'var(--cp-text)' }}>{m.name}</p>
                          <p className="text-[11px] truncate" style={{ color: 'var(--cp-text-muted)' }}>{m.title || m.role}</p>
                        </div>
                      </div>
                      {m.manager && (
                        <p className="text-[10px] truncate" style={{ color: 'var(--cp-text-faint)' }}>Reports to {m.manager.name}</p>
                      )}
                      {m.project_team && m.project_team.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-[var(--cp-border-soft)]">
                          {m.project_team.map((pt: any) => {
                            const proj = Array.isArray(pt.projects) ? pt.projects[0] : pt.projects
                            if (!proj) return null
                            return (
                              <span
                                key={pt.id}
                                className="text-[9px] font-mono px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                                style={{
                                  background: 'var(--cp-bg-soft)',
                                  color: 'var(--cp-text-muted)',
                                  border: '1px solid var(--cp-border-soft)'
                                }}
                              >
                                {proj.name}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Slide-out */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="absolute top-0 right-0 bottom-0 w-full sm:w-[380px] flex flex-col z-20"
            style={{ background: 'var(--cp-surface)', borderLeft: '1px solid var(--cp-border-soft)', boxShadow: '-8px 0 24px rgba(0,0,0,0.06)' }}
          >
            <div className="p-5 border-b flex items-start justify-between" style={{ borderColor: 'var(--cp-border-soft)' }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${selected.accent_color || 'var(--cp-cyan)'} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${selected.accent_color || 'var(--cp-cyan)'} 19%, transparent)` }}>
                  <span className="font-display font-bold text-lg" style={{ color: selected.accent_color || 'var(--cp-cyan)' }}>{selected.initials}</span>
                </div>
                <div>
                  <h2 className="text-[16px] font-bold" style={{ color: 'var(--cp-text)' }}>{selected.name}</h2>
                  <p className="text-[11px]" style={{ color: 'var(--cp-text-muted)' }}>{selected.title || selected.role}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg transition-colors text-[var(--cp-text-muted)] hover:text-[var(--cp-text)] hover:bg-[var(--cp-bg-soft)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--cp-text-faint)' }}>Profile</p>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5 text-[12px]">
                    <UserCog className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cp-text-faint)' }} />
                    <span style={{ color: 'var(--cp-text-secondary)' }}>{selected.role}</span>
                  </div>
                  {selected.email && (
                    <div className="flex items-center gap-2.5 text-[12px]">
                      <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cp-text-faint)' }} />
                      <span style={{ color: 'var(--cp-cyan)' }}>{selected.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-[12px]">
                    <Building2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cp-text-faint)' }} />
                    <span style={{ color: 'var(--cp-text-secondary)' }}>{selected.department || 'Unassigned'}</span>
                  </div>
                  {selected.manager && (
                    <div className="flex items-center gap-2.5 text-[12px]">
                      <Briefcase className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cp-text-faint)' }} />
                      <span style={{ color: 'var(--cp-text-secondary)' }}>Reports to {selected.manager.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {directReports(selected.id).length > 0 && (
                <>
                  <div className="h-px" style={{ background: 'var(--cp-border-soft)' }} />
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--cp-text-faint)' }}>Direct Reports</p>
                    <div className="flex flex-col gap-2">
                      {directReports(selected.id).map(r => (
                        <div key={r.id} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)' }}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${r.accent_color || 'var(--cp-cyan)'} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${r.accent_color || 'var(--cp-cyan)'} 19%, transparent)` }}>
                            <span className="text-[10px] font-bold" style={{ color: r.accent_color || 'var(--cp-cyan)' }}>{r.initials}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-medium truncate" style={{ color: 'var(--cp-text-secondary)' }}>{r.name}</p>
                            <p className="text-[10px] truncate" style={{ color: 'var(--cp-text-muted)' }}>{r.title || r.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="h-px" style={{ background: 'var(--cp-border-soft)' }} />

              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-3 flex items-center gap-2" style={{ color: 'var(--cp-text-faint)' }}><FolderKanban className="w-3 h-3" /> Assigned Projects</p>
                {memberProjects.length === 0 ? (
                  <p className="text-[12px]" style={{ color: 'var(--cp-text-faint)' }}>No active project assignments.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {memberProjects.map((pt) => {
                      const proj = Array.isArray(pt.projects) ? pt.projects[0] : pt.projects
                      return (
                        <div key={pt.id} className="p-2.5 rounded-xl flex items-center justify-between" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)' }}>
                          <span className="text-[12px] truncate" style={{ color: 'var(--cp-text-secondary)' }}>{proj?.name}</span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-md uppercase tracking-wider" style={{ background: 'var(--cp-surface)', color: 'var(--cp-text-muted)', border: '1px solid var(--cp-border-soft)' }}>{proj?.stage}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {isFounder && (
                <>
                  <div className="h-px" style={{ background: 'var(--cp-border-soft)' }} />
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--cp-text-faint)' }}>Edit (Founder)</p>
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <ModalInput label="Name" value={editForm.name} onChange={(v) => setEditForm({ ...editForm, name: v })} required />
                        <ModalInput label="Initials" value={editForm.initials} onChange={(v) => setEditForm({ ...editForm, initials: v.toUpperCase().slice(0, 2) })} required />
                      </div>
                      <ModalInput label="Email" value={editForm.email} onChange={(v) => setEditForm({ ...editForm, email: v })} type="email" />
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cp-text-muted, rgba(24,24,27,0.45))' }}>Accent Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editForm.accent_color || '#ffffff'}
                            onChange={(e) => setEditForm({ ...editForm, accent_color: e.target.value })}
                            className="w-10 h-8 rounded border border-[var(--cp-border-soft)] cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={editForm.accent_color || '#ffffff'}
                            onChange={(e) => setEditForm({ ...editForm, accent_color: e.target.value })}
                            className="px-3 py-1.5 rounded-lg text-[13px] outline-none flex-1 border"
                            style={{ background: 'var(--cp-bg-soft, #F4F4F5)', borderColor: 'var(--cp-border-soft, rgba(0,0,0,0.05))', color: 'var(--cp-text, #18181B)' }}
                          />
                        </div>
                      </div>
                      <ModalInput label="Title" value={editForm.title} onChange={(v) => setEditForm({ ...editForm, title: v })} placeholder="e.g. Senior Developer" />
                      <ModalInput label="Department" value={editForm.department} onChange={(v) => setEditForm({ ...editForm, department: v })} placeholder="e.g. Engineering" />
                      <ModalInput label="Role" value={editForm.role} onChange={(v) => setEditForm({ ...editForm, role: v })} placeholder="e.g. Developer" />
                      <ModalSelect
                        label="Reports To"
                        value={editForm.manager_id}
                        onChange={(v) => setEditForm({ ...editForm, manager_id: v })}
                        options={[{ value: '', label: 'None' }, ...members.filter(m => m.id !== selected.id).map(m => ({ value: m.id, label: m.name }))]}
                      />
                      <button onClick={handleEditSave} disabled={editSaving} className="cp-btn-primary px-4 py-2.5 text-[12px]">
                        {editSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Team Member Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Team Member" subtitle="Add a member to the org chart.">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <ModalInput 
              label="Name" 
              value={form.name} 
              onChange={(v) => {
                const nextForm = { ...form, name: v }
                const prevDerived = deriveInitials(form.name)
                if (!form.initials || form.initials === prevDerived) {
                  nextForm.initials = deriveInitials(v)
                }
                setForm(nextForm)
              }} 
              placeholder="Jane Doe" 
              required 
            />
            <ModalInput label="Initials" value={form.initials} onChange={(v) => setForm({ ...form, initials: v.toUpperCase().slice(0, 2) })} placeholder="JD" required />
          </div>
          <ModalInput label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="jane@lyptron.com" type="email" />
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} placeholder="e.g. Developer" required />
            <ModalInput label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. Senior Developer" />
          </div>
          <ModalInput label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} placeholder="e.g. Engineering" />
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium transition-colors text-[var(--cp-text-muted)] hover:text-[var(--cp-text)]">Cancel</button>
            <button onClick={handleAdd} disabled={saving || !form.name || !form.initials || !form.role} className="cp-btn-primary px-5 py-2 text-[12px]">
              {saving ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
