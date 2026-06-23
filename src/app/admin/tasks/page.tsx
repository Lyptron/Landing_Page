'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Trash2, Pencil, ListChecks, AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw, FileText, UserPlus, ListTodo, Clock } from 'lucide-react'
import { fetchTasks, insertTask, updateTask, deleteTask, fetchClients, fetchLeads } from '@/lib/db'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'
import { priorityStyle, slaRiskStyle } from '@/lib/badges'

const STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
]

const TYPE_META: Record<string, { label: string; icon: any }> = {
  follow_up: { label: 'Follow-up', icon: RefreshCw },
  escalation: { label: 'Escalation', icon: AlertTriangle },
  document: { label: 'Document', icon: FileText },
  onboarding: { label: 'Onboarding', icon: UserPlus },
  general: { label: 'General', icon: ListTodo },
}

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

const TYPE_OPTIONS = Object.entries(TYPE_META).map(([value, meta]) => ({ value, label: meta.label }))

const emptyForm = {
  title: '', description: '', type: 'general', related_client_id: '', related_lead_id: '',
  assignee: '', due_date: '', priority: 'medium', sla_due_at: '', status: 'open',
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const [taskRes, clientRes, leadRes] = await Promise.all([fetchTasks(), fetchClients(), fetchLeads()])
      if (!taskRes.error && taskRes.data) setTasks(taskRes.data)
      if (!clientRes.error && clientRes.data) setClients(clientRes.data)
      if (!leadRes.error && leadRes.data) setLeads(leadRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const clientName = (id: string | null) => clients.find(c => c.id === id)?.company
  const leadName = (id: string | null) => leads.find(l => l.id === id)?.company

  const assignees = useMemo(() => Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))), [tasks])

  const filtered = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (assigneeFilter !== 'all' && t.assignee !== assigneeFilter) return false
    if (priorityFilter !== 'all' && (t.priority || 'medium') !== priorityFilter) return false
    return true
  })

  // ── KPIs ──
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const openCount = tasks.filter(t => t.status === 'open' || t.status === 'in_progress').length
  const overdueCount = tasks.filter(t => t.due_date && new Date(t.due_date) < today && t.status !== 'done').length
  const slaAtRisk = tasks.filter(t => {
    if (t.status === 'done') return false
    const sla = slaRiskStyle(t.sla_due_at, false)
    return sla.label === 'At Risk' || sla.label === 'Breached'
  }).length
  const doneCount = tasks.filter(t => t.status === 'done').length

  const handleDragStart = (e: React.DragEvent, id: string) => { setDraggedTask(id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setDragImage(e.currentTarget as Element, 20, 20) }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault()
    if (!draggedTask) return
    const id = draggedTask
    const snapshot = tasks
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t))
    setDraggedTask(null)
    const { error } = await updateTask(id, { status })
    if (error) setTasks(snapshot)
  }

  function openAddModal() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEditModal(task: any) {
    setEditingId(task.id)
    setForm({
      title: task.title || '',
      description: task.description || '',
      type: task.type || 'general',
      related_client_id: task.related_client_id || '',
      related_lead_id: task.related_lead_id || '',
      assignee: task.assignee || '',
      due_date: task.due_date ? task.due_date.slice(0, 10) : '',
      priority: task.priority || 'medium',
      sla_due_at: task.sla_due_at ? task.sla_due_at.slice(0, 10) : '',
      status: task.status || 'open',
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.title) return
    setSaving(true)
    const payload = {
      title: form.title,
      description: form.description || undefined,
      type: form.type,
      related_client_id: form.related_client_id || undefined,
      related_lead_id: form.related_lead_id || undefined,
      assignee: form.assignee || undefined,
      due_date: form.due_date || undefined,
      priority: form.priority,
      sla_due_at: form.sla_due_at || undefined,
      status: form.status,
    }

    if (editingId) {
      await updateTask(editingId, payload)
      setTasks(tasks.map(t => t.id === editingId ? { ...t, ...payload } : t))
    } else {
      const { data } = await insertTask(payload)
      if (data) setTasks([data, ...tasks])
    }
    setSaving(false)
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    setTasks(tasks.filter(t => t.id !== id))
    await deleteTask(id)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--cp-text)' }}>Tasks</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--cp-text-faint)' }}>Follow-ups, escalations, onboarding, and SLA tracking.</p>
        </div>
        <button onClick={openAddModal} className="cp-btn-primary flex items-center gap-1.5 px-4 py-2 text-[12px]">
          <Plus className="w-3.5 h-3.5" /> New Task
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0">
        {[
          { label: 'Open Tasks', value: String(openCount), icon: ListChecks, color: 'text-(--cp-text)' },
          { label: 'Overdue', value: String(overdueCount), icon: Clock, color: overdueCount > 0 ? 'text-(--cp-red)' : 'text-(--cp-text)' },
          { label: 'SLA At Risk', value: String(slaAtRisk), icon: ShieldAlert, color: slaAtRisk > 0 ? 'text-(--cp-amber)' : 'text-(--cp-emerald)' },
          { label: 'Completed', value: String(doneCount), icon: CheckCircle2, color: 'text-(--cp-emerald)' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="cp-card p-4 flex items-start justify-between"
          >
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: 'var(--cp-text-faint)' }}>{kpi.label}</p>
              <p className={`text-[22px] font-display font-bold tracking-tight ${kpi.color}`}>{kpi.value}</p>
            </div>
            <kpi.icon className={`w-5 h-5 ${kpi.color} opacity-50`} />
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap shrink-0">
        <div className="flex-1 min-w-45 flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)' }}>
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cp-text-faint)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-transparent border-none outline-none text-[13px] text-(--cp-text) placeholder:text-(--cp-text-faint)"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2.5 rounded-xl text-[12px] outline-none cursor-pointer [&>option]:bg-(--cp-bg-elevated) [&>option]:text-(--cp-text)" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-secondary)' }}>
          <option value="all">All Types</option>
          {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="px-4 py-2.5 rounded-xl text-[12px] outline-none cursor-pointer [&>option]:bg-(--cp-bg-elevated) [&>option]:text-(--cp-text)" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-secondary)' }}>
          <option value="all">All Assignees</option>
          {assignees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-4 py-2.5 rounded-xl text-[12px] outline-none cursor-pointer [&>option]:bg-(--cp-bg-elevated) [&>option]:text-(--cp-text)" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-secondary)' }}>
          <option value="all">All Priorities</option>
          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {/* Board */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-(--cp-border) border-t-(--cp-text-muted) rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 flex gap-4">
          {STATUSES.map((col) => {
            const colTasks = filtered.filter(t => t.status === col.value)
            return (
              <div key={col.value} className="flex flex-col w-72.5 shrink-0 rounded-2xl max-h-full overflow-hidden" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)' }} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.value)}>
                <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--cp-border-soft)' }}>
                  <h3 className="text-[12px] font-bold" style={{ color: 'var(--cp-text-secondary)' }}>{col.label}</h3>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md" style={{ background: 'var(--cp-surface)', color: 'var(--cp-text-muted)', border: '1px solid var(--cp-border-soft)' }}>{colTasks.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2.5">
                  {colTasks.map((task) => {
                    const pStyle = priorityStyle(task.priority)
                    const sla = slaRiskStyle(task.sla_due_at, task.status === 'done')
                    const TypeIcon = (TYPE_META[task.type]?.icon) || ListTodo
                    const cName = clientName(task.related_client_id)
                    const lName = leadName(task.related_lead_id)
                    const overdue = task.due_date && new Date(task.due_date) < today && task.status !== 'done'
                    return (
                      <motion.div
                        layoutId={task.id}
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, task.id)}
                        className="p-3.5 rounded-xl cursor-grab active:cursor-grabbing transition-all group relative"
                        style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}
                        whileHover={{ borderColor: 'var(--cp-cyan-border)' }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--cp-text-muted)' }}>
                            <TypeIcon className="w-3 h-3" /> {TYPE_META[task.type]?.label || 'General'}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(task)} className="p-1 rounded transition-all text-(--cp-text-faint) hover:text-(--cp-text) hover:bg-(--cp-bg-soft)"><Pencil className="w-3 h-3" /></button>
                            <button onClick={() => handleDelete(task.id)} className="p-1 rounded transition-all text-(--cp-text-faint) hover:text-(--cp-red) hover:bg-(--cp-red-soft)"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>

                        <h4 className="text-[13px] font-bold mb-1" style={{ color: 'var(--cp-text)' }}>{task.title}</h4>
                        {(cName || lName) && (
                          <p className="text-[10px] mb-2" style={{ color: 'var(--cp-text-muted)' }}>{cName ? `Client: ${cName}` : `Lead: ${lName}`}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          <span className="text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md" style={{ color: pStyle.color, background: pStyle.bg, border: `1px solid ${pStyle.border}` }}>
                            {pStyle.label}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md" style={{ color: sla.color, background: sla.bg, border: `1px solid ${sla.border}` }}>
                            {sla.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
                          <span className="text-[10px]" style={{ color: 'var(--cp-text-muted)' }}>{task.assignee || 'Unassigned'}</span>
                          {task.due_date && (
                            <span className="text-[9px] font-mono" style={{ color: overdue ? 'var(--cp-red)' : 'var(--cp-text-faint)' }}>{formatDate(task.due_date)}</span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                  {colTasks.length === 0 && (
                    <div className="flex-1 min-h-20 border border-dashed rounded-xl flex items-center justify-center" style={{ borderColor: 'var(--cp-border)' }}>
                      <span className="text-[10px]" style={{ color: 'var(--cp-text-faint)' }}>Drop here</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Task' : 'New Task'} subtitle="Track follow-ups, escalations, onboarding, and more." width="max-w-2xl">
        <div className="flex flex-col gap-4">
          <ModalInput label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Follow up with Acme Corp" required />
          <ModalInput label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Optional details..." />
          <div className="grid grid-cols-3 gap-4">
            <ModalSelect label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={TYPE_OPTIONS} />
            <ModalSelect label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={STATUSES} />
            <ModalSelect label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={PRIORITIES} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalSelect label="Related Client" value={form.related_client_id} onChange={(v) => setForm({ ...form, related_client_id: v, related_lead_id: v ? '' : form.related_lead_id })} options={[{ value: '', label: 'None' }, ...clients.map((c) => ({ value: c.id, label: c.company }))]} />
            <ModalSelect label="Related Lead" value={form.related_lead_id} onChange={(v) => setForm({ ...form, related_lead_id: v, related_client_id: v ? '' : form.related_client_id })} options={[{ value: '', label: 'None' }, ...leads.map((l) => ({ value: l.id, label: l.company }))]} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ModalInput label="Assignee" value={form.assignee} onChange={(v) => setForm({ ...form, assignee: v })} placeholder="e.g. Priya" />
            <ModalInput label="Due Date" value={form.due_date} onChange={(v) => setForm({ ...form, due_date: v })} type="date" />
            <ModalInput label="SLA Due Date" value={form.sla_due_at} onChange={(v) => setForm({ ...form, sla_due_at: v })} type="date" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium transition-colors text-(--cp-text-muted) hover:text-(--cp-text)">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.title} className="cp-btn-primary px-5 py-2 text-[12px]">
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
