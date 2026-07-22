'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { insertApproval } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'
import { useProject } from '@/lib/AdminProjectContext'

const APPROVAL_TYPES = [
  { value: 'Design', label: 'Design' },
  { value: 'UX', label: 'UX' },
  { value: 'Copy', label: 'Copy' },
  { value: 'Feature', label: 'Feature' },
  { value: 'Deployment', label: 'Deployment' },
  { value: 'Document', label: 'Document' },
]

export default function ProjectDeliverablesPage() {
  const { projectId, approvals, setApprovals } = useProject()
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'Feature', description: '' })

  async function handleAdd() {
    if (!form.title) return
    setSaving(true)
    const { data } = await insertApproval({
      project_id: projectId,
      title: form.title,
      type: form.type,
      description: form.description || undefined,
    })
    if (data) setApprovals(prev => [data, ...prev])
    setForm({ title: '', type: 'Feature', description: '' })
    setSaving(false)
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('approvals').delete().eq('id', id)
    if (!error) setApprovals(approvals.filter(a => a.id !== id))
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('approvals').update({ status }).eq('id', id)
    if (!error) setApprovals(approvals.map(a => a.id === id ? { ...a, status } : a))
  }

  return (
    <div className="cp-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold text-(--cp-text-secondary)">Feature & Design Approvals</h3>
        <span className="text-[10px] font-mono text-(--cp-text-faint)">{approvals.length} total</span>
      </div>
      <div className="flex flex-col gap-2">
        {approvals.map(a => (
          <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-(--cp-bg-soft) border border-(--cp-border-soft)">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[13px] text-(--cp-text) font-semibold truncate">{a.title}</span>
              {a.description && <span className="text-[11px] text-(--cp-text-muted) truncate">{a.description}</span>}
              <span className="text-[9px] font-mono uppercase text-(--cp-text-faint)">{a.type} • {a.status || 'pending'}</span>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <select
                value={a.status || 'pending'}
                onChange={(e) => updateStatus(a.id, e.target.value)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer bg-(--cp-bg-elevated) text-(--cp-text) border-(--cp-border)"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button onClick={() => handleDelete(a.id)} className="p-1.5 text-(--cp-text-faint) hover:text-(--cp-red) transition-colors cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-(--cp-text-faint) hover:text-(--cp-text-muted) hover:bg-(--cp-bg-soft) transition-colors border border-dashed border-(--cp-border) cursor-pointer justify-center">
          <Plus className="w-3.5 h-3.5" /> Add Deliverable Request
        </button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Approval Request" subtitle="Client sees this under 'Needs Your Review'.">
        <div className="flex flex-col gap-4">
          <ModalInput label="Title" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="e.g. Design Spec v2" required />
          <ModalSelect label="Type" value={form.type} onChange={v => setForm({ ...form, type: v })} options={APPROVAL_TYPES} />
          <ModalInput label="Description" value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Optional details..." />
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-(--cp-text-muted) hover:text-(--cp-text)">Cancel</button>
            <button onClick={handleAdd} disabled={saving || !form.title} className="cp-btn-primary px-5 py-2 text-[12px] cursor-pointer">
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
