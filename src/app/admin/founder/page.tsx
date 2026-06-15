'use client'
import { useEffect, useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import {
  AlertTriangle, CheckCircle2, XCircle, Clock, ArrowRight, Plus, Trash2,
  Megaphone, Target, CreditCard, Briefcase, Rocket, Users2, ShieldCheck,
} from 'lucide-react'
import {
  fetchProjects, fetchInvoices, fetchAllPayments, fetchSubscriptions,
  fetchCampaigns, fetchLeads, fetchPendingApprovals, updateApproval,
  fetchRoadmapItems, insertRoadmapItem, updateRoadmapItem, deleteRoadmapItem,
} from '@/lib/db'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'
import { useChartTheme, tooltipContentStyle, tooltipLabelStyle, tooltipItemStyle } from '@/lib/theme/chartTheme'

const REVENUE_DATA = [
  { name: 'Jan', revenue: 125000 },
  { name: 'Feb', revenue: 180000 },
  { name: 'Mar', revenue: 150000 },
  { name: 'Apr', revenue: 265000 },
  { name: 'May', revenue: 375000 },
  { name: 'Jun', revenue: 430000 },
]

const ROADMAP_TYPES = [
  { value: 'roadmap', label: 'Roadmap' },
  { value: 'hiring', label: 'Hiring' },
]

const ROADMAP_STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function roadmapStatusStyle(status: string) {
  if (status === 'done') return 'bg-[var(--cp-emerald-soft)] text-[var(--cp-emerald)] border-[var(--cp-emerald-border)]'
  if (status === 'in_progress') return 'bg-[var(--cp-cyan-soft)] text-[var(--cp-cyan)] border-[var(--cp-cyan-border)]'
  return 'bg-[var(--cp-surface-strong)] text-[var(--cp-text-faint)] border-[var(--cp-border-soft)]'
}

const emptyRoadmapForm = { type: 'roadmap', title: '', description: '', status: 'planned', target_quarter: '', department: '' }

export default function FounderHub() {
  const [projects, setProjects] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [approvals, setApprovals] = useState<any[]>([])
  const [roadmapItems, setRoadmapItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const chartTheme = useChartTheme()

  const [roadmapModalOpen, setRoadmapModalOpen] = useState(false)
  const [roadmapForm, setRoadmapForm] = useState(emptyRoadmapForm)
  const [savingRoadmap, setSavingRoadmap] = useState(false)

  useEffect(() => {
    async function load() {
      const [projRes, invRes, payRes, subRes, campRes, leadRes, apprRes, roadRes] = await Promise.all([
        fetchProjects(), fetchInvoices(), fetchAllPayments(), fetchSubscriptions(),
        fetchCampaigns(), fetchLeads(), fetchPendingApprovals(), fetchRoadmapItems(),
      ])
      if (projRes.data) setProjects(projRes.data)
      if (invRes.data) setInvoices(invRes.data)
      if (payRes.data) setPayments(payRes.data)
      if (subRes.data) setSubscriptions(subRes.data)
      if (campRes.data) setCampaigns(campRes.data)
      if (leadRes.data) setLeads(leadRes.data)
      if (apprRes.data) setApprovals(apprRes.data)
      if (roadRes.data) setRoadmapItems(roadRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const finances = useMemo(() => {
    let total = 0
    let received = 0
    let outstanding = 0

    payments.forEach((p: any) => {
      const amt = Number(p.amount) || 0
      total += amt
      if (p.status === 'paid') received += amt
      else outstanding += amt
    })

    invoices.forEach((inv: any) => {
      const amt = Number(inv.amount) || 0
      total += amt
      if (inv.status === 'Paid') received += amt
      else outstanding += amt
    })

    return { total, received, outstanding }
  }, [payments, invoices])

  const dynamicRevenueData = useMemo(() => {
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

      return {
        name,
        revenue: monthlyRevenue,
      }
    })
  }, [invoices, payments])

  const chartData = dynamicRevenueData

  // ── Alerts ──
  const overdueInvoices = useMemo(() => invoices.filter(i => i.status === 'Overdue'), [invoices])
  const atRiskProjects = useMemo(() => projects.filter(p => p.health === 'at-risk' || p.health === 'delayed'), [projects])
  const expiringSubs = useMemo(() => subscriptions.filter(s => {
    const d = daysUntil(s.renewal_date)
    return d !== null && d >= 0 && d <= 30 && s.status !== 'cancelled'
  }), [subscriptions])

  const alerts = useMemo(() => {
    const items: { icon: any; text: string; tone: string }[] = []
    overdueInvoices.forEach(i => items.push({ icon: AlertTriangle, tone: 'text-[var(--cp-red)]', text: `Invoice ${i.invoice_number || i.id?.slice(0, 8)} for ${i.client_name} is overdue (₹${(i.amount || 0).toLocaleString('en-IN')})` }))
    atRiskProjects.forEach(p => items.push({ icon: AlertTriangle, tone: 'text-[var(--cp-amber)]', text: `Project "${p.name}" is ${p.health === 'delayed' ? 'delayed' : 'at risk'}` }))
    expiringSubs.forEach(s => items.push({ icon: Clock, tone: 'text-[var(--cp-cyan)]', text: `${s.name} renews in ${daysUntil(s.renewal_date)}d (₹${Number(s.monthly_cost || 0).toLocaleString('en-IN')}/mo)` }))
    return items
  }, [overdueInvoices, atRiskProjects, expiringSubs])

  // ── Department performance ──
  const onTrackCount = projects.filter(p => p.health === 'on-track' || !p.health).length
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const wonLeads = leads.filter(l => l.stage === 'Won').length

  // ── Subscription snapshot ──
  const subTotals = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active' || s.status === 'expiring')
    return {
      monthly: active.reduce((acc, s) => acc + (Number(s.monthly_cost) || 0), 0),
      renewalsSoon: expiringSubs.length,
    }
  }, [subscriptions, expiringSubs])

  // ── Approvals ──
  async function handleApproval(id: string, status: 'approved' | 'rejected') {
    setApprovals(approvals.filter(a => a.id !== id))
    await updateApproval(id, status)
  }

  // ── Roadmap ──
  function openRoadmapModal() {
    setRoadmapForm(emptyRoadmapForm)
    setRoadmapModalOpen(true)
  }

  async function saveRoadmapItem() {
    if (!roadmapForm.title) return
    setSavingRoadmap(true)
    const { data } = await insertRoadmapItem({
      type: roadmapForm.type,
      title: roadmapForm.title,
      description: roadmapForm.description || undefined,
      status: roadmapForm.status,
      target_quarter: roadmapForm.target_quarter || undefined,
      department: roadmapForm.department || undefined,
    })
    if (data) setRoadmapItems([...roadmapItems, data])
    setSavingRoadmap(false)
    setRoadmapModalOpen(false)
  }

  async function cycleRoadmapStatus(item: any) {
    const next = item.status === 'planned' ? 'in_progress' : item.status === 'in_progress' ? 'done' : 'planned'
    setRoadmapItems(roadmapItems.map(r => r.id === item.id ? { ...r, status: next } : r))
    await updateRoadmapItem(item.id, { status: next })
  }

  async function removeRoadmapItem(id: string) {
    setRoadmapItems(roadmapItems.filter(r => r.id !== id))
    await deleteRoadmapItem(id)
  }

  const roadmapList = roadmapItems.filter(r => r.type === 'roadmap')
  const hiringList = roadmapItems.filter(r => r.type === 'hiring')

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--cp-text)]">Founder Hub</h1>
        <p className="text-[var(--cp-text-faint)] text-[13px] mt-0.5">High-level financial overview and agency control center.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Pipeline', value: `₹${finances.total.toLocaleString('en-IN')}`, color: 'text-[var(--cp-text)]' },
          { label: 'Received', value: `₹${finances.received.toLocaleString('en-IN')}`, color: 'text-[var(--cp-emerald)]' },
          { label: 'Outstanding', value: `₹${finances.outstanding.toLocaleString('en-IN')}`, color: 'text-[var(--cp-amber)]' },
          { label: 'Total Projects', value: String(projects.length), color: 'text-[var(--cp-text)]' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl"
            style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}
          >
            <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--cp-text-faint)] mb-1">{kpi.label}</p>
            <p className={`text-[22px] font-display font-bold tracking-tight ${kpi.color}`}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <div className="xl:col-span-2 p-5 rounded-2xl" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
          <h3 className="text-[13px] font-bold text-[var(--cp-text-secondary)] mb-4">Revenue Growth</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartTheme.series[0]} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={chartTheme.series[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="name" stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} width={35} />
                <Tooltip
                  contentStyle={tooltipContentStyle(chartTheme)}
                  labelStyle={tooltipLabelStyle(chartTheme)}
                  itemStyle={tooltipItemStyle(chartTheme)}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke={chartTheme.series[0]} strokeWidth={1.5} fillOpacity={1} fill="url(#colorRevenue)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts */}
        <div className="xl:col-span-1 flex flex-col rounded-2xl overflow-hidden" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
          <div className="flex justify-between items-center px-5 py-4 border-b border-[var(--cp-border-soft)]">
            <h3 className="text-[13px] font-bold text-[var(--cp-text-secondary)]">Alerts</h3>
            <span className="text-[9px] font-mono text-[var(--cp-text-faint)]">{alerts.length} active</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 max-h-[280px]">
            {loading ? (
              <div className="flex-1 flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-[var(--cp-border)] border-t-[var(--cp-text-muted)] rounded-full animate-spin" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10">
                <CheckCircle2 className="w-8 h-8 text-[var(--cp-text-faint)] mb-2" />
                <p className="text-[12px] text-[var(--cp-text-faint)]">All clear. No alerts.</p>
              </div>
            ) : alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ border: '1px solid var(--cp-border-soft)' }}>
                <a.icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${a.tone}`} />
                <p className="text-[12px] text-[var(--cp-text-secondary)] leading-snug">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Approvals & Department Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        {/* Approvals */}
        <div className="xl:col-span-1 flex flex-col rounded-2xl overflow-hidden" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
          <div className="flex justify-between items-center px-5 py-4 border-b border-[var(--cp-border-soft)]">
            <h3 className="text-[13px] font-bold text-[var(--cp-text-secondary)]">Pending Approvals</h3>
            <span className="text-[9px] font-mono text-[var(--cp-text-faint)]">{approvals.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 max-h-[280px]">
            {approvals.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10">
                <ShieldCheck className="w-8 h-8 text-[var(--cp-text-faint)] mb-2" />
                <p className="text-[12px] text-[var(--cp-text-faint)]">Nothing pending approval.</p>
              </div>
            ) : approvals.map((a) => (
              <div key={a.id} className="p-3 rounded-xl" style={{ border: '1px solid var(--cp-border-soft)' }}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[9px] font-mono text-[var(--cp-text-faint)] uppercase tracking-[0.1em]">{a.type || 'Approval'}</span>
                  <span className="text-[9px] text-[var(--cp-text-faint)]">{a.projects?.name || ''}</span>
                </div>
                <p className="text-[12px] text-[var(--cp-text-secondary)] font-medium mb-2">{a.title}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleApproval(a.id, 'approved')} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[var(--cp-emerald)] bg-[var(--cp-emerald-soft)] border border-[var(--cp-emerald-border)] hover:bg-[var(--cp-emerald-soft)] transition-colors">
                    <CheckCircle2 className="w-3 h-3" /> Approve
                  </button>
                  <button onClick={() => handleApproval(a.id, 'rejected')} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[var(--cp-red)] bg-[var(--cp-red-soft)] border border-[var(--cp-red-border)] hover:bg-[var(--cp-red-soft)] transition-colors">
                    <XCircle className="w-3 h-3" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Performance */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Operations', icon: Briefcase, primary: `${onTrackCount}/${projects.length}`, sub: 'projects on track', href: '/admin/projects' },
            { label: 'Marketing', icon: Megaphone, primary: String(activeCampaigns), sub: 'active campaigns', href: '/admin/marketing' },
            { label: 'Sales / CRM', icon: Target, primary: `${wonLeads}/${leads.length}`, sub: 'leads won', href: '/admin/crm' },
          ].map((dept, i) => (
            <a key={i} href={dept.href} className="p-4 rounded-2xl flex flex-col justify-between hover:bg-[var(--cp-surface-strong)] transition-colors group" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
              <div className="flex items-center justify-between mb-4">
                <dept.icon className="w-4 h-4 text-[var(--cp-text-faint)]" />
                <ArrowRight className="w-3.5 h-3.5 text-[var(--cp-text-faint)] group-hover:text-[var(--cp-text-muted)] group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className="text-[20px] font-display font-bold text-[var(--cp-text)] tracking-tight">{dept.primary}</p>
                <p className="text-[10px] text-[var(--cp-text-faint)] mt-0.5">{dept.sub}</p>
                <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--cp-text-faint)] mt-2">{dept.label}</p>
              </div>
            </a>
          ))}

          {/* Subscription Snapshot */}
          <a href="/admin/subscriptions" className="sm:col-span-3 p-4 rounded-2xl flex items-center justify-between hover:bg-[var(--cp-surface-strong)] transition-colors group" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--cp-surface-strong)' }}>
                <CreditCard className="w-4 h-4 text-[var(--cp-text-muted)]" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[var(--cp-text-secondary)]">Subscription Spend</p>
                <p className="text-[10px] text-[var(--cp-text-faint)] mt-0.5">{subTotals.renewalsSoon} renewal{subTotals.renewalsSoon === 1 ? '' : 's'} due in next 30 days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-[18px] font-display font-bold text-[var(--cp-text)] tracking-tight">₹{subTotals.monthly.toLocaleString('en-IN')}<span className="text-[10px] text-[var(--cp-text-faint)] font-sans">/mo</span></p>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--cp-text-faint)] group-hover:text-[var(--cp-text-muted)] group-hover:translate-x-0.5 transition-all" />
            </div>
          </a>
        </div>
      </div>

      {/* Growth Roadmap & Hiring Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
          <div className="flex justify-between items-center px-5 py-4 border-b border-[var(--cp-border-soft)]">
            <div className="flex items-center gap-2">
              <Rocket className="w-3.5 h-3.5 text-[var(--cp-text-faint)]" />
              <h3 className="text-[13px] font-bold text-[var(--cp-text-secondary)]">Growth Roadmap</h3>
            </div>
            <button onClick={openRoadmapModal} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[var(--cp-text-muted)] hover:text-[var(--cp-text)] transition-all" style={{ background: 'var(--cp-surface-strong)', border: '1px solid var(--cp-border)' }}>
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <div className="p-3 flex flex-col gap-2 max-h-[260px] overflow-y-auto">
            {roadmapList.length === 0 ? (
              <p className="text-[12px] text-[var(--cp-text-faint)] text-center py-8">No roadmap items yet.</p>
            ) : roadmapList.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl group" style={{ border: '1px solid var(--cp-border-soft)' }}>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-[var(--cp-text-secondary)] truncate">{item.title}</p>
                  <p className="text-[10px] text-[var(--cp-text-faint)] mt-0.5">{item.target_quarter || '-'}{item.department ? ` · ${item.department}` : ''}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => cycleRoadmapStatus(item)} className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-[0.1em] border ${roadmapStatusStyle(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </button>
                  <button onClick={() => removeRoadmapItem(item.id)} className="p-1 rounded-lg text-[var(--cp-text-faint)] hover:text-[var(--cp-red)] hover:bg-[var(--cp-red-soft)] transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
          <div className="flex justify-between items-center px-5 py-4 border-b border-[var(--cp-border-soft)]">
            <div className="flex items-center gap-2">
              <Users2 className="w-3.5 h-3.5 text-[var(--cp-text-faint)]" />
              <h3 className="text-[13px] font-bold text-[var(--cp-text-secondary)]">Hiring Plan</h3>
            </div>
            <button onClick={() => { setRoadmapForm({ ...emptyRoadmapForm, type: 'hiring' }); setRoadmapModalOpen(true) }} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[var(--cp-text-muted)] hover:text-[var(--cp-text)] transition-all" style={{ background: 'var(--cp-surface-strong)', border: '1px solid var(--cp-border)' }}>
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <div className="p-3 flex flex-col gap-2 max-h-[260px] overflow-y-auto">
            {hiringList.length === 0 ? (
              <p className="text-[12px] text-[var(--cp-text-faint)] text-center py-8">No hiring plans yet.</p>
            ) : hiringList.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl group" style={{ border: '1px solid var(--cp-border-soft)' }}>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-[var(--cp-text-secondary)] truncate">{item.title}</p>
                  <p className="text-[10px] text-[var(--cp-text-faint)] mt-0.5">{item.target_quarter || '-'}{item.department ? ` · ${item.department}` : ''}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => cycleRoadmapStatus(item)} className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-[0.1em] border ${roadmapStatusStyle(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </button>
                  <button onClick={() => removeRoadmapItem(item.id)} className="p-1 rounded-lg text-[var(--cp-text-faint)] hover:text-[var(--cp-red)] hover:bg-[var(--cp-red-soft)] transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Roadmap/Hiring Item Modal */}
      <Modal open={roadmapModalOpen} onClose={() => setRoadmapModalOpen(false)} title="Add Plan Item" subtitle="Add a growth roadmap or hiring plan item.">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <ModalSelect label="Type" value={roadmapForm.type} onChange={(v) => setRoadmapForm({ ...roadmapForm, type: v })} options={ROADMAP_TYPES} />
            <ModalSelect label="Status" value={roadmapForm.status} onChange={(v) => setRoadmapForm({ ...roadmapForm, status: v })} options={ROADMAP_STATUSES} />
          </div>
          <ModalInput label="Title" value={roadmapForm.title} onChange={(v) => setRoadmapForm({ ...roadmapForm, title: v })} placeholder="e.g. Launch referral program / Hire 2 frontend devs" required />
          <ModalInput label="Description" value={roadmapForm.description} onChange={(v) => setRoadmapForm({ ...roadmapForm, description: v })} placeholder="Optional details" />
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Target Quarter" value={roadmapForm.target_quarter} onChange={(v) => setRoadmapForm({ ...roadmapForm, target_quarter: v })} placeholder="e.g. Q3 2026" />
            <ModalInput label="Department" value={roadmapForm.department} onChange={(v) => setRoadmapForm({ ...roadmapForm, department: v })} placeholder="e.g. Engineering" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--cp-border-soft)]">
            <button onClick={() => setRoadmapModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-[var(--cp-text-faint)] hover:text-[var(--cp-text-secondary)] transition-colors">Cancel</button>
            <button onClick={saveRoadmapItem} disabled={savingRoadmap || !roadmapForm.title} className="px-5 py-2 bg-[var(--cp-cyan)] text-white font-semibold text-[12px] rounded-xl hover:bg-[var(--cp-cyan-strong)] transition-all disabled:opacity-30">
              {savingRoadmap ? 'Saving...' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
