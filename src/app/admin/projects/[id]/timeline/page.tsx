'use client'
import { useState } from 'react'
import { CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { insertMilestone, updateMilestone, deleteMilestone } from '@/lib/db'
import Modal, { ModalInput } from '@/components/ui/Modal'
import { useProject } from '@/lib/AdminProjectContext'

export default function ProjectTimelinePage() {
  const { projectId, milestones, setMilestones } = useProject()
  const [modalOpen, setModalOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!formName) return
    setSaving(true)
    const { data } = await insertMilestone({ name: formName, status: 'upcoming', project_id: projectId })
    if (data) setMilestones(prev => [...prev, data])
    setFormName('')
    setSaving(false)
    setModalOpen(false)
  }

  return (
    <div className="cp-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold" style={{ color: 'var(--cp-text-secondary)' }}>Timeline Milestones</h3>
        <span className="text-[10px] font-mono text-(--cp-text-faint)">{milestones.length} total</span>
      </div>
      <div className="flex flex-col gap-2">
        {milestones.map(m => (
          <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-(--cp-bg-soft) border border-(--cp-border-soft)">
            <div className="flex items-center gap-2.5">
              <button
                onClick={async () => {
                  const ns = m.status === 'completed' ? 'upcoming' : 'completed'
                  setMilestones(milestones.map(x => x.id === m.id ? { ...x, status: ns } : x))
                  await updateMilestone(m.id, { status: ns })
                }}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${m.status === 'completed' ? 'border-(--cp-emerald) bg-(--cp-emerald-soft)' : 'border-(--cp-border-strong) hover:border-(--cp-text-muted)'}`}
              >
                {m.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-(--cp-emerald)" />}
              </button>
              <span className={`text-[13px] ${m.status === 'completed' ? 'text-(--cp-text-faint) line-through' : 'text-(--cp-text)'}`}>{m.name || m.title}</span>
            </div>
            <button onClick={async () => { await deleteMilestone(m.id); setMilestones(milestones.filter(x => x.id !== m.id)) }} className="p-1.5 text-(--cp-text-faint) hover:text-(--cp-red) transition-colors cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-(--cp-text-faint) hover:text-(--cp-text-muted) hover:bg-(--cp-bg-soft) transition-colors border border-dashed border-(--cp-border) cursor-pointer justify-center">
          <Plus className="w-3.5 h-3.5" /> Add Milestone
        </button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Milestone">
        <div className="flex flex-col gap-4">
          <ModalInput label="Milestone Name" value={formName} onChange={setFormName} placeholder="e.g. UI/UX Design Complete" required />
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-(--cp-text-muted) hover:text-(--cp-text)">Cancel</button>
            <button onClick={handleAdd} disabled={saving || !formName} className="cp-btn-primary px-5 py-2 text-[12px] cursor-pointer">
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
