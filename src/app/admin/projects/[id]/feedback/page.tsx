'use client'
import { MessageSquare, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useProject } from '../layout'

export default function ProjectFeedbackPage() {
  const { feedback, setFeedback } = useProject()

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('feedback').update({ status }).eq('id', id)
    if (!error) {
      setFeedback(feedback.map(f => f.id === id ? { ...f, status } : f))
    }
  }

  async function updatePriority(id: string, priority: string) {
    const { error } = await supabase.from('feedback').update({ priority }).eq('id', id)
    if (!error) {
      setFeedback(feedback.map(f => f.id === id ? { ...f, priority } : f))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('feedback').delete().eq('id', id)
    if (!error) {
      setFeedback(feedback.filter(f => f.id !== id))
    }
  }

  return (
    <div className="cp-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold text-[var(--cp-text-secondary)]">Client Feedback & Bugs</h3>
        <span className="text-[10px] font-mono text-[var(--cp-text-faint)]">{feedback.length} items</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {feedback.map(f => (
          <div key={f.id} className="p-3.5 rounded-xl bg-[var(--cp-bg-soft)] border border-[var(--cp-border-soft)]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[var(--cp-text-faint)]" />
                <span className="text-[13.5px] font-semibold text-[var(--cp-text)]">{f.title}</span>
              </div>
              <span className="text-[9.5px] font-mono text-[var(--cp-text-faint)]">
                {f.submitted_at ? new Date(f.submitted_at).toLocaleDateString() : ''}
              </span>
            </div>

            <p className="text-[12px] text-[var(--cp-text-muted)] mb-3 leading-relaxed">{f.description || 'No description provided.'}</p>

            <div className="flex items-center justify-between pt-2.5 border-t border-[var(--cp-border-soft)] flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--cp-text-faint)]">Type:</span>
                <span className="text-[11px] font-semibold text-[var(--cp-text-secondary)]">{f.type || 'General Comment'}</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--cp-text-faint)]">Priority:</span>
                  <select
                    value={f.priority || 'Medium'}
                    onChange={(e) => updatePriority(f.id, e.target.value)}
                    className="px-2 py-0.5 rounded border text-[10px] bg-[var(--cp-bg-elevated)] border-[var(--cp-border)] text-[var(--cp-text)] cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--cp-text-faint)]">Status:</span>
                  <select
                    value={f.status || 'In Review'}
                    onChange={(e) => updateStatus(f.id, e.target.value)}
                    className="px-2 py-0.5 rounded border text-[10px] bg-[var(--cp-bg-elevated)] border-[var(--cp-border)] text-[var(--cp-text)] cursor-pointer"
                  >
                    <option value="In Review">In Review</option>
                    <option value="Planned">Planned</option>
                    <option value="Implemented">Implemented</option>
                    <option value="Backlog">Backlog</option>
                  </select>
                </div>

                <button onClick={() => handleDelete(f.id)} className="p-1 text-[var(--cp-text-faint)] hover:text-[var(--cp-red)] transition-colors cursor-pointer ml-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {feedback.length === 0 && (
          <div className="py-8 text-center text-[12px] text-[var(--cp-text-faint)]">
            No feedback submitted yet.
          </div>
        )}
      </div>
    </div>
  )
}
