'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { insertMeeting } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'
import { useProject } from '../layout'

export default function ProjectMeetingsPage() {
  const { projectId, meetings, setMeetings } = useProject()
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'Video Call', meeting_date: '', meeting_time: '', link: '' })

  async function handleAdd() {
    if (!form.title || !form.meeting_date) return
    setSaving(true)
    const { data } = await insertMeeting({
      project_id: projectId,
      title: form.title,
      type: form.type,
      meeting_date: form.meeting_date,
      meeting_time: form.meeting_time || '',
      link: form.link || '',
    })
    if (data) setMeetings(prev => [data, ...prev])
    setForm({ title: '', type: 'Video Call', meeting_date: '', meeting_time: '', link: '' })
    setSaving(false)
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('meetings').delete().eq('id', id)
    if (!error) setMeetings(meetings.filter(m => m.id !== id))
  }

  return (
    <div className="cp-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold text-(--cp-text-secondary)">Meetings & Syncs</h3>
        <span className="text-[10px] font-mono text-(--cp-text-faint)">{meetings.length} total</span>
      </div>
      <div className="flex flex-col gap-2">
        {meetings.map(m => (
          <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-(--cp-bg-soft) border border-(--cp-border-soft)">
            <div>
              <span className="text-[13px] block font-semibold text-(--cp-text)">{m.title}</span>
              <span className="text-[10px] text-(--cp-text-faint)">
                {new Date(m.meeting_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                {m.meeting_time && ` at ${m.meeting_time}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {m.link && (
                <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-[11.5px] text-(--cp-cyan) hover:underline">
                  Join Call
                </a>
              )}
              <button onClick={() => handleDelete(m.id)} className="p-1.5 text-(--cp-text-faint) hover:text-(--cp-red) transition-colors cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-(--cp-text-faint) hover:text-(--cp-text-muted) hover:bg-(--cp-bg-soft) transition-colors border border-dashed border-(--cp-border) cursor-pointer justify-center">
          <Plus className="w-3.5 h-3.5" /> Schedule Sync
        </button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Meeting">
        <div className="flex flex-col gap-4">
          <ModalInput label="Title" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="e.g. Weekly Standup" required />
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Date" value={form.meeting_date} onChange={v => setForm({ ...form, meeting_date: v })} type="date" required />
            <ModalInput label="Time" value={form.meeting_time} onChange={v => setForm({ ...form, meeting_time: v })} placeholder="e.g. 3:00 PM" />
          </div>
          <ModalSelect label="Type" value={form.type} onChange={v => setForm({ ...form, type: v })} options={[{ value: 'Video Call', label: 'Video Call' }, { value: 'In Person', label: 'In Person' }, { value: 'Phone Call', label: 'Phone Call' }]} />
          <ModalInput label="Meeting Link" value={form.link} onChange={v => setForm({ ...form, link: v })} placeholder="https://meet.google.com/..." />
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-(--cp-text-muted) hover:text-(--cp-text)">Cancel</button>
            <button onClick={handleAdd} disabled={saving || !form.title || !form.meeting_date} className="cp-btn-primary px-5 py-2 text-[12px] cursor-pointer">
              {saving ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
