'use client'
import { useState } from 'react'
import { Zap, GitCommit, Plus, Trash2 } from 'lucide-react'
import { insertDeployment, insertActivity } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'
import { useProject } from '../layout'

export default function ProjectDevelopmentPage() {
  const { projectId, deployments, setDeployments, activities, setActivities } = useProject()
  const [depModalOpen, setDepModalOpen] = useState(false)
  const [actModalOpen, setActModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [depForm, setDepForm] = useState({ environment: 'Production', version: '', status: 'success', url: '' })
  const [actForm, setActForm] = useState({ action_text: '', actor_name: 'Admin', type: 'milestone' })

  async function handleAddDeployment() {
    setSaving(true)
    const { data } = await insertDeployment({
      project_id: projectId,
      environment: depForm.environment,
      version: depForm.version || undefined,
      status: depForm.status,
      url: depForm.url || undefined,
    })
    if (data) setDeployments(prev => [data, ...prev])
    setDepForm({ environment: 'Production', version: '', status: 'success', url: '' })
    setSaving(false)
    setDepModalOpen(false)
  }

  async function handleAddActivity() {
    if (!actForm.action_text) return
    setSaving(true)
    const payload = {
      project_id: projectId,
      type: actForm.type,
      actor_name: actForm.actor_name || 'Admin',
      action_text: actForm.action_text,
    }
    const { error } = await insertActivity(payload)
    if (!error) {
      setActivities(prev => [{ id: Date.now().toString(), ...payload, created_at: new Date().toISOString() }, ...prev])
    }
    setActForm({ action_text: '', actor_name: 'Admin', type: 'milestone' })
    setSaving(false)
    setActModalOpen(false)
  }

  async function handleDeleteDeployment(id: string) {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('deployments').delete().eq('id', id)
    if (!error) setDeployments(deployments.filter(d => d.id !== id))
  }

  async function handleDeleteActivity(id: string) {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('activities').delete().eq('id', id)
    if (!error) setActivities(activities.filter(a => a.id !== id))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Deployments Section */}
      <div className="cp-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-bold text-(--cp-text-secondary) flex items-center gap-1.5"><Zap className="w-4 h-4 text-(--cp-text-faint)" /> Deployments</h3>
          <span className="text-[10px] font-mono text-(--cp-text-faint)">{deployments.length} total</span>
        </div>
        <div className="flex flex-col gap-2">
          {deployments.map(d => (
            <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-(--cp-bg-soft) border border-(--cp-border-soft)">
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${d.status === 'success' ? 'bg-(--cp-emerald)' : d.status === 'failed' ? 'bg-(--cp-red)' : 'bg-(--cp-cyan) animate-pulse'}`} />
                <div>
                  <span className="text-[13px] block font-semibold text-(--cp-text)">{d.environment}{d.version && ` v${d.version}`}</span>
                  {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="text-[10.5px] text-(--cp-cyan) hover:underline truncate block max-w-50">{d.url}</a>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[9px] font-mono uppercase ${d.status === 'success' ? 'text-(--cp-emerald)' : d.status === 'failed' ? 'text-(--cp-red)' : 'text-(--cp-cyan)'}`}>{d.status}</span>
                <button onClick={() => handleDeleteDeployment(d.id)} className="p-1 text-(--cp-text-faint) hover:text-(--cp-red) transition-colors cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => setDepModalOpen(true)} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-(--cp-text-faint) hover:text-(--cp-text-muted) hover:bg-(--cp-bg-soft) transition-colors border border-dashed border-(--cp-border) cursor-pointer justify-center">
            <Plus className="w-3.5 h-3.5" /> Add Deployment
          </button>
        </div>
      </div>

      {/* Activity Logs Section */}
      <div className="cp-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-bold text-(--cp-text-secondary) flex items-center gap-1.5"><GitCommit className="w-4 h-4 text-(--cp-text-faint)" /> Activity Logs</h3>
          <span className="text-[10px] font-mono text-(--cp-text-faint)">{activities.length} total</span>
        </div>
        <div className="flex flex-col gap-2">
          {activities.map(a => (
            <div key={a.id} className="flex items-start justify-between p-3 rounded-xl bg-(--cp-bg-soft) border border-(--cp-border-soft)">
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--cp-border-strong)' }} />
                <div>
                  <span className="text-[13px] block text-(--cp-text)">{a.action_text}</span>
                  <span className="text-[9px] font-mono text-(--cp-text-faint)">
                    {a.actor_name} • {a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                  </span>
                </div>
              </div>
              <button onClick={() => handleDeleteActivity(a.id)} className="p-1 text-(--cp-text-faint) hover:text-(--cp-red) transition-colors cursor-pointer shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button onClick={() => setActModalOpen(true)} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-(--cp-text-faint) hover:text-(--cp-text-muted) hover:bg-(--cp-bg-soft) transition-colors border border-dashed border-(--cp-border) cursor-pointer justify-center">
            <Plus className="w-3.5 h-3.5" /> Log Activity
          </button>
        </div>
      </div>

      {/* Deployment Modal */}
      <Modal open={depModalOpen} onClose={() => setDepModalOpen(false)} title="Add Deployment">
        <div className="flex flex-col gap-4">
          <ModalSelect label="Environment" value={depForm.environment} onChange={v => setDepForm({ ...depForm, environment: v })} options={[{ value: 'Production', label: 'Production' }, { value: 'Staging', label: 'Staging' }, { value: 'Preview', label: 'Preview' }]} />
          <ModalInput label="Version" value={depForm.version} onChange={v => setDepForm({ ...depForm, version: v })} placeholder="e.g. 1.0.0" />
          <ModalSelect label="Status" value={depForm.status} onChange={v => setDepForm({ ...depForm, status: v })} options={[{ value: 'success', label: 'Success' }, { value: 'building', label: 'Building' }, { value: 'failed', label: 'Failed' }]} />
          <ModalInput label="URL" value={depForm.url} onChange={v => setDepForm({ ...depForm, url: v })} placeholder="https://..." />
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button onClick={() => setDepModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-(--cp-text-muted) hover:text-(--cp-text)">Cancel</button>
            <button onClick={handleAddDeployment} disabled={saving} className="cp-btn-primary px-5 py-2 text-[12px] cursor-pointer">
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Activity Modal */}
      <Modal open={actModalOpen} onClose={() => setActModalOpen(false)} title="Log Activity">
        <div className="flex flex-col gap-4">
          <ModalInput label="Action Text" value={actForm.action_text} onChange={v => setActForm({ ...actForm, action_text: v })} placeholder="e.g. Completed page designs" required />
          <ModalInput label="Actor Name" value={actForm.actor_name} onChange={v => setActForm({ ...actForm, actor_name: v })} placeholder="Admin" />
          <ModalSelect label="Type" value={actForm.type} onChange={v => setActForm({ ...actForm, type: v })} options={[{ value: 'milestone', label: 'Milestone' }, { value: 'commit', label: 'Commit' }, { value: 'deployment', label: 'Deployment' }, { value: 'approval', label: 'Approval' }]} />
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button onClick={() => setActModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-(--cp-text-muted) hover:text-(--cp-text)">Cancel</button>
            <button onClick={handleAddActivity} disabled={saving || !actForm.action_text} className="cp-btn-primary px-5 py-2 text-[12px] cursor-pointer">
              {saving ? 'Logging...' : 'Log'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
