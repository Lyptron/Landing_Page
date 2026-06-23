'use client'
import { useState } from 'react'
import { FileText, Plus, ExternalLink, Trash2 } from 'lucide-react'
import { insertDocument } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'
import { useProject } from '../layout'

const DOCUMENT_TYPES = [
  { value: 'PDF', label: 'PDF' },
  { value: 'Doc', label: 'Document' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Proposal', label: 'Proposal' },
  { value: 'Invoice', label: 'Invoice' },
  { value: 'Requirements', label: 'Requirements' },
  { value: 'NDA', label: 'NDA' },
  { value: 'SOW', label: 'SOW' },
  { value: 'MSA', label: 'MSA' },
  { value: 'Link', label: 'Link' },
]

export default function ProjectDocumentsPage() {
  const { projectId, documents, setDocuments } = useProject()
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'PDF', file_url: '' })

  async function handleAdd() {
    if (!form.title) return
    setSaving(true)
    const { data } = await insertDocument({
      project_id: projectId,
      title: form.title,
      type: form.type,
      file_url: form.file_url || '',
    })
    if (data) setDocuments(prev => [data, ...prev])
    setForm({ title: '', type: 'PDF', file_url: '' })
    setSaving(false)
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('documents').delete().eq('id', id)
    if (!error) setDocuments(documents.filter(d => d.id !== id))
  }

  return (
    <div className="cp-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold text-(--cp-text-secondary)">Documents & Contracts</h3>
        <span className="text-[10px] font-mono text-(--cp-text-faint)">{documents.length} total</span>
      </div>
      <div className="flex flex-col gap-2">
        {documents.map(d => (
          <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-(--cp-bg-soft) border border-(--cp-border-soft)">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-(--cp-text-faint)" />
              <div>
                <span className="text-[13px] block text-(--cp-text)">{d.title}</span>
                <span className="text-[9px] font-mono uppercase text-(--cp-text-muted)">{d.type}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {d.file_url && (
                <a href={d.file_url} target="_blank" rel="noreferrer" className="p-1.5 text-(--cp-cyan) hover:text-(--cp-cyan-strong) transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button onClick={() => handleDelete(d.id)} className="p-1.5 text-(--cp-text-faint) hover:text-(--cp-red) transition-colors cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-(--cp-text-faint) hover:text-(--cp-text-muted) hover:bg-(--cp-bg-soft) transition-colors border border-dashed border-(--cp-border) cursor-pointer justify-center">
          <Plus className="w-3.5 h-3.5" /> Add Document
        </button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Document">
        <div className="flex flex-col gap-4">
          <ModalInput label="Title" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="e.g. Project SOW" required />
          <ModalSelect label="Type" value={form.type} onChange={v => setForm({ ...form, type: v })} options={DOCUMENT_TYPES} />
          <ModalInput label="File URL" value={form.file_url} onChange={v => setForm({ ...form, file_url: v })} placeholder="https://..." />
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
