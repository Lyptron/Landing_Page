'use client'
import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Plus, Trash2, Save } from 'lucide-react'
import {
  insertPayment, updatePayment, deletePayment,
  updateProject, insertExpense, deleteExpense, fetchProjectExpenses,
  fetchProjectInvoices, updateInvoice,
} from '@/lib/db'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'
import SalaryStepper from '@/components/ui/SalaryStepper'
import { useProject } from '@/lib/AdminProjectContext'
import { useAdminAuth } from '@/lib/AdminAuthContext'

const FinanceCharts = dynamic(() => import('./FinanceCharts'), { ssr: false })

const EXPENSE_CATEGORIES = [
  { value: 'tools', label: 'Tools & Software' },
  { value: 'salaries', label: 'Salaries' },
  { value: 'marketing', label: 'Marketing & Ads' },
  { value: 'operations', label: 'Operations' },
  { value: 'other', label: 'Other' },
]

type Founder = { id: string; name?: string; initials?: string; accent_color?: string }
type Expense = {
  id: string
  label: string
  category?: string
  amount: number
  expense_date: string
  founder_id?: string | null
  team_members?: Founder | null
}
type Invoice = {
  id: string
  invoice_number: string
  amount: number
  status: string
  issued_date?: string
  paid_date?: string | null
  reason?: string
}

export default function ProjectFinancePage() {
  const { projectId, project, payments, setPayments, allTeamMembers, loadProject } = useProject()
  const { user } = useAdminAuth()
  const isFounder = user?.role === 'founder'

  const founders: Founder[] = useMemo(
    () => (allTeamMembers || []).filter((m: any) => m.role === 'founder'),
    [allTeamMembers],
  )

  // ── Budget + splits (persisted on projects row) ──────────────
  const [totalAmount, setTotalAmount] = useState<string>('')
  const [splits, setSplits] = useState<Record<string, number>>({})
  const [savingBudget, setSavingBudget] = useState(false)
  const [budgetErr, setBudgetErr] = useState<string | null>(null)

  useEffect(() => {
    // Sync editable form state when the project reloads (post-save or nav).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotalAmount(String(project?.total_amount ?? ''))
    setSplits((project?.revenue_splits as Record<string, number>) || {})
  }, [project])

  const splitTotal = useMemo(
    () => Object.values(splits).reduce((s, v) => s + (Number(v) || 0), 0),
    [splits],
  )

  async function saveBudget() {
    setSavingBudget(true)
    setBudgetErr(null)
    const { error } = await updateProject(projectId, {
      total_amount: Number(totalAmount) || 0,
      revenue_splits: splits,
    })
    setSavingBudget(false)
    if (error) {
      console.error('[updateProject finance]', error)
      setBudgetErr(error.message || 'Save failed')
      return
    }
    await loadProject()
  }

  // ── Project invoices (money flowing INTO the pool) ──────────
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    let live = true
    fetchProjectInvoices(projectId).then(({ data, error }) => {
      if (!live) return
      if (error) console.error('[fetchProjectInvoices]', error)
      setInvoices((data as Invoice[]) || [])
    })
    return () => { live = false }
  }, [projectId])

  async function toggleInvoicePaid(inv: Invoice) {
    const next = inv.status === 'Paid' ? 'Pending' : 'Paid'
    const patch: Record<string, unknown> = { status: next }
    patch.paid_date = next === 'Paid' ? new Date().toISOString().slice(0, 10) : null
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, ...(patch as Partial<Invoice>) } : i))
    const { error } = await updateInvoice(inv.id, patch)
    if (error) {
      console.error('[updateInvoice]', error)
      setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: inv.status, paid_date: inv.paid_date } : i))
    }
  }

  // ── Expenses ─────────────────────────────────────────────────
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expLoading, setExpLoading] = useState(true)
  const [expModalOpen, setExpModalOpen] = useState(false)
  const [expForm, setExpForm] = useState({
    label: '', category: 'other', amount: '', expense_date: '', founder_id: '', notes: '',
  })
  const [savingExp, setSavingExp] = useState(false)
  const [expErr, setExpErr] = useState<string | null>(null)
  const [founderFilter, setFounderFilter] = useState<string>('all')

  useEffect(() => {
    let live = true
    async function load() {
      const { data, error } = await fetchProjectExpenses(projectId)
      if (!live) return
      if (error) console.error('[fetchProjectExpenses]', error)
      setExpenses((data as Expense[]) || [])
      setExpLoading(false)
    }
    load()
    return () => { live = false }
  }, [projectId])

  async function addExpense() {
    if (!expForm.label || !expForm.amount || !expForm.expense_date) return
    setSavingExp(true)
    setExpErr(null)
    const { data, error } = await insertExpense({
      label: expForm.label,
      category: expForm.category,
      amount: Number(expForm.amount),
      expense_date: expForm.expense_date,
      notes: expForm.notes || undefined,
      project_id: projectId,
      founder_id: expForm.founder_id || undefined,
    })
    setSavingExp(false)
    if (error) {
      console.error('[insertExpense]', error)
      setExpErr(error.message || 'Insert failed')
      return
    }
    if (data) setExpenses(prev => [data as Expense, ...prev])
    setExpForm({ label: '', category: 'other', amount: '', expense_date: '', founder_id: '', notes: '' })
    setExpModalOpen(false)
  }

  async function removeExpense(id: string) {
    setExpenses(prev => prev.filter(e => e.id !== id))
    await deleteExpense(id)
  }

  const filteredExpenses = useMemo(() => {
    if (founderFilter === 'all') return expenses
    if (founderFilter === 'unassigned') return expenses.filter(e => !e.founder_id)
    return expenses.filter(e => e.founder_id === founderFilter)
  }, [expenses, founderFilter])

  // ── Chart data ───────────────────────────────────────────────
  const total = Number(totalAmount) || 0
  const received = useMemo(
    () => invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + Number(i.amount || 0), 0),
    [invoices],
  )
  const remaining = Math.max(0, total - received)

  // Revenue pie is driven by RECEIVED money — what's actually in the pool.
  const revenueSlices = useMemo(() => {
    const rows = founders.map((f, i) => {
      const pct = Number(splits[f.id]) || 0
      return {
        name: f.name || f.initials || 'Founder',
        value: (received * pct) / 100,
        color: f.accent_color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      }
    }).filter(r => r.value > 0)
    const remainder = received - rows.reduce((s, r) => s + r.value, 0)
    if (remainder > 0.5) rows.push({ name: 'Unallocated', value: remainder, color: 'var(--cp-border)' })
    return rows
  }, [founders, splits, received])

  const expenseSlices = useMemo(() => {
    const byFounder = new Map<string, number>()
    let unassigned = 0
    for (const e of expenses) {
      if (e.founder_id) byFounder.set(e.founder_id, (byFounder.get(e.founder_id) || 0) + Number(e.amount || 0))
      else unassigned += Number(e.amount || 0)
    }
    const rows = founders.map((f, i) => ({
      name: f.name || f.initials || 'Founder',
      value: byFounder.get(f.id) || 0,
      color: f.accent_color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    })).filter(r => r.value > 0)
    if (unassigned > 0) rows.push({ name: 'Unassigned', value: unassigned, color: 'var(--cp-border)' })
    return rows
  }, [expenses, founders])

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount || 0), 0), [expenses])

  return (
    <div className="flex flex-col gap-5">
      {/* ── Budget + split editor ─────────────────────────────── */}
      <div className="cp-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[13px] font-bold text-(--cp-text-secondary)">Project Budget & Revenue Split</h3>
            <p className="text-[11px] text-(--cp-text-faint) mt-0.5">
              Total contract value and how it&apos;s divided among founders.
            </p>
          </div>
          {isFounder && (
            <button
              onClick={saveBudget}
              disabled={savingBudget}
              className="cp-btn-primary px-4 py-2 text-[11px] flex items-center gap-1.5 disabled:opacity-30"
            >
              <Save className="w-3.5 h-3.5" />
              {savingBudget ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-(--cp-text-faint) mb-2 block">Total Project Amount (₹)</label>
            <input
              type="number"
              value={totalAmount}
              disabled={!isFounder}
              onChange={e => setTotalAmount(e.target.value)}
              placeholder="500000"
              className="w-full px-3 py-2 rounded-xl bg-(--cp-bg-soft) border border-(--cp-border-soft) text-[14px] font-mono text-(--cp-text) disabled:opacity-60"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Kpi label="Received" value={received} tone="emerald" />
            <Kpi label="Remaining" value={remaining} tone="amber" />
            <Kpi label="Split" value={`${splitTotal}%`} tone={splitTotal === 100 ? 'emerald' : 'amber'} isMoney={false} />
          </div>
        </div>

        {founders.length === 0 ? (
          <p className="text-[11px] text-(--cp-text-faint) italic">No founders in team_members yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {founders.map(f => (
              <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-(--cp-bg-soft) border border-(--cp-border-soft)">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: f.accent_color || '#666' }}
                >
                  {f.initials}
                </span>
                <span className="text-[12px] font-medium text-(--cp-text) flex-1">{f.name}</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={splits[f.id] ?? ''}
                  disabled={!isFounder}
                  onChange={e => setSplits({ ...splits, [f.id]: Number(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-20 px-2 py-1.5 rounded-lg bg-(--cp-bg) border border-(--cp-border-soft) text-[12px] font-mono text-right text-(--cp-text) disabled:opacity-60"
                />
                <span className="text-[11px] font-mono text-(--cp-text-faint) w-6">%</span>
                <span
                  className="text-[11px] font-mono text-(--cp-text-muted) w-32 text-right"
                  title={`Received: ₹${((received * (Number(splits[f.id]) || 0)) / 100).toLocaleString('en-IN')} · Contract: ₹${((total * (Number(splits[f.id]) || 0)) / 100).toLocaleString('en-IN')}`}
                >
                  ₹{((received * (Number(splits[f.id]) || 0)) / 100).toLocaleString('en-IN')}
                  <span className="text-(--cp-text-faint)"> / ₹{((total * (Number(splits[f.id]) || 0)) / 100).toLocaleString('en-IN')}</span>
                </span>
              </div>
            ))}
          </div>
        )}
        {budgetErr && <p className="text-[11px] text-(--cp-red) mt-3 font-medium">DB error: {budgetErr}</p>}
      </div>

      {/* ── Pie charts ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="cp-card p-5">
          <h3 className="text-[13px] font-bold text-(--cp-text-secondary) mb-1">Revenue Split</h3>
          <p className="text-[11px] text-(--cp-text-faint) mb-3">₹{received.toLocaleString('en-IN')} received of ₹{total.toLocaleString('en-IN')} — divided by split %.</p>
          <div className="h-[240px]">
            <FinanceCharts data={revenueSlices} emptyLabel="Mark an invoice as Paid to see the split." />
          </div>
        </div>
        <div className="cp-card p-5">
          <h3 className="text-[13px] font-bold text-(--cp-text-secondary) mb-1">Spending by Founder</h3>
          <p className="text-[11px] text-(--cp-text-faint) mb-3">₹{totalSpent.toLocaleString('en-IN')} spent on this project.</p>
          <div className="h-[240px]">
            <FinanceCharts data={expenseSlices} emptyLabel="No expenses logged yet." />
          </div>
        </div>
      </div>

      {/* ── Project invoices (money in) ───────────────────────── */}
      <div className="cp-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[13px] font-bold text-(--cp-text-secondary)">Invoices for this project</h3>
            <p className="text-[11px] text-(--cp-text-faint) mt-0.5">Toggle status to move an invoice between Pending and Paid.</p>
          </div>
          <span className="text-[10px] font-mono text-(--cp-text-faint)">{invoices.length} · ₹{received.toLocaleString('en-IN')} received</span>
        </div>
        <div className="flex flex-col gap-2">
          {invoices.length === 0 ? (
            <p className="text-[11px] text-(--cp-text-faint) italic p-4 text-center">No invoices linked to this project. Create one from the main Finance page.</p>
          ) : invoices.map(inv => (
            <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-(--cp-bg-soft) border border-(--cp-border-soft)">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => isFounder && toggleInvoicePaid(inv)}
                  disabled={!isFounder}
                  title={inv.status === 'Paid' ? 'Click to mark Pending' : 'Click to mark Paid'}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-colors ${
                    inv.status === 'Paid'
                      ? 'bg-(--cp-emerald-soft) border-(--cp-emerald-border) text-(--cp-emerald)'
                      : 'bg-(--cp-amber-soft) border-(--cp-amber-border) text-(--cp-amber)'
                  } ${isFounder ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                >
                  {inv.status}
                </button>
                <div>
                  <div className="text-[12px] font-medium text-(--cp-text)">{inv.invoice_number}</div>
                  <div className="text-[10px] text-(--cp-text-faint)">
                    Issued {inv.issued_date}
                    {inv.paid_date && <> · Paid {inv.paid_date}</>}
                    {inv.reason && <> · {inv.reason}</>}
                  </div>
                </div>
              </div>
              <span className="text-[13px] font-mono font-semibold text-(--cp-text)">₹{Number(inv.amount).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Per-founder expense view ──────────────────────────── */}
      <div className="cp-card p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div>
            <h3 className="text-[13px] font-bold text-(--cp-text-secondary)">Expenses</h3>
            <p className="text-[11px] text-(--cp-text-faint) mt-0.5">{filteredExpenses.length} of {expenses.length} shown</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-0.5 bg-(--cp-bg-soft) rounded-lg border border-(--cp-border-soft)">
              <FounderTab active={founderFilter === 'all'} onClick={() => setFounderFilter('all')} label="All" />
              {founders.map(f => (
                <FounderTab
                  key={f.id}
                  active={founderFilter === f.id}
                  onClick={() => setFounderFilter(f.id)}
                  label={f.initials || f.name || 'F'}
                  color={f.accent_color}
                />
              ))}
              <FounderTab active={founderFilter === 'unassigned'} onClick={() => setFounderFilter('unassigned')} label="—" />
            </div>
            {isFounder && (
              <button onClick={() => setExpModalOpen(true)} className="cp-btn-primary px-3 py-1.5 text-[11px] flex items-center gap-1">
                <Plus className="w-3 h-3" /> Expense
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {expLoading ? (
            <p className="text-[11px] text-(--cp-text-faint) italic">Loading...</p>
          ) : filteredExpenses.length === 0 ? (
            <p className="text-[11px] text-(--cp-text-faint) italic p-4 text-center">No expenses for this view.</p>
          ) : filteredExpenses.map(e => {
            const founder = founders.find(f => f.id === e.founder_id)
            return (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-(--cp-bg-soft) border border-(--cp-border-soft) group">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                    style={{ backgroundColor: founder?.accent_color || 'var(--cp-border)' }}
                  >
                    {founder?.initials || '—'}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-medium text-(--cp-text) truncate">{e.label}</div>
                    <div className="text-[10px] text-(--cp-text-faint)">
                      {e.category} · {e.expense_date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[13px] font-mono font-semibold text-(--cp-text)">₹{Number(e.amount).toLocaleString('en-IN')}</span>
                  {isFounder && (
                    <button
                      onClick={() => removeExpense(e.id)}
                      className="p-1 text-(--cp-text-faint) hover:text-(--cp-red) opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Payment milestones (kept from original) ───────────── */}
      <PaymentMilestones
        payments={payments}
        setPayments={setPayments}
        projectId={projectId}
        canEdit={isFounder}
      />

      {/* ── Add-expense modal ─────────────────────────────────── */}
      <Modal open={expModalOpen} onClose={() => setExpModalOpen(false)} title="Add Expense" subtitle="Log a project expense.">
        <div className="flex flex-col gap-4">
          <ModalInput label="Label" value={expForm.label} onChange={v => setExpForm({ ...expForm, label: v })} placeholder="e.g. Figma seat" required />
          <div className="grid grid-cols-2 gap-4">
            <ModalSelect label="Category" value={expForm.category} onChange={v => setExpForm({ ...expForm, category: v })} options={EXPENSE_CATEGORIES} />
            <ModalSelect
              label="Spent by"
              value={expForm.founder_id}
              onChange={v => setExpForm({ ...expForm, founder_id: v })}
              options={[{ value: '', label: 'Unassigned' }, ...founders.map(f => ({ value: f.id, label: f.name || f.initials || 'Founder' }))]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SalaryStepper label="Amount (₹)" value={expForm.amount} onChange={v => setExpForm({ ...expForm, amount: v })} placeholder="5000" required />
            <ModalInput label="Date" type="date" value={expForm.expense_date} onChange={v => setExpForm({ ...expForm, expense_date: v })} required />
          </div>
          {expErr && <p className="text-[11px] text-(--cp-red) font-medium">DB error: {expErr}</p>}
          <div className="flex justify-end gap-3 pt-4 border-t border-(--cp-border-soft)">
            <button onClick={() => setExpModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-(--cp-text-muted) hover:text-(--cp-text)">Cancel</button>
            <button
              onClick={addExpense}
              disabled={savingExp || !expForm.label || !expForm.amount || !expForm.expense_date}
              className="cp-btn-primary px-5 py-2 text-[12px] disabled:opacity-30"
            >
              {savingExp ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── Bits ────────────────────────────────────────────────────────
function Kpi({ label, value, tone, isMoney = true }: { label: string; value: number | string; tone: 'emerald' | 'amber'; isMoney?: boolean }) {
  const color = tone === 'emerald' ? 'text-(--cp-emerald)' : 'text-(--cp-amber)'
  const text = isMoney ? `₹${Number(value).toLocaleString('en-IN')}` : String(value)
  return (
    <div className="p-2.5 rounded-xl bg-(--cp-bg-soft) border border-(--cp-border-soft)">
      <div className="text-[9px] font-semibold uppercase tracking-widest text-(--cp-text-faint)">{label}</div>
      <div className={`text-[14px] font-mono font-semibold mt-1 ${color}`}>{text}</div>
    </div>
  )
}

function FounderTab({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${
        active ? 'bg-(--cp-bg) text-(--cp-text) shadow-sm' : 'text-(--cp-text-faint) hover:text-(--cp-text-muted)'
      }`}
      style={active && color ? { color } : undefined}
    >
      {label}
    </button>
  )
}

function PaymentMilestones({ payments, setPayments, projectId, canEdit }: {
  payments: any[]
  setPayments: (u: any) => void
  projectId: string
  canEdit: boolean
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formAmount, setFormAmount] = useState('')

  async function handleAdd() {
    if (!formAmount) return
    setSaving(true)
    const { data } = await insertPayment({ amount: Number(formAmount), status: 'pending', project_id: projectId })
    if (data) setPayments((prev: any[]) => [...prev, data])
    setFormAmount('')
    setSaving(false)
    setModalOpen(false)
  }

  async function toggleStatus(p: any) {
    const ns = p.status === 'paid' ? 'pending' : 'paid'
    setPayments(payments.map((x: any) => x.id === p.id ? { ...x, status: ns } : x))
    await updatePayment(p.id, { status: ns })
  }

  return (
    <div className="cp-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold text-(--cp-text-secondary)">Payment Milestones</h3>
        <span className="text-[10px] font-mono text-(--cp-text-faint)">{payments.length} total</span>
      </div>
      <div className="flex flex-col gap-2">
        {payments.map((p: any) => (
          <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-(--cp-bg-soft) border border-(--cp-border-soft)">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleStatus(p)}
                disabled={!canEdit}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-colors ${
                  p.status === 'paid'
                    ? 'bg-(--cp-emerald-soft) border-(--cp-emerald-border) text-(--cp-emerald)'
                    : 'bg-(--cp-amber-soft) border-(--cp-amber-border) text-(--cp-amber)'
                } ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {p.status}
              </button>
              <span className="text-[14px] font-mono font-semibold text-(--cp-text)">₹{(p.amount || 0).toLocaleString('en-IN')}</span>
            </div>
            {canEdit && (
              <button
                onClick={async () => { await deletePayment(p.id); setPayments(payments.filter((x: any) => x.id !== p.id)) }}
                className="p-1.5 text-(--cp-text-faint) hover:text-(--cp-red) transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {canEdit && (
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-(--cp-text-faint) hover:text-(--cp-text-muted) hover:bg-(--cp-bg-soft) transition-colors border border-dashed border-(--cp-border) justify-center">
            <Plus className="w-3.5 h-3.5" /> Add Payment Milestone
          </button>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Payment">
        <div className="flex flex-col gap-4">
          <SalaryStepper label="Amount (₹)" value={formAmount} onChange={setFormAmount} placeholder="50000" required />
          <div className="flex justify-end gap-3 pt-4 border-t border-(--cp-border-soft)">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-(--cp-text-muted) hover:text-(--cp-text)">Cancel</button>
            <button onClick={handleAdd} disabled={saving || !formAmount} className="cp-btn-primary px-5 py-2 text-[12px]">
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

const DEFAULT_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899']
