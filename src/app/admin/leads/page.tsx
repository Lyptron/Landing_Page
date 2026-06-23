'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Pencil, Trash2, Users, Gauge, Clock, ShieldAlert } from 'lucide-react'
import { fetchLeads, insertLead, updateLead, deleteLead } from '@/lib/db'
import { useAdminAuth } from '@/lib/AdminAuthContext'
import RestrictedValue from '@/components/ui/RestrictedValue'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'
import { priorityStyle, followupUrgency, qualityColor, slaRiskStyle } from '@/lib/badges'

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost']
const SOURCES = ['Inbound', 'Referral', 'Website', 'LinkedIn']
const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

const emptyForm = {
  company: '', contact: '', stage: 'New', source: SOURCES[0], owner: '', priority: 'medium',
  quality_score: '50', probability: '20', next_followup_at: '', sla_due_at: '', value: '',
}

export default function LeadsPage() {
  const { user } = useAdminAuth()
  const isFounder = user?.role === 'founder'
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [ownerFilter, setOwnerFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await fetchLeads()
      if (!error && data) setLeads(data)
      setLoading(false)
    }
    load()
  }, [])

  const owners = useMemo(() => Array.from(new Set(leads.map(l => l.owner).filter(Boolean))), [leads])

  const filtered = leads.filter(l => {
    if (search && !`${l.company} ${l.contact}`.toLowerCase().includes(search.toLowerCase())) return false
    if (stageFilter !== 'all' && l.stage !== stageFilter) return false
    if (sourceFilter !== 'all' && l.source !== sourceFilter) return false
    if (ownerFilter !== 'all' && l.owner !== ownerFilter) return false
    if (priorityFilter !== 'all' && (l.priority || 'medium') !== priorityFilter) return false
    return true
  })

  // ── KPIs ──
  const avgQuality = leads.length ? Math.round(leads.reduce((acc, l) => acc + (l.quality_score ?? 50), 0) / leads.length) : 0
  const now = new Date().getTime()
  const followupsDue = leads.filter(l => l.next_followup_at && new Date(l.next_followup_at).getTime() - now < 3 * 86400000 && !['Converted', 'Lost'].includes(l.stage)).length
  const slaAtRisk = leads.filter(l => {
    if (!l.sla_due_at || ['Converted', 'Lost'].includes(l.stage)) return false
    const days = Math.ceil((new Date(l.sla_due_at).getTime() - now) / 86400000)
    return days <= 1
  }).length

  function openAddModal() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEditModal(lead: any) {
    setEditingId(lead.id)
    setForm({
      company: lead.company || '',
      contact: lead.contact || '',
      stage: lead.stage || 'New',
      source: lead.source || SOURCES[0],
      owner: lead.owner || '',
      priority: lead.priority || 'medium',
      quality_score: String(lead.quality_score ?? 50),
      probability: String(lead.probability ?? 20),
      next_followup_at: lead.next_followup_at ? lead.next_followup_at.slice(0, 10) : '',
      sla_due_at: lead.sla_due_at ? lead.sla_due_at.slice(0, 10) : '',
      value: lead.value ? String(lead.value) : '',
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.company || !form.contact) return
    setSaving(true)
    const payload = {
      company: form.company,
      contact: form.contact,
      stage: form.stage,
      source: form.source,
      owner: form.owner || undefined,
      priority: form.priority,
      quality_score: Number(form.quality_score) || 50,
      probability: Number(form.probability) || 0,
      next_followup_at: form.next_followup_at || undefined,
      sla_due_at: form.sla_due_at || undefined,
      value: form.value ? Number(form.value) : 0,
    }

    if (editingId) {
      await updateLead(editingId, payload)
      setLeads(leads.map(l => l.id === editingId ? { ...l, ...payload } : l))
    } else {
      const { data } = await insertLead(payload)
      if (data) setLeads([data, ...leads])
    }
    setSaving(false)
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    setLeads(leads.filter(l => l.id !== id))
    await deleteLead(id)
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--cp-text)' }}>Leads</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--cp-text-faint)' }}>Track follow-ups, SLA risk, and lead quality across the pipeline.</p>
        </div>
        <button onClick={openAddModal} className="cp-btn-primary flex items-center gap-1.5 px-4 py-2 text-[12px]">
          <Plus className="w-3.5 h-3.5" /> New Lead
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Leads', value: String(leads.length), icon: Users, color: 'text-(--cp-text)' },
          { label: 'Avg Quality Score', value: String(avgQuality), icon: Gauge, color: 'text-(--cp-cyan)' },
          { label: 'Follow-ups Due (3d)', value: String(followupsDue), icon: Clock, color: followupsDue > 0 ? 'text-(--cp-amber)' : 'text-(--cp-text)' },
          { label: 'SLA At Risk', value: String(slaAtRisk), icon: ShieldAlert, color: slaAtRisk > 0 ? 'text-(--cp-red)' : 'text-(--cp-emerald)' },
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
      <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-45 flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)' }}>
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cp-text-faint)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or contact..."
            className="w-full bg-transparent border-none outline-none text-[13px] text-(--cp-text) placeholder:text-(--cp-text-faint)"
          />
        </div>
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="px-4 py-2.5 rounded-xl text-[12px] outline-none cursor-pointer [&>option]:bg-(--cp-bg-elevated) [&>option]:text-(--cp-text)" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-secondary)' }}>
          <option value="all">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="px-4 py-2.5 rounded-xl text-[12px] outline-none cursor-pointer [&>option]:bg-(--cp-bg-elevated) [&>option]:text-(--cp-text)" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-secondary)' }}>
          <option value="all">All Sources</option>
          {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} className="px-4 py-2.5 rounded-xl text-[12px] outline-none cursor-pointer [&>option]:bg-(--cp-bg-elevated) [&>option]:text-(--cp-text)" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-secondary)' }}>
          <option value="all">All Owners</option>
          {owners.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-4 py-2.5 rounded-xl text-[12px] outline-none cursor-pointer [&>option]:bg-(--cp-bg-elevated) [&>option]:text-(--cp-text)" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-secondary)' }}>
          <option value="all">All Priorities</option>
          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="cp-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-(--cp-border) border-t-(--cp-text-muted) rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--cp-text-faint)' }} />
            <p className="text-[13px]" style={{ color: 'var(--cp-text-muted)' }}>No leads found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--cp-border-soft)' }}>
                  {['Lead', 'Stage', 'Source', 'Owner', 'Priority', 'Quality', 'Conv. Prob.', 'Follow-up', 'SLA Risk', ...(isFounder ? ['Deal Value'] : []), ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-[9px] font-mono uppercase tracking-[0.15em] whitespace-nowrap" style={{ color: 'var(--cp-text-faint)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const pStyle = priorityStyle(l.priority)
                  const urgency = followupUrgency(l.next_followup_at)
                  const sla = slaRiskStyle(l.sla_due_at, ['Converted', 'Lost'].includes(l.stage))
                  return (
                    <tr key={l.id} className="border-b hover:bg-(--cp-bg-soft) transition-colors group" style={{ borderColor: 'var(--cp-border-soft)' }}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-[13px] font-medium" style={{ color: 'var(--cp-text)' }}>{l.company}</p>
                        <p className="text-[11px]" style={{ color: 'var(--cp-text-muted)' }}>{l.contact}</p>
                      </td>
                      <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ color: 'var(--cp-text-secondary)' }}>{l.stage}</td>
                      <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ color: 'var(--cp-text-muted)' }}>{l.source || '-'}</td>
                      <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ color: 'var(--cp-text-muted)' }}>{l.owner || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: pStyle.color, background: pStyle.bg, border: `1px solid ${pStyle.border}` }}>{pStyle.label}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="flex items-center gap-1 text-[12px] font-mono" style={{ color: qualityColor(l.quality_score) }}>
                          <Gauge className="w-3 h-3" /> {l.quality_score ?? 50}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-mono whitespace-nowrap" style={{ color: 'var(--cp-text-muted)' }}>{l.probability ?? 0}%</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {urgency ? (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: urgency.color, background: urgency.bg, border: `1px solid ${urgency.border}` }}>{urgency.label}</span>
                        ) : (
                          <span className="text-[11px]" style={{ color: 'var(--cp-text-faint)' }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: sla.color, background: sla.bg, border: `1px solid ${sla.border}` }}>{sla.label}</span>
                      </td>
                      {isFounder && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          <RestrictedValue value={l.value} className="text-[12px] font-mono text-(--cp-text-secondary)" />
                        </td>
                      )}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(l)} className="p-1.5 rounded-lg transition-all text-(--cp-text-faint) hover:text-(--cp-text) hover:bg-(--cp-bg-soft)"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(l.id)} className="p-1.5 rounded-lg transition-all text-(--cp-text-faint) hover:text-(--cp-red) hover:bg-(--cp-red-soft)"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Lead' : 'New Lead'} subtitle="Track lead details, ownership, and follow-up." width="max-w-2xl">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="Acme Corp" required />
            <ModalInput label="Contact Person" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} placeholder="John Doe" required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ModalSelect label="Stage" value={form.stage} onChange={(v) => setForm({ ...form, stage: v })} options={STAGES.map(s => ({ value: s, label: s }))} />
            <ModalSelect label="Source" value={form.source} onChange={(v) => setForm({ ...form, source: v })} options={SOURCES.map(s => ({ value: s, label: s }))} />
            <ModalSelect label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={PRIORITIES} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ModalInput label="Owner" value={form.owner} onChange={(v) => setForm({ ...form, owner: v })} placeholder="e.g. Priya" />
            <ModalInput label="Quality Score (0-100)" value={form.quality_score} onChange={(v) => setForm({ ...form, quality_score: v })} placeholder="50" type="number" />
            <ModalInput label="Conversion Prob. (%)" value={form.probability} onChange={(v) => setForm({ ...form, probability: v })} placeholder="20" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Next Follow-up" value={form.next_followup_at} onChange={(v) => setForm({ ...form, next_followup_at: v })} type="date" />
            <ModalInput label="SLA Due Date" value={form.sla_due_at} onChange={(v) => setForm({ ...form, sla_due_at: v })} type="date" />
          </div>
          {isFounder && (
            <ModalInput label="Deal Value (₹)" value={form.value} onChange={(v) => setForm({ ...form, value: v })} placeholder="100000" type="number" />
          )}
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium transition-colors text-(--cp-text-muted) hover:text-(--cp-text)">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.company || !form.contact} className="cp-btn-primary px-5 py-2 text-[12px]">
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
