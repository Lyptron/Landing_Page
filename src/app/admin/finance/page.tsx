'use client'
import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Plus, Receipt, Wallet, TrendingDown, Trash2, Users2, Search, ArrowUpDown, Activity, Percent, UserMinus } from 'lucide-react'
import { motion } from 'framer-motion'
import { fetchInvoices, fetchAllPayments, insertInvoice, deleteInvoice, fetchExpenses, insertExpense, deleteExpense, fetchTeamMembers, updateTeamMember, fetchSubscriptions, fetchProjects } from '@/lib/db'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'
import { useChartTheme } from '@/lib/theme/chartTheme'
import SalaryStepper from '@/components/ui/SalaryStepper'

const MrrChart = dynamic(() => import('./MrrChart'), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
})

const EXPENSE_CATEGORIES = [
  { value: 'tools', label: 'Tools & Software' },
  { value: 'salaries', label: 'Salaries' },
  { value: 'marketing', label: 'Marketing & Ads' },
  { value: 'operations', label: 'Operations' },
  { value: 'other', label: 'Other' },
]

export default function FinanceHubPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formNumber, setFormNumber] = useState('')
  const [formClient, setFormClient] = useState('')
  const [formReason, setFormReason] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [saving, setSaving] = useState(false)

  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [expForm, setExpForm] = useState({ label: '', category: 'other', amount: '', expense_date: '', subscription_id: '', notes: '' })
  const [savingExpense, setSavingExpense] = useState(false)

  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [formProjectId, setFormProjectId] = useState('')

  // In-app confirmation (replaces native confirm()).
  const [confirmAction, setConfirmAction] = useState<null | {
    title: string
    body: string
    confirmLabel: string
    onConfirm: () => void
  }>(null)

  const chartTheme = useChartTheme()

  useEffect(() => {
    async function load() {
      const [invRes, payRes, expRes, teamRes, subRes, projRes] = await Promise.all([
        fetchInvoices(),
        fetchAllPayments(),
        fetchExpenses(),
        fetchTeamMembers(),
        fetchSubscriptions(),
        fetchProjects(),
      ])
      if (!invRes.error && invRes.data) setInvoices(invRes.data)
      if (!payRes.error && payRes.data) setPayments(payRes.data)
      if (!expRes.error && expRes.data) setExpenses(expRes.data)
      if (!teamRes.error && teamRes.data) setTeamMembers(teamRes.data)
      if (!subRes.error && subRes.data) setSubscriptions(subRes.data)
      if (!projRes.error && projRes.data) setProjects(projRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const addInvoice = async () => {
    if (!formNumber || !formClient || !formAmount) return
    // Enforce: must link to a project OR provide a reason
    if (!formProjectId && !formReason.trim()) return
    setSaving(true)
    const { data } = await insertInvoice({
      invoice_number: formNumber,
      client_name: formClient,
      amount: Number(formAmount),
      status: 'Pending',
      reason: formReason || undefined,
      project_id: formProjectId || undefined,
    })
    if (data) setInvoices([data, ...invoices])
    setFormNumber(''); setFormClient(''); setFormReason(''); setFormAmount(''); setFormProjectId(''); setSaving(false); setModalOpen(false)
  }

  const addExpense = async () => {
    if (!expForm.label || !expForm.amount || !expForm.expense_date) return
    setSavingExpense(true)
    const { data } = await insertExpense({
      label: expForm.label,
      category: expForm.category,
      amount: Number(expForm.amount),
      expense_date: expForm.expense_date,
      subscription_id: expForm.subscription_id || undefined,
      notes: expForm.notes || undefined,
    })
    if (data) setExpenses([data, ...expenses])
    setExpForm({ label: '', category: 'other', amount: '', expense_date: '', subscription_id: '', notes: '' })
    setSavingExpense(false); setExpenseModalOpen(false)
  }

  const removeExpense = async (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id))
    await deleteExpense(id)
  }

  const removeInvoice = (id: string, number: string) => {
    setConfirmAction({
      title: 'Delete invoice',
      body: `Permanently delete invoice ${number}? This cannot be undone.`,
      confirmLabel: 'Delete invoice',
      onConfirm: async () => {
        setInvoices(prev => prev.filter(inv => inv.id !== id))
        await deleteInvoice(id)
      },
    })
  }

  // Offboard a member who has left. Soft-delete (is_active = false) so
  // payroll totals/headcount recalc but their history is preserved.
  const offboardMember = (id: string, name: string) => {
    setConfirmAction({
      title: 'Offboard member',
      body: `${name || 'This member'} will be removed from payroll and headcount. Their history is kept, and this can be undone later.`,
      confirmLabel: 'Offboard',
      onConfirm: async () => {
        setTeamMembers(prev => prev.filter(m => m.id !== id))
        await updateTeamMember(id, { is_active: false })
      },
    })
  }

  const updateSalary = async (id: string, value: string) => {
    const monthly_salary = Number(value) || 0
    setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, monthly_salary } : m))
    await updateTeamMember(id, { monthly_salary })
  }

  const dynamicMrrData = useMemo(() => {
    const months: { key: string; name: string }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      months.push({
        key: `${year}-${month}`,
        name: d.toLocaleDateString('en-US', { month: 'short' })
      })
    }

    const totalPayroll = teamMembers.reduce((acc, m) => acc + (Number(m.monthly_salary) || 0), 0)
    const totalSubsCost = subscriptions
      .filter(s => s.status === 'active' || s.status === 'expiring')
      .reduce((acc, s) => {
        const cost = Number(s.monthly_cost) || 0
        if (s.billing_cycle === 'yearly') {
          return acc + (Number(s.yearly_cost) || 0) / 12
        }
        return acc + cost
      }, 0)

    const baselineExpenses = totalPayroll + totalSubsCost

    return months.map(({ key, name }) => {
      let monthlyRevenue = 0
      invoices.forEach(inv => {
        if (inv.status === 'Paid') {
          const dateStr = inv.paid_date || inv.issued_date || inv.created_at
          if (dateStr && dateStr.startsWith(key)) {
            monthlyRevenue += Number(inv.amount) || 0
          }
        }
      })
      payments.forEach(p => {
        if (p.status === 'paid') {
          const dateStr = p.paid_at || p.created_at
          if (dateStr && dateStr.startsWith(key)) {
            monthlyRevenue += Number(p.amount) || 0
          }
        }
      })

      let monthlyLoggedExpenses = 0
      expenses.forEach(e => {
        if (e.expense_date && e.expense_date.startsWith(key)) {
          monthlyLoggedExpenses += Number(e.amount) || 0
        }
      })

      return {
        name,
        mrr: monthlyRevenue,
        expenses: monthlyLoggedExpenses + baselineExpenses,
      }
    })
  }, [invoices, payments, expenses, teamMembers, subscriptions])

  const unifiedInvoices = useMemo(() => {
    const mappedInvoices = invoices.map(inv => ({
      id: inv.id,
      invoice_number: inv.invoice_number || `INV-${inv.id?.slice(0, 8).toUpperCase()}`,
      client_name: inv.client_name,
      amount: Number(inv.amount) || 0,
      status: inv.status,
      issued_date: inv.issued_date || inv.created_at?.split('T')[0] || '-',
      reason: inv.reason || 'General Invoice',
      projectName: inv.projects?.name || null,
      isPayment: false,
    }))

    const mappedPayments = payments.map(p => {
      const projName = p.projects?.name || 'Project Inflow'
      const clientCompany = p.projects?.clients?.company || p.projects?.client_email || 'Direct Client'
      const displayName = clientCompany ? `${clientCompany} (${projName})` : projName
      let status = 'Pending'
      if (p.status === 'paid') status = 'Paid'
      else if (p.status === 'overdue') status = 'Overdue'

      const dateStr = p.paid_at || p.created_at
      const issued_date = dateStr ? dateStr.split('T')[0] : '-'

      return {
        id: p.id,
        invoice_number: p.invoice_number || `PMT-${p.id?.slice(0, 8).toUpperCase()}`,
        client_name: displayName,
        amount: Number(p.amount) || 0,
        status: status,
        issued_date: issued_date,
        reason: p.description || 'Project milestone payment',
        projectName: projName,
        isPayment: true,
      }
    })

    return [...mappedInvoices, ...mappedPayments].sort((a, b) => b.issued_date.localeCompare(a.issued_date))
  }, [invoices, payments])

  const totalMonthlyPayroll = teamMembers.reduce((acc, m) => acc + (Number(m.monthly_salary) || 0), 0)
  const ledgerTotal = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0)
  const currentMonthData = dynamicMrrData[dynamicMrrData.length - 1] || { mrr: 0, expenses: 0 }
  const latestMrr = currentMonthData.mrr
  const latestExpenses = currentMonthData.expenses
  const netMargin = latestMrr > 0 ? ((latestMrr - latestExpenses) / latestMrr * 100).toFixed(1) : '0'

  const statusStyle = (s: string) => {
    if (s === 'Paid') return 'bg-(--cp-emerald-soft) text-(--cp-emerald) border-(--cp-emerald-border)'
    if (s === 'Overdue') return 'bg-(--cp-red-soft) text-(--cp-red) border-(--cp-red-border)'
    return 'bg-(--cp-amber-soft) text-(--cp-amber) border-(--cp-amber-border)'
  }
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'expenses' | 'payroll'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'salary-desc' | 'salary-asc' | 'name-asc'>('salary-desc')

  const activeCount = teamMembers.length
  const avgSalary = activeCount > 0 ? totalMonthlyPayroll / activeCount : 0
  const membersWithSalary = teamMembers.filter(m => (m.monthly_salary || 0) > 0)

  const filteredTeamMembers = teamMembers
    .filter((m) => {
      const query = searchQuery.toLowerCase().trim()
      if (!query) return true
      const nameMatch = m.name?.toLowerCase().includes(query)
      const roleMatch = (m.title || m.role || '').toLowerCase().includes(query)
      const skillsMatch = m.skills?.some((s: string) => s.toLowerCase().includes(query))
      return nameMatch || roleMatch || skillsMatch
    })
    .sort((a, b) => {
      if (sortBy === 'salary-desc') {
        return (b.monthly_salary || 0) - (a.monthly_salary || 0)
      }
      if (sortBy === 'salary-asc') {
        return (a.monthly_salary || 0) - (b.monthly_salary || 0)
      }
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '')
      }
      return 0
    })

  const expenseCategoryLabel = (value: string) => EXPENSE_CATEGORIES.find(c => c.value === value)?.label || value || 'Other'

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-(--cp-text)">Finances</h1>
          <p className="text-(--cp-text-faint) text-[13px] mt-0.5">Revenue, expenses, and invoices.</p>
        </div>
        <div>
          {activeTab === 'invoices' && (
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-(--cp-cyan) text-white font-semibold text-[12px] rounded-xl hover:bg-(--cp-cyan-strong) transition-all" style={{ boxShadow: '0 0 12px color-mix(in srgb, var(--cp-cyan) 30%, transparent)' }}>
              <Plus className="w-3.5 h-3.5" /> New Invoice
            </button>
          )}
          {activeTab === 'expenses' && (
            <button onClick={() => setExpenseModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-(--cp-cyan) text-white font-semibold text-[12px] rounded-xl hover:bg-(--cp-cyan-strong) transition-all" style={{ boxShadow: '0 0 12px color-mix(in srgb, var(--cp-cyan) 30%, transparent)' }}>
              <Plus className="w-3.5 h-3.5" /> Add Expense
            </button>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'MRR', value: `₹${latestMrr.toLocaleString('en-IN')}` },
          { label: 'ARR', value: `₹${(latestMrr * 12).toLocaleString('en-IN')}` },
          { label: 'Expenses', value: `₹${latestExpenses.toLocaleString('en-IN')}`, sub: totalMonthlyPayroll > 0 ? `incl. ₹${totalMonthlyPayroll.toLocaleString('en-IN')} payroll` : undefined },
          { label: 'Margin', value: `${netMargin}%` },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-2xl" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
            <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-(--cp-text-faint) mb-1">{kpi.label}</p>
            <p className="text-[22px] font-display font-bold tracking-tight text-(--cp-text)">{kpi.value}</p>
            {kpi.sub && <p className="text-[9px] text-(--cp-text-faint) mt-1 truncate">{kpi.sub}</p>}
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-(--cp-border-soft) mb-6 overflow-x-auto pb-px no-scrollbar">
        {[
          { value: 'overview', label: 'Overview' },
          { value: 'invoices', label: 'Invoices' },
          { value: 'expenses', label: 'Expenses' },
          { value: 'payroll', label: 'Team Payroll' },
        ].map((tab) => {
          const isActive = activeTab === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`px-4 py-2 text-[12.5px] font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-(--cp-cyan) text-(--cp-cyan)'
                  : 'border-transparent text-(--cp-text-muted) hover:text-(--cp-text)'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'overview' && (
          <div className="p-5 rounded-2xl" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[13px] font-bold text-(--cp-text-secondary)">Revenue & Expenses</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] text-(--cp-text-faint)"><div className="w-1.5 h-1.5 rounded-full" style={{ background: chartTheme.series[0] }} /> Revenue</div>
                <div className="flex items-center gap-1.5 text-[10px] text-(--cp-text-faint)"><div className="w-1.5 h-1.5 rounded-full" style={{ background: chartTheme.series[2] }} /> Expenses</div>
              </div>
            </div>
            {loading || dynamicMrrData.length === 0 ? (
              <div className="h-70 flex items-center justify-center">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-(--cp-border) border-t-(--cp-text-muted) rounded-full animate-spin" />
                ) : (
                  <div className="text-center">
                    <Wallet className="w-8 h-8 text-(--cp-text-faint) mx-auto mb-2" />
                    <p className="text-[12px] text-(--cp-text-faint)">No financial data yet.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-70 w-full">
                <MrrChart data={dynamicMrrData} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-(--cp-border-soft)">
              <h3 className="text-[13px] font-bold text-(--cp-text-secondary)">Invoices & Project Payments</h3>
              <span className="text-[9px] font-mono text-(--cp-text-faint)">{unifiedInvoices.length} total</span>
            </div>
            <div className="overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unifiedInvoices.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16">
                  <Receipt className="w-8 h-8 text-(--cp-text-faint) mb-2" />
                  <p className="text-[12px] text-(--cp-text-faint)">No invoices or payments yet.</p>
                </div>
              ) : unifiedInvoices.map((inv) => (
                <div key={inv.id} className="group p-4 rounded-xl bg-(--cp-bg-soft) transition-colors hover:bg-(--cp-surface-strong) flex flex-col justify-between gap-3" style={{ border: '1px solid var(--cp-border-soft)' }}>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9.5px] font-mono text-(--cp-text-faint) uppercase tracking-widest">{inv.invoice_number}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono ${inv.isPayment ? 'bg-(--cp-cyan-soft) text-(--cp-cyan) border border-(--cp-cyan-border)' : 'bg-white/2 text-(--cp-text-muted) border border-white/5'}`}>
                          {inv.isPayment ? 'Project' : 'Invoice'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border ${statusStyle(inv.status)}`}>{inv.status}</span>
                        {!inv.isPayment && (
                          <button onClick={() => removeInvoice(inv.id, inv.invoice_number)} aria-label="Delete invoice" className="p-1 rounded-md text-(--cp-text-faint) hover:text-(--cp-red) hover:bg-(--cp-red-soft) transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                        )}
                      </div>
                    </div>
                    <h4 className="text-[13.5px] font-bold text-(--cp-text) truncate">{inv.client_name}</h4>
                    <p className="text-[11px] text-(--cp-text-muted) mt-1 line-clamp-2" title={inv.reason}>{inv.reason}</p>
                    {inv.projectName && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-mono bg-(--cp-cyan-soft) text-(--cp-cyan) border border-(--cp-cyan-border) w-fit">
                        <span className="opacity-60">⤷</span> {inv.projectName}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-end border-t border-(--cp-border-soft) pt-3 mt-1">
                    <span className="text-[10px] text-(--cp-text-faint) font-mono">{inv.issued_date}</span>
                    <span className="text-[15px] font-mono font-bold text-(--cp-text)">₹{inv.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-(--cp-border-soft)">
              <div>
                <h3 className="text-[13px] font-bold text-(--cp-text-secondary)">Expense Ledger</h3>
                <p className="text-[10px] text-(--cp-text-faint) mt-0.5">₹{ledgerTotal.toLocaleString('en-IN')} tracked across {expenses.length} entries</p>
              </div>
            </div>
            {expenses.length === 0 ? (
              <div className="py-16 text-center">
                <TrendingDown className="w-8 h-8 text-(--cp-text-faint) mx-auto mb-2" />
                <p className="text-[12px] text-(--cp-text-faint)">No expenses logged yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-(--cp-border-soft)">
                      {['Label', 'Category', 'Linked Tool', 'Amount', 'Date', 'Notes', ''].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-[9px] font-mono uppercase tracking-[0.15em] text-(--cp-text-faint) whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((e) => (
                      <tr key={e.id} className="border-b border-(--cp-border-soft) hover:bg-(--cp-surface-strong) transition-colors group">
                        <td className="px-4 py-2.5 text-[12px] font-medium text-(--cp-text-secondary) whitespace-nowrap">{e.label}</td>
                        <td className="px-4 py-2.5 text-[11px] text-(--cp-text-muted) whitespace-nowrap">{expenseCategoryLabel(e.category)}</td>
                        <td className="px-4 py-2.5 text-[11px] text-(--cp-text-muted) whitespace-nowrap">
                          {e.subscriptions?.name ? (
                            <span className="px-2 py-0.5 rounded-md bg-(--cp-cyan-soft) text-(--cp-cyan) border border-(--cp-cyan-border) font-semibold text-[9.5px]">
                              🔗 {e.subscriptions.name}
                            </span>
                          ) : (
                            <span className="text-(--cp-text-faint) italic">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-[12px] font-mono text-(--cp-text-secondary) whitespace-nowrap">₹{Number(e.amount || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5 text-[11px] text-(--cp-text-muted) whitespace-nowrap">{e.expense_date}</td>
                        <td className="px-4 py-2.5 text-[11px] text-(--cp-text-faint) max-w-60 truncate">{e.notes || '-'}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-right">
                          <button onClick={() => removeExpense(e.id)} className="p-1.5 rounded-lg text-(--cp-text-faint) hover:text-(--cp-red) hover:bg-(--cp-red-soft) transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payroll' && (
          <div className="flex flex-col gap-4">
            {/* Payroll Control Center Panel */}
            <div className="flex flex-col gap-4 p-5 rounded-2xl border border-(--cp-border-soft) bg-(--cp-surface) relative overflow-hidden">
              {/* Background gradient glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[color-mix(in_srgb,var(--cp-cyan)_10%,transparent)] rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-(--cp-border-soft) pb-4">
                <div>
                  <h3 className="text-[14px] font-bold text-(--cp-text-secondary) font-display tracking-wide uppercase">Payroll Control Center</h3>
                  <p className="text-[11px] text-(--cp-text-faint) mt-0.5">Real-time resource allocation and contract outflow analytics.</p>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest uppercase text-(--cp-text-faint) bg-white/2 border border-white/4 px-2.5 py-1 rounded-md">
                  <Activity className="w-3 h-3 text-(--cp-cyan) animate-pulse" /> Live Metrics synced
                </div>
              </div>

              {/* Metric Card Sub-Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-(--cp-text-faint)">Monthly Committed</span>
                  <div className="text-[20px] font-bold text-(--cp-text) font-display mt-0.5">₹{totalMonthlyPayroll.toLocaleString('en-IN')}</div>
                  <span className="text-[9.5px] text-(--cp-emerald) font-medium font-mono">Real-time dynamic</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-(--cp-text-faint)">Projected Annual ARR</span>
                  <div className="text-[20px] font-bold text-(--cp-text) font-display mt-0.5">₹{(totalMonthlyPayroll * 12).toLocaleString('en-IN')}</div>
                  <span className="text-[9.5px] text-(--cp-text-faint) font-mono">12-month run rate</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-(--cp-text-faint)">Active Headcount</span>
                  <div className="text-[20px] font-bold text-(--cp-text) font-display mt-0.5">{activeCount} {activeCount === 1 ? 'Role' : 'Roles'}</div>
                  <span className="text-[9.5px] text-(--cp-text-faint) font-mono">Onboarded contractors</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-(--cp-text-faint)">Average Compensation</span>
                  <div className="text-[20px] font-bold text-(--cp-text) font-display mt-0.5">₹{Math.round(avgSalary).toLocaleString('en-IN')}</div>
                  <span className="text-[9.5px] text-(--cp-text-faint) font-mono">Per-person average</span>
                </div>
              </div>

              {/* Stacked budget visualizer bar */}
              {totalMonthlyPayroll > 0 && (
                <div className="border-t border-(--cp-border-soft) pt-4 mt-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-(--cp-text-faint) mb-2">
                    <span className="flex items-center gap-1"><Percent className="w-3 h-3 text-(--cp-cyan)" /> BUDGET DISTRIBUTION SHARE</span>
                    <span>{membersWithSalary.length} funded roles</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-white/4 border border-white/2">
                    {teamMembers.map((m) => {
                      const salary = m.monthly_salary || 0
                      if (salary <= 0) return null
                      const pct = (salary / totalMonthlyPayroll) * 100
                      const accentColor = m.accent_color || '#818CF8'
                      return (
                        <div
                          key={m.id}
                          style={{
                            width: `${pct}%`,
                            backgroundColor: accentColor,
                          }}
                          className="h-full relative group transition-all duration-300 hover:opacity-80 cursor-pointer"
                          title={`${m.name}: ₹${salary.toLocaleString('en-IN')}/mo (${pct.toFixed(1)}%)`}
                        />
                      )
                    })}
                  </div>
                  {/* Mini Legend under the progress bar */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5 text-[9.5px] font-mono">
                    {teamMembers.map((m) => {
                      const salary = m.monthly_salary || 0
                      if (salary <= 0) return null
                      const pct = (salary / totalMonthlyPayroll) * 100
                      const accentColor = m.accent_color || '#818CF8'
                      return (
                        <div key={m.id} className="flex items-center gap-1.5 text-(--cp-text-muted)">
                          <span className="w-2 h-2 rounded-full border border-white/5" style={{ backgroundColor: accentColor }} />
                          <span>{m.initials} ({pct.toFixed(0)}%)</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Filter / Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-(--cp-border-soft) bg-white/0.5 backdrop-blur-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--cp-text-faint)" />
                <input
                  type="text"
                  placeholder="Search members by name, title, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-9 pr-4 py-1.5 text-[12px] text-(--cp-text) border border-(--cp-border-soft) rounded-lg outline-none focus:border-(--cp-cyan-border) transition-all placeholder:text-(--cp-text-faint)"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-(--cp-text-faint) whitespace-nowrap flex items-center gap-1 font-mono uppercase">
                  <ArrowUpDown className="w-3 h-3 text-(--cp-cyan)" /> Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-(--cp-bg) border border-(--cp-border-soft) text-[11.5px] text-(--cp-text-secondary) px-3 py-1 rounded-lg outline-none cursor-pointer focus:border-(--cp-cyan-border)"
                >
                  <option value="salary-desc">Highest Compensation</option>
                  <option value="salary-asc">Lowest Compensation</option>
                  <option value="name-asc">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>

            {filteredTeamMembers.length === 0 ? (
              <div className="py-16 text-center cp-card bg-(--cp-surface) border border-(--cp-border-soft) rounded-2xl">
                <Users2 className="w-8 h-8 text-(--cp-text-faint) mx-auto mb-2" />
                <p className="text-[12px] text-(--cp-text-faint)">No team members match your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeamMembers.map((m) => {
                  const accentColor = m.accent_color || '#818CF8'
                  const annualSalary = (m.monthly_salary || 0) * 12
                  return (
                    <div 
                      key={m.id} 
                      className="group cp-card p-4.5 flex flex-col gap-4 transition-all duration-300 hover:border-(--cp-cyan-border) hover:bg-white/1.5 relative overflow-hidden"
                      style={{
                        border: '1px solid var(--cp-border-soft)',
                      }}
                    >
                      {/* Interactive Accent Stripe on top */}
                      <div className="absolute top-0 left-0 right-0 h-0.75 opacity-40 transition-opacity group-hover:opacity-100" style={{ backgroundColor: accentColor }} />

                      {/* Offboard (member left) — soft-delete, keeps history */}
                      <button
                        onClick={() => offboardMember(m.id, m.name)}
                        aria-label={`Offboard ${m.name || 'member'}`}
                        title="Offboard — member left the team"
                        className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg text-(--cp-text-faint) hover:text-(--cp-red) hover:bg-(--cp-red-soft) transition-all opacity-0 group-hover:opacity-100"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>

                      {/* Avatar & Info Header */}
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center relative select-none font-mono text-[13.5px] font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                          style={{ 
                            backgroundColor: m.image_url ? 'transparent' : accentColor,
                            border: `2px solid ${accentColor}40`,
                            boxShadow: `0 0 10px ${accentColor}15`
                          }}
                        >
                          {m.image_url ? (
                            <Image src={m.image_url} alt={m.name || ''} fill className="object-cover rounded-full" sizes="44px" />
                          ) : (
                            <span>{m.initials}</span>
                          )}
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-(--cp-surface) bg-(--cp-emerald) shadow-sm" />
                        </div>
                        <div className="min-w-0 flex-1 leading-tight pt-0.5">
                          <h4 className="text-[13.5px] font-bold text-(--cp-text) truncate group-hover:text-(--cp-cyan) transition-colors">{m.name}</h4>
                          <p className="text-[11px] text-(--cp-text-muted) font-medium truncate mt-0.5">{m.title || m.role}</p>
                          {m.email && <p className="text-[9.5px] text-(--cp-text-faint) font-mono truncate mt-1">{m.email}</p>}
                        </div>
                      </div>

                      {/* Skills tags */}
                      {m.skills && m.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {m.skills.slice(0, 3).map((s: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md text-[8.5px] font-mono bg-white/2 text-(--cp-text-muted) border border-white/4">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Bio quotation if present */}
                      {m.bio && (
                        <p className="text-[10px] text-(--cp-text-faint) italic line-clamp-1 leading-normal border-l-2 border-white/5 pl-2 py-px">
                          &quot;{m.bio}&quot;
                        </p>
                      )}

                      {/* Stepper input container (Compensation Command Well) */}
                      <div className="flex flex-col gap-1.5 border-t border-(--cp-border-soft) pt-3.5 mt-0.5">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-(--cp-text-faint)">Monthly Compensation</span>
                        <div className="bg-white/0.5 border border-white/2 rounded-xl p-1">
                          <SalaryStepper
                            value={m.monthly_salary || 0}
                            onChange={(val) => updateSalary(m.id, val)}
                          />
                        </div>
                      </div>

                      {/* Metrics block */}
                      <div className="grid grid-cols-2 gap-2 mt-0.5 border-t border-(--cp-border-soft) pt-3 text-[10px] font-mono text-(--cp-text-faint)">
                        <div className="flex flex-col gap-0.5">
                          <span>Hourly (est.):</span>
                          <span className="font-semibold text-(--cp-text-muted)">₹{Math.round((m.monthly_salary || 0) / 160).toLocaleString('en-IN')}/hr</span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-right">
                          <span>Budget Weight:</span>
                          <span className="font-semibold text-(--cp-text-muted)">{totalMonthlyPayroll > 0 ? (((m.monthly_salary || 0) / totalMonthlyPayroll) * 100).toFixed(1) : 0}%</span>
                        </div>
                      </div>

                      {/* Annualized Outflow footer */}
                      <div className="flex items-center justify-between mt-1 pt-2.5 border-t border-(--cp-border-soft) text-[10.5px] font-mono">
                        <span className="text-(--cp-text-faint)">Annual Outflow:</span>
                        <span className="font-bold text-(--cp-emerald)">₹{annualSalary.toLocaleString('en-IN')}/yr</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Invoice" subtitle="Link to a project or provide a reason.">
        <div className="flex flex-col gap-4">
          <ModalInput label="Invoice Number" value={formNumber} onChange={setFormNumber} placeholder="INV-001" required />
          <ModalInput label="Client Name" value={formClient} onChange={setFormClient} placeholder="Acme Corp" required />
          <ModalSelect
            label="Linked Project"
            value={formProjectId}
            onChange={(v) => { setFormProjectId(v); }}
            options={[
              { value: '', label: 'No project (provide reason below)' },
              ...projects.map(p => ({ value: p.id, label: p.name }))
            ]}
          />
          <div>
            <ModalInput label={formProjectId ? 'Reason / Description (Optional)' : 'Reason / Description (Required — no project linked)'} value={formReason} onChange={setFormReason} placeholder="e.g. Monthly retainer fee" required={!formProjectId} />
            {!formProjectId && !formReason.trim() && (
              <p className="text-[10px] text-(--cp-red) mt-1 font-medium">⚠ Either select a project or provide a reason for this invoice.</p>
            )}
          </div>
          <SalaryStepper label="Amount (₹)" value={formAmount} onChange={setFormAmount} placeholder="50000" required />
          <div className="flex justify-end gap-3 pt-4 border-t border-(--cp-border-soft)">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-(--cp-text-faint) hover:text-(--cp-text-secondary) transition-colors">Cancel</button>
            <button onClick={addInvoice} disabled={saving || !formNumber || !formClient || !formAmount || (!formProjectId && !formReason.trim())} className="px-5 py-2 bg-(--cp-cyan) text-white font-semibold text-[12px] rounded-xl hover:bg-(--cp-cyan-strong) transition-all disabled:opacity-30">
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Add Expense" subtitle="Log a business expense.">
        <div className="flex flex-col gap-4">
          <ModalInput label="Label" value={expForm.label} onChange={(v) => setExpForm({ ...expForm, label: v })} placeholder="e.g. AWS hosting bill" required />
          <div className="grid grid-cols-2 gap-4">
            <ModalSelect label="Category" value={expForm.category} onChange={(v) => setExpForm({ ...expForm, category: v })} options={EXPENSE_CATEGORIES} />
            <SalaryStepper label="Amount (₹)" value={expForm.amount} onChange={(v) => setExpForm({ ...expForm, amount: v })} placeholder="0" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Date" value={expForm.expense_date} onChange={(v) => setExpForm({ ...expForm, expense_date: v })} type="date" required />
            <ModalSelect 
              label="Linked Subscription (Optional)" 
              value={expForm.subscription_id} 
              onChange={(v) => setExpForm({ ...expForm, subscription_id: v })} 
              options={[
                { value: '', label: 'None (Regular Expense)' },
                ...subscriptions.map(s => ({ value: s.id, label: s.name }))
              ]} 
            />
          </div>
          <ModalInput label="Notes" value={expForm.notes} onChange={(v) => setExpForm({ ...expForm, notes: v })} placeholder="Optional notes" />
          <div className="flex justify-end gap-3 pt-4 border-t border-(--cp-border-soft)">
            <button onClick={() => setExpenseModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-(--cp-text-faint) hover:text-(--cp-text-secondary) transition-colors">Cancel</button>
            <button onClick={addExpense} disabled={savingExpense || !expForm.label || !expForm.amount || !expForm.expense_date} className="px-5 py-2 bg-(--cp-cyan) text-white font-semibold text-[12px] rounded-xl hover:bg-(--cp-cyan-strong) transition-all disabled:opacity-30">
              {savingExpense ? 'Saving...' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!confirmAction} onClose={() => setConfirmAction(null)} title={confirmAction?.title || ''}>
        <div className="flex flex-col gap-6">
          <p className="text-[13px] leading-relaxed text-(--cp-text-secondary)">{confirmAction?.body}</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-(--cp-border-soft)">
            <button onClick={() => setConfirmAction(null)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-(--cp-text-faint) hover:text-(--cp-text-secondary) transition-colors">Cancel</button>
            <button
              onClick={() => { confirmAction?.onConfirm(); setConfirmAction(null) }}
              className="px-5 py-2 bg-(--cp-red) text-white font-semibold text-[12px] rounded-xl hover:opacity-90 transition-all"
            >
              {confirmAction?.confirmLabel}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
