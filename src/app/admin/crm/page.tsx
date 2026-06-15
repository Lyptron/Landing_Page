'use client'
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Mail, Phone, Clock, Gauge, Search, X } from 'lucide-react'
import { fetchLeads, insertLead, updateLead } from '@/lib/db'
import { useAdminAuth } from '@/lib/AdminAuthContext'
import RestrictedValue from '@/components/ui/RestrictedValue'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'
import { priorityStyle, followupUrgency, qualityColor } from '@/lib/badges'
import SalaryStepper from '@/components/ui/SalaryStepper'

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost']

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

function timeAgo(date: string | null) {
  if (!date) return '-'
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const emptyForm = {
  company: '',
  contact: '',
  source: 'Inbound',
  value: '',
  priority: 'medium',
  quality_score: '50',
  owner: '',
  next_followup_at: '',
}

export default function CRMPipelinePage() {
  const { user } = useAdminAuth()
  const isFounder = user?.role === 'founder'
  const [leads, setLeads] = useState<any[]>([])
  const [draggedLead, setDraggedLead] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [search, setSearch] = useState('')
  const [selectedLead, setSelectedLead] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any>({
    company: '',
    contact: '',
    stage: 'New',
    value: '',
    probability: '',
    source: 'Inbound',
    priority: 'medium',
    quality_score: '50',
    owner: '',
    next_followup_at: '',
  })
  const [drawerSaving, setDrawerSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await fetchLeads()
      if (!error && data) setLeads(data.map((l: any) => ({ ...l, last_contact_formatted: timeAgo(l.last_contact) })))
      setLoading(false)
    }
    load()
  }, [])

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLead(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setDragImage(e.currentTarget as Element, 20, 20)
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault()
    if (!draggedLead) return
    setLeads(leads.map(l => l.id === draggedLead ? { ...l, stage } : l))
    setDraggedLead(null)
    await updateLead(draggedLead, { stage })
  }

  const addLead = async () => {
    if (!form.company || !form.contact) return
    setSaving(true)
    const { data } = await insertLead({
      company: form.company,
      contact: form.contact,
      value: Number(form.value) || 0,
      probability: 20,
      source: form.source,
      priority: form.priority,
      quality_score: Number(form.quality_score) || 50,
      owner: form.owner || undefined,
      next_followup_at: form.next_followup_at || undefined,
    })
    if (data) setLeads([{ ...data, last_contact_formatted: 'now' }, ...leads])
    setForm(emptyForm)
    setSaving(false)
    setModalOpen(false)
  }

  const handleEditSave = async () => {
    if (!selectedLead) return
    setDrawerSaving(true)
    const payload = {
      company: editForm.company,
      contact: editForm.contact,
      stage: editForm.stage,
      value: Number(editForm.value) || 0,
      probability: Number(editForm.probability) || 0,
      source: editForm.source,
      priority: editForm.priority,
      quality_score: Number(editForm.quality_score) || 50,
      owner: editForm.owner || null,
      next_followup_at: editForm.next_followup_at || null,
    }
    await updateLead(selectedLead.id, payload)
    setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, ...payload, last_contact_formatted: l.last_contact_formatted } : l))
    setSelectedLead({ ...selectedLead, ...payload })
    setDrawerSaving(false)
    setSelectedLead(null) // close drawer on save
  }

  const filteredLeads = useMemo(() => {
    if (!search.trim()) return leads
    const q = search.toLowerCase()
    return leads.filter(
      (l) =>
        l.company?.toLowerCase().includes(q) ||
        l.contact?.toLowerCase().includes(q) ||
        l.owner?.toLowerCase().includes(q)
    )
  }, [leads, search])

  const totalPipeline = filteredLeads.reduce((acc, l) => acc + (l.value || 0), 0)
  const avgQuality = filteredLeads.length ? Math.round(filteredLeads.reduce((acc, l) => acc + (l.quality_score ?? 50), 0) / filteredLeads.length) : 0

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--cp-text)]">Sales Pipeline</h1>
          <p className="text-[13px] mt-0.5 flex items-center gap-1.5 text-[var(--cp-text-faint)]">
            {isFounder ? (
              <>Pipeline: <RestrictedValue value={totalPipeline} className="font-mono text-[var(--cp-text-secondary)]" /> across <span className="font-mono text-[var(--cp-text-secondary)]">{filteredLeads.length}</span> leads.</>
            ) : (
              <>Tracking <span className="font-mono text-[var(--cp-text-secondary)]">{filteredLeads.length}</span> leads · Avg quality score <span className="font-mono text-[var(--cp-text-secondary)]">{avgQuality}</span>.</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex p-0.5 rounded-xl bg-[var(--cp-bg-soft)] border border-[var(--cp-border)]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[var(--cp-surface)] text-[var(--cp-text)] shadow-sm'
                  : 'text-[var(--cp-text-muted)] hover:text-[var(--cp-text)]'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[var(--cp-surface)] text-[var(--cp-text)] shadow-sm'
                  : 'text-[var(--cp-text-muted)] hover:text-[var(--cp-text)]'
              }`}
            >
              Table
            </button>
          </div>

          <button onClick={() => setModalOpen(true)} className="cp-btn-primary flex items-center gap-1.5 px-4 py-2 text-[12px] cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> New Lead
          </button>
        </div>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 mb-4 rounded-xl shrink-0"
        style={{
          background: 'var(--cp-surface)',
          border: '1px solid var(--cp-border)',
        }}
      >
        <Search className="w-3.5 h-3.5" style={{ color: 'var(--cp-text-faint)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search leads, companies, or owners…"
          className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-[var(--cp-text-faint)]"
          style={{ color: 'var(--cp-text)' }}
        />
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[var(--cp-border)] border-t-[var(--cp-text-muted)] rounded-full animate-spin" />
        </div>
      ) : (
        <div className={`flex-1 overflow-hidden relative flex gap-4 transition-all duration-300 ${selectedLead ? 'lg:pr-[380px]' : ''}`}>
          {viewMode === 'kanban' ? (
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 flex gap-4">
              {STAGES.map((stage) => {
                const stageLeads = filteredLeads.filter(l => l.stage === stage)
                const stageValue = stageLeads.reduce((acc, l) => acc + (l.value || 0), 0)
                const stageAvgQuality = stageLeads.length ? Math.round(stageLeads.reduce((acc, l) => acc + (l.quality_score ?? 50), 0) / stageLeads.length) : 0
                return (
                  <div key={stage} className="flex flex-col w-[270px] shrink-0 rounded-2xl max-h-full overflow-hidden" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)' }} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage)}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--cp-border-soft)' }}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[12px] font-bold" style={{ color: 'var(--cp-text-secondary)' }}>{stage}</h3>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md" style={{ background: 'var(--cp-surface)', color: 'var(--cp-text-muted)', border: '1px solid var(--cp-border-soft)' }}>{stageLeads.length}</span>
                        </div>
                      </div>
                      {isFounder ? (
                        <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--cp-text-faint)' }}>₹{stageValue.toLocaleString('en-IN')}</p>
                      ) : (
                        <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--cp-text-faint)' }}>{stageLeads.length ? `Avg quality ${stageAvgQuality}` : '—'}</p>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2.5">
                      {stageLeads.map((lead) => {
                        const pStyle = priorityStyle(lead.priority)
                        const urgency = followupUrgency(lead.next_followup_at)
                        return (
                          <motion.div
                            layoutId={lead.id}
                            key={lead.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, lead.id)}
                            onClick={() => {
                              setSelectedLead(lead)
                              setEditForm({
                                company: lead.company || '',
                                contact: lead.contact || '',
                                stage: lead.stage || 'New',
                                value: lead.value || 0,
                                probability: lead.probability || 0,
                                source: lead.source || 'Inbound',
                                priority: lead.priority || 'medium',
                                quality_score: lead.quality_score || 50,
                                owner: lead.owner || '',
                                next_followup_at: lead.next_followup_at ? new Date(lead.next_followup_at).toISOString().split('T')[0] : '',
                              })
                            }}
                            className="p-3.5 rounded-xl cursor-grab active:cursor-grabbing hover:border-[var(--cp-cyan-border)] transition-all group relative overflow-hidden"
                            style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}
                            whileHover={{ borderColor: 'var(--cp-cyan-border)' }}
                          >
                            {/* Probability bar */}
                            <div className="absolute top-0 left-0 h-[2px]" style={{ width: `${lead.probability}%`, background: 'linear-gradient(90deg, var(--cp-cyan), var(--cp-cyan-border))' }} />

                            <h4 className="text-[13px] font-bold mb-0.5 mt-1" style={{ color: 'var(--cp-text)' }}>{lead.company}</h4>
                            <p className="text-[10px] mb-3" style={{ color: 'var(--cp-text-muted)' }}>{lead.contact}{lead.owner ? ` · ${lead.owner}` : ''}</p>

                            <div className="flex flex-wrap items-center gap-1.5 mb-3">
                              <span className="text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md" style={{ color: pStyle.color, background: pStyle.bg, border: `1px solid ${pStyle.border}` }}>
                                {pStyle.label}
                              </span>
                              <span className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-md" style={{ color: qualityColor(lead.quality_score), background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)' }}>
                                <Gauge className="w-3 h-3" /> {lead.quality_score ?? 50}
                              </span>
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-md" style={{ color: 'var(--cp-text-muted)', background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)' }}>
                                {lead.probability}% conv.
                              </span>
                              {urgency && (
                                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md" style={{ color: urgency.color, background: urgency.bg, border: `1px solid ${urgency.border}` }}>
                                  <Clock className="w-2.5 h-2.5" /> {urgency.label}
                                </span>
                              )}
                              {isFounder && (
                                <RestrictedValue value={lead.value} className="text-[9px] font-mono text-[var(--cp-text-muted)] px-2 py-0.5 rounded-md" />
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2.5 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button className="w-5 h-5 rounded flex items-center justify-center transition-colors" style={{ color: 'var(--cp-text-faint)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--cp-cyan)'; e.currentTarget.style.background = 'var(--cp-bg-soft)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--cp-text-faint)'; e.currentTarget.style.background = 'transparent' }}><Mail className="w-3 h-3" /></button>
                                <button className="w-5 h-5 rounded flex items-center justify-center transition-colors" style={{ color: 'var(--cp-text-faint)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--cp-emerald)'; e.currentTarget.style.background = 'var(--cp-bg-soft)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--cp-text-faint)'; e.currentTarget.style.background = 'transparent' }}><Phone className="w-3 h-3" /></button>
                              </div>
                              <span className="text-[9px] font-mono" style={{ color: 'var(--cp-text-faint)' }}>{lead.last_contact_formatted}</span>
                            </div>
                          </motion.div>
                        )
                      })}
                      {stageLeads.length === 0 && (
                        <div className="flex-1 min-h-[80px] border border-dashed rounded-xl flex items-center justify-center" style={{ borderColor: 'var(--cp-border)' }}>
                          <span className="text-[10px]" style={{ color: 'var(--cp-text-faint)' }}>Drop here</span>
                        </div>
                      )}
                    </div>

                    <div className="px-2.5 py-2 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
                      <button onClick={() => setModalOpen(true)} className="w-full py-1.5 flex items-center justify-center gap-1.5 text-[10px] rounded-lg transition-colors cursor-pointer" style={{ color: 'var(--cp-text-faint)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--cp-text-muted)'; e.currentTarget.style.background = 'var(--cp-bg-soft)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--cp-text-faint)'; e.currentTarget.style.background = 'transparent' }}>
                        <Plus className="w-3 h-3" /> Add Lead
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex-1 overflow-auto rounded-xl border bg-[var(--cp-surface)] border-[var(--cp-border)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-[var(--cp-bg-soft)] border-[var(--cp-border)]">
                    <th className="p-3 text-[10px] uppercase font-mono tracking-wider text-[var(--cp-text-muted)]">Company</th>
                    <th className="p-3 text-[10px] uppercase font-mono tracking-wider text-[var(--cp-text-muted)]">Contact</th>
                    <th className="p-3 text-[10px] uppercase font-mono tracking-wider text-[var(--cp-text-muted)]">Stage</th>
                    <th className="p-3 text-[10px] uppercase font-mono tracking-wider text-[var(--cp-text-muted)]">Priority</th>
                    <th className="p-3 text-[10px] uppercase font-mono tracking-wider text-[var(--cp-text-muted)]">Quality Score</th>
                    <th className="p-3 text-[10px] uppercase font-mono tracking-wider text-[var(--cp-text-muted)]">Probability</th>
                    {isFounder && <th className="p-3 text-[10px] uppercase font-mono tracking-wider text-[var(--cp-text-muted)]">Value</th>}
                    <th className="p-3 text-[10px] uppercase font-mono tracking-wider text-[var(--cp-text-muted)]">Owner</th>
                    <th className="p-3 text-[10px] uppercase font-mono tracking-wider text-[var(--cp-text-muted)]">Next Follow-up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--cp-border-soft)]">
                  {filteredLeads.map((lead) => {
                    const pStyle = priorityStyle(lead.priority)
                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-[var(--cp-surface-strong)] transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedLead(lead)
                          setEditForm({
                            company: lead.company || '',
                            contact: lead.contact || '',
                            stage: lead.stage || 'New',
                            value: lead.value || 0,
                            probability: lead.probability || 0,
                            source: lead.source || 'Inbound',
                            priority: lead.priority || 'medium',
                            quality_score: lead.quality_score || 50,
                            owner: lead.owner || '',
                            next_followup_at: lead.next_followup_at ? new Date(lead.next_followup_at).toISOString().split('T')[0] : '',
                          })
                        }}
                      >
                        <td className="p-3 text-[13px] font-semibold text-[var(--cp-text)]">{lead.company}</td>
                        <td className="p-3 text-[12px] text-[var(--cp-text-secondary)]">{lead.contact}</td>
                        <td className="p-3 text-[12px] text-[var(--cp-text-secondary)]">
                          <span className="font-medium">{lead.stage}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md" style={{ color: pStyle.color, background: pStyle.bg, border: `1px solid ${pStyle.border}` }}>
                            {pStyle.label}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-md" style={{ color: qualityColor(lead.quality_score), background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)' }}>
                            <Gauge className="w-3 h-3" /> {lead.quality_score ?? 50}
                          </span>
                        </td>
                        <td className="p-3 text-[12px] font-mono text-[var(--cp-text-muted)]">{lead.probability}%</td>
                        {isFounder && (
                          <td className="p-3 text-[12px] font-mono text-[var(--cp-text-secondary)]">
                            <RestrictedValue value={lead.value} />
                          </td>
                        )}
                        <td className="p-3 text-[12px] text-[var(--cp-text-muted)]">{lead.owner || '—'}</td>
                        <td className="p-3 text-[11.5px] text-[var(--cp-text-muted)]">
                          {lead.next_followup_at ? new Date(lead.next_followup_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={isFounder ? 9 : 8} className="p-8 text-center text-[12px] text-[var(--cp-text-faint)]">
                        No leads found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Detail Slide-out Drawer */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="absolute top-0 right-0 bottom-0 w-full sm:w-[380px] flex flex-col z-20"
            style={{ background: 'var(--cp-surface)', borderLeft: '1px solid var(--cp-border-soft)', boxShadow: '-8px 0 24px rgba(0,0,0,0.06)' }}
          >
            <div className="p-5 border-b flex items-start justify-between" style={{ borderColor: 'var(--cp-border-soft)' }}>
              <div>
                <h2 className="text-[16px] font-bold text-[var(--cp-text)]">{editForm.company}</h2>
                <p className="text-[11px] text-[var(--cp-text-muted)]">{editForm.contact}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-1.5 rounded-lg text-[var(--cp-text-muted)] hover:text-[var(--cp-text)] hover:bg-[var(--cp-bg-soft)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              <ModalInput label="Company" value={editForm.company} onChange={v => setEditForm({ ...editForm, company: v })} required />
              <ModalInput label="Contact" value={editForm.contact} onChange={v => setEditForm({ ...editForm, contact: v })} required />
              <ModalSelect label="Stage" value={editForm.stage} onChange={v => setEditForm({ ...editForm, stage: v })} options={STAGES.map(s => ({ value: s, label: s }))} />
              
              <div className="grid grid-cols-2 gap-4">
                <ModalSelect label="Source" value={editForm.source} onChange={v => setEditForm({ ...editForm, source: v })} options={[{ value: 'Inbound', label: 'Inbound' }, { value: 'Referral', label: 'Referral' }, { value: 'Website', label: 'Website' }, { value: 'LinkedIn', label: 'LinkedIn' }]} />
                <ModalSelect label="Priority" value={editForm.priority} onChange={v => setEditForm({ ...editForm, priority: v })} options={PRIORITIES} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ModalInput label="Quality Score (0-100)" value={editForm.quality_score} onChange={v => setEditForm({ ...editForm, quality_score: v })} type="number" />
                <ModalInput label="Probability (%)" value={editForm.probability} onChange={v => setEditForm({ ...editForm, probability: v })} type="number" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ModalInput label="Owner" value={editForm.owner} onChange={v => setEditForm({ ...editForm, owner: v })} />
                <ModalInput label="Next Follow-up" value={editForm.next_followup_at} onChange={v => setEditForm({ ...editForm, next_followup_at: v })} type="date" />
              </div>

              {isFounder && (
                <SalaryStepper label="Deal Value (₹)" value={editForm.value} onChange={v => setEditForm({ ...editForm, value: v })} />
              )}

              <button onClick={handleEditSave} disabled={drawerSaving} className="cp-btn-primary px-4 py-2.5 text-[12px] mt-4 cursor-pointer">
                {drawerSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Lead" subtitle="Add a new lead to your pipeline.">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="Acme Corp" required />
            <ModalInput label="Contact Person" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} placeholder="John Doe" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalSelect label="Source" value={form.source} onChange={(v) => setForm({ ...form, source: v })} options={[{ value: 'Inbound', label: 'Inbound' }, { value: 'Referral', label: 'Referral' }, { value: 'Website', label: 'Website' }, { value: 'LinkedIn', label: 'LinkedIn' }]} />
            <ModalSelect label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={PRIORITIES} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Quality Score (0-100)" value={form.quality_score} onChange={(v) => setForm({ ...form, quality_score: v })} placeholder="50" type="number" />
            <ModalInput label="Owner" value={form.owner} onChange={(v) => setForm({ ...form, owner: v })} placeholder="e.g. Priya" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Next Follow-up" value={form.next_followup_at} onChange={(v) => setForm({ ...form, next_followup_at: v })} type="date" />
            {isFounder && (
              <SalaryStepper label="Deal Value (₹)" value={form.value} onChange={(v) => setForm({ ...form, value: v })} placeholder="100000" />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium transition-colors text-[var(--cp-text-muted)] hover:text-[var(--cp-text)]">Cancel</button>
            <button onClick={addLead} disabled={saving || !form.company || !form.contact} className="cp-btn-primary px-5 py-2 text-[12px] cursor-pointer">
              {saving ? 'Adding...' : 'Add Lead'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
