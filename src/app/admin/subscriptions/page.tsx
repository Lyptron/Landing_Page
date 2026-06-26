'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, CreditCard, Wallet, AlertTriangle, Boxes, Pencil, Trash2, Search } from 'lucide-react'
import { fetchSubscriptions, insertSubscription, updateSubscription, deleteSubscription, fetchExpenses } from '@/lib/db'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'
import SalaryStepper from '@/components/ui/SalaryStepper'

const CATEGORIES = [
  { value: 'ai_tools', label: 'AI Tools' },
  { value: 'hosting', label: 'Hosting' },
  { value: 'domains', label: 'Domains' },
  { value: 'ads', label: 'Ad Tools' },
  { value: 'crm_tools', label: 'CRM Tools' },
  { value: 'design_tools', label: 'Design Tools' },
  { value: 'other', label: 'Other' },
]

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'expiring', label: 'Expiring' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'planned', label: 'Planned' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one_time', label: 'One-time' },
]

const categoryLabel = (value: string) => CATEGORIES.find(c => c.value === value)?.label || value

function statusStyle(status: string) {
  if (status === 'active') return 'bg-(--cp-emerald-soft) text-(--cp-emerald) border-(--cp-emerald-border)'
  if (status === 'expiring') return 'bg-(--cp-amber-soft) text-(--cp-amber) border-(--cp-amber-border)'
  if (status === 'cancelled') return 'bg-(--cp-surface) text-(--cp-text-faint) border-(--cp-border-soft)'
  return 'bg-(--cp-cyan-soft) text-(--cp-cyan) border-(--cp-cyan-border)'
}

function priorityStyle(priority: string) {
  if (priority === 'high') return 'bg-(--cp-red-soft) text-(--cp-red) border-(--cp-red-border)'
  if (priority === 'medium') return 'bg-(--cp-amber-soft) text-(--cp-amber) border-(--cp-amber-border)'
  return 'bg-(--cp-surface) text-(--cp-text-faint) border-(--cp-border-soft)'
}

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const emptyForm = {
  name: '',
  category: 'other',
  monthly_cost: '',
  yearly_cost: '',
  billing_cycle: 'monthly',
  renewal_date: '',
  owner: '',
  status: 'active',
  priority: 'medium',
  notes: '',
}

export default function SubscriptionPlanningPage() {
  const [subs, setSubs] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const [subRes, expRes] = await Promise.all([fetchSubscriptions(), fetchExpenses()])
    if (!subRes.error && subRes.data) setSubs(subRes.data)
    if (!expRes.error && expRes.data) setExpenses(expRes.data)
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  const filtered = useMemo(() => {
    return subs.filter((s) => {
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (priorityFilter !== 'all' && s.priority !== priorityFilter) return false
      if (search && !`${s.name} ${s.owner || ''}`.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [subs, search, categoryFilter, statusFilter, priorityFilter])

  const totals = useMemo(() => {
    const active = subs.filter(s => s.status === 'active' || s.status === 'expiring')
    const monthly = active.reduce((acc, s) => acc + (Number(s.monthly_cost) || 0), 0)
    const yearly = active.reduce((acc, s) => acc + (Number(s.yearly_cost) || 0), 0)
    const renewalsSoon = subs.filter(s => {
      const d = daysUntil(s.renewal_date)
      return d !== null && d >= 0 && d <= 30
    }).length
    return { monthly, yearly, renewalsSoon, activeCount: active.length }
  }, [subs])

  function openAddModal() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEditModal(sub: any) {
    setEditingId(sub.id)
    setForm({
      name: sub.name || '',
      category: sub.category || 'other',
      monthly_cost: sub.monthly_cost != null ? String(sub.monthly_cost) : '',
      yearly_cost: sub.yearly_cost != null ? String(sub.yearly_cost) : '',
      billing_cycle: sub.billing_cycle || 'monthly',
      renewal_date: sub.renewal_date || '',
      owner: sub.owner || '',
      status: sub.status || 'active',
      priority: sub.priority || 'medium',
      notes: sub.notes || '',
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name) return
    setSaving(true)
    const payload = {
      name: form.name,
      category: form.category,
      monthly_cost: form.monthly_cost ? Number(form.monthly_cost) : 0,
      yearly_cost: form.yearly_cost ? Number(form.yearly_cost) : 0,
      billing_cycle: form.billing_cycle,
      renewal_date: form.renewal_date || undefined,
      owner: form.owner || undefined,
      status: form.status,
      priority: form.priority,
      notes: form.notes || undefined,
    }

    if (editingId) {
      await updateSubscription(editingId, payload)
      setSubs(subs.map(s => s.id === editingId ? { ...s, ...payload } : s))
    } else {
      const { data } = await insertSubscription(payload)
      if (data) setSubs([data, ...subs])
    }
    setSaving(false)
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    setSubs(subs.filter(s => s.id !== id))
    await deleteSubscription(id)
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-(--cp-text)">Subscription Planning</h1>
          <p className="text-(--cp-text-faint) text-[13px] mt-0.5">Founder-only — track tools, software, and recurring business expenses.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-1.5 px-4 py-2 bg-(--cp-cyan) text-white font-semibold text-[12px] rounded-xl hover:bg-(--cp-cyan-strong) transition-all" style={{ boxShadow: '0 0 12px color-mix(in srgb, var(--cp-cyan) 30%, transparent)' }}>
          <Plus className="w-3.5 h-3.5" /> Add Subscription
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Monthly Spend', value: `₹${totals.monthly.toLocaleString('en-IN')}`, icon: Wallet, color: 'text-(--cp-text)' },
          { label: 'Yearly Spend', value: `₹${totals.yearly.toLocaleString('en-IN')}`, icon: CreditCard, color: 'text-(--cp-text)' },
          { label: 'Renewals Due (30d)', value: String(totals.renewalsSoon), icon: AlertTriangle, color: totals.renewalsSoon > 0 ? 'text-(--cp-amber)' : 'text-(--cp-text)' },
          { label: 'Active Tools', value: String(totals.activeCount), icon: Boxes, color: 'text-(--cp-emerald)' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl flex items-start justify-between"
            style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}
          >
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-(--cp-text-faint) mb-1">{kpi.label}</p>
              <p className={`text-[22px] font-display font-bold tracking-tight ${kpi.color}`}>{kpi.value}</p>
            </div>
            <kpi.icon className={`w-5 h-5 ${kpi.color} opacity-50`} />
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
          <Search className="w-3.5 h-3.5 text-(--cp-text-faint) shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tool or owner..."
            className="w-full bg-transparent border-none outline-none text-[13px] text-(--cp-text) placeholder:text-(--cp-text-faint)"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2.5 rounded-xl text-[12px] text-(--cp-text-secondary) outline-none cursor-pointer" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl text-[12px] text-(--cp-text-secondary) outline-none cursor-pointer" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-4 py-2.5 rounded-xl text-[12px] text-(--cp-text-secondary) outline-none cursor-pointer" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
          <option value="all">All Priorities</option>
          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-(--cp-border) border-t-(--cp-text-muted) rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard className="w-8 h-8 text-(--cp-text-faint) mx-auto mb-3" />
            <p className="text-(--cp-text-faint) text-[13px]">No subscriptions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-(--cp-border-soft)">
                  {['Tool', 'Category', 'Monthly', 'Yearly', 'Renewal', 'Owner', 'Billed Ledger', 'Status', 'Priority', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-(--cp-text-faint) whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const days = daysUntil(s.renewal_date)
                  const linkedExps = expenses.filter(e => e.subscription_id === s.id)
                  const totalBilled = linkedExps.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
                  return (
                    <tr key={s.id} className="border-b border-(--cp-border-soft) hover:bg-(--cp-surface-strong) transition-colors group">
                      <td className="px-4 py-3 text-[13px] font-medium text-(--cp-text) whitespace-nowrap">{s.name}</td>
                      <td className="px-4 py-3 text-[12px] text-(--cp-text-muted) whitespace-nowrap">{categoryLabel(s.category)}</td>
                      <td className="px-4 py-3 text-[12px] font-mono text-(--cp-text-secondary) whitespace-nowrap">₹{Number(s.monthly_cost || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-[12px] font-mono text-(--cp-text-secondary) whitespace-nowrap">₹{Number(s.yearly_cost || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-[12px] font-mono whitespace-nowrap">
                        <span className={days !== null && days <= 30 && days >= 0 ? 'text-(--cp-amber)' : 'text-(--cp-text-muted)'}>
                          {s.renewal_date || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-(--cp-text-muted) whitespace-nowrap">{s.owner || '-'}</td>
                      <td className="px-4 py-3 text-[12px] font-mono whitespace-nowrap">
                        <div className="flex flex-col leading-tight">
                          <span className="text-(--cp-text-secondary) font-semibold">₹{totalBilled.toLocaleString('en-IN')}</span>
                          <span className="text-[9.5px] text-(--cp-text-faint)">{linkedExps.length} {linkedExps.length === 1 ? 'charge' : 'charges'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${statusStyle(s.status)}`}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${priorityStyle(s.priority)}`}>{s.priority}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(s)} className="p-1.5 rounded-lg text-(--cp-text-faint) hover:text-(--cp-text-secondary) hover:bg-(--cp-surface-strong) transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-(--cp-text-faint) hover:text-(--cp-red) hover:bg-(--cp-red-soft) transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Subscription' : 'Add Subscription'} subtitle="Track a business tool or recurring expense." width="max-w-2xl">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Tool / Subscription Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Claude, AWS, Figma" required />
            <ModalSelect label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATEGORIES} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SalaryStepper label="Monthly Cost (₹)" value={form.monthly_cost} onChange={(v) => setForm({ ...form, monthly_cost: v })} placeholder="0" />
            <SalaryStepper label="Yearly Cost (₹)" value={form.yearly_cost} onChange={(v) => setForm({ ...form, yearly_cost: v })} placeholder="0" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalSelect label="Billing Cycle" value={form.billing_cycle} onChange={(v) => setForm({ ...form, billing_cycle: v })} options={BILLING_CYCLES} />
            <ModalInput label="Renewal Date" value={form.renewal_date} onChange={(v) => setForm({ ...form, renewal_date: v })} type="date" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ModalInput label="Owner" value={form.owner} onChange={(v) => setForm({ ...form, owner: v })} placeholder="e.g. Founder" />
            <ModalSelect label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={STATUSES} />
            <ModalSelect label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={PRIORITIES} />
          </div>
          <ModalInput label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Optional notes (renewal terms, future plans, etc.)" />

          <div className="flex justify-end gap-3 pt-4 border-t border-(--cp-border-soft)">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-(--cp-text-faint) hover:text-(--cp-text-secondary) transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.name} className="px-5 py-2 bg-(--cp-cyan) text-white font-semibold text-[12px] rounded-xl hover:bg-(--cp-cyan-strong) transition-all disabled:opacity-30">
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Subscription'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
