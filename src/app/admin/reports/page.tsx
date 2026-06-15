'use client'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
} from 'recharts'
import {
  Download, Calendar, BarChart3, TrendingUp, Wallet, ListChecks, Activity,
  Megaphone, Gauge, ShieldAlert, FolderKanban,
} from 'lucide-react'
import { useAdminAuth } from '@/lib/AdminAuthContext'
import { fetchRevenueAnalytics, fetchSubscriptions, fetchCampaigns, fetchLeads, fetchTasks, fetchProjects } from '@/lib/db'
import { priorityStyle, slaRiskStyle } from '@/lib/badges'
import { useChartTheme, tooltipContentStyle, tooltipLabelStyle, tooltipItemStyle } from '@/lib/theme/chartTheme'

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost']
const PRIORITY_KEYS = ['critical', 'high', 'medium', 'low'] as const
const TASK_STATUSES = [
  { value: 'open', label: 'Open', color: 'var(--cp-cyan)' },
  { value: 'in_progress', label: 'In Progress', color: 'var(--cp-amber)' },
  { value: 'blocked', label: 'Blocked', color: 'var(--cp-red)' },
  { value: 'done', label: 'Done', color: 'var(--cp-emerald)' },
]
const HEALTH_STATUSES = [
  { value: 'on-track', label: 'On Track', color: 'var(--cp-emerald)' },
  { value: 'at-risk', label: 'At Risk', color: 'var(--cp-amber)' },
  { value: 'delayed', label: 'Delayed', color: 'var(--cp-red)' },
]
const SLA_LABELS = ['Breached', 'At Risk', 'On Time', 'No SLA']
const SLA_COLORS: Record<string, string> = { Breached: 'var(--cp-red)', 'At Risk': 'var(--cp-amber)', 'On Time': 'var(--cp-emerald)', 'No SLA': 'var(--cp-text-faint)' }
const SUB_CATEGORY_LABELS: Record<string, string> = {
  ai_tools: 'AI Tools', hosting: 'Hosting', domains: 'Domains', ads: 'Ad Tools', crm_tools: 'CRM Tools', design_tools: 'Design Tools', other: 'Other',
}

const FOUNDER_TABS = [
  { id: 'revenue', label: 'Revenue', icon: TrendingUp },
  { id: 'profitability', label: 'Profitability', icon: Wallet },
  { id: 'subscriptions', label: 'Subscription Spend', icon: ListChecks },
  { id: 'combined', label: 'Combined Performance', icon: Activity },
]
const MARKETING_TABS = [
  { id: 'campaigns', label: 'Campaign Performance', icon: Megaphone },
  { id: 'leadgen', label: 'Lead-Gen Trends', icon: TrendingUp },
  { id: 'funnel', label: 'Funnel Conversion', icon: Gauge },
]
const ADMIN_TABS = [
  { id: 'pipeline', label: 'Pipeline Movement', icon: Activity },
  { id: 'sla', label: 'SLA & Response Time', icon: ShieldAlert },
  { id: 'tasks', label: 'Task Completion', icon: ListChecks },
  { id: 'projects', label: 'Project Health', icon: FolderKanban },
]

function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers, ...rows].map(r => r.map(esc).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function Kpi({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl flex items-start justify-between"
      style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}
    >
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--cp-text-faint)] mb-1">{label}</p>
        <p className="text-[22px] font-display font-bold tracking-tight text-[var(--cp-text)]">{value}</p>
      </div>
      <Icon className="w-5 h-5 text-[var(--cp-text-faint)] opacity-50" />
    </motion.div>
  )
}

function ChartCard({ title, legend, children }: { title: string; legend?: ReactNode; children: ReactNode }) {
  return (
    <div className="p-5 rounded-2xl mb-5" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-[13px] font-bold text-[var(--cp-text-secondary)]">{title}</h3>
        {legend}
      </div>
      <div className="h-[280px] w-full">{children}</div>
    </div>
  )
}

function EmptyChart({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Icon className="w-8 h-8 text-[var(--cp-text-faint)] mx-auto mb-2" />
        <p className="text-[12px] text-[var(--cp-text-faint)]">{message}</p>
      </div>
    </div>
  )
}

function ReportTable({ headers, rows, onExport }: { headers: string[]; rows: ReactNode[][]; onExport: () => void }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
      <div className="flex justify-between items-center px-5 py-4 border-b border-[var(--cp-border-soft)]">
        <h3 className="text-[13px] font-bold text-[var(--cp-text-secondary)]">Detail</h3>
        <button onClick={onExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[var(--cp-text-secondary)] hover:text-[var(--cp-text)] transition-all" style={{ background: 'var(--cp-surface-strong)', border: '1px solid var(--cp-border)' }}>
          <Download className="w-3 h-3" /> Export CSV
        </button>
      </div>
      {rows.length === 0 ? (
        <div className="py-12 text-center text-[12px] text-[var(--cp-text-faint)]">No data for this range.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--cp-border-soft)]">
                {headers.map(h => <th key={h} className="px-4 py-2.5 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--cp-text-faint)] whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-[var(--cp-border-soft)] hover:bg-[var(--cp-surface-strong)] transition-colors">
                  {row.map((cell, j) => <td key={j} className="px-4 py-2.5 text-[12px] text-[var(--cp-text-secondary)] whitespace-nowrap">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Pill({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
  return (
    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-[0.1em] border" style={{ color, background: bg, borderColor: border }}>
      {label}
    </span>
  )
}

export default function ReportsPage() {
  const { user } = useAdminAuth()
  const role = user?.role
  const isFounder = role === 'founder'
  const isMarketing = role === 'marketing'

  const tabs = isFounder ? FOUNDER_TABS : isMarketing ? MARKETING_TABS : ADMIN_TABS
  const [tabOverride, setTab] = useState<string | null>(null)
  const tab = tabOverride && tabs.some(t => t.id === tabOverride) ? tabOverride : tabs[0].id
  const [loading, setLoading] = useState(true)

  const [revenue, setRevenue] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const chartTheme = useChartTheme()
  const tooltipStyle = useMemo(() => ({
    contentStyle: tooltipContentStyle(chartTheme),
    labelStyle: tooltipLabelStyle(chartTheme),
    itemStyle: tooltipItemStyle(chartTheme),
  }), [chartTheme])

  useEffect(() => {
    async function load() {
      if (isFounder) {
        const [rev, subs, camp, lds, tks, prj] = await Promise.all([
          fetchRevenueAnalytics(), fetchSubscriptions(), fetchCampaigns(), fetchLeads(), fetchTasks(), fetchProjects(),
        ])
        if (!rev.error && rev.data) setRevenue(rev.data)
        if (!subs.error && subs.data) setSubscriptions(subs.data)
        if (!camp.error && camp.data) setCampaigns(camp.data)
        if (!lds.error && lds.data) setLeads(lds.data)
        if (!tks.error && tks.data) setTasks(tks.data)
        if (!prj.error && prj.data) setProjects(prj.data)
      } else if (isMarketing) {
        const [camp, lds] = await Promise.all([fetchCampaigns(), fetchLeads()])
        if (!camp.error && camp.data) setCampaigns(camp.data)
        if (!lds.error && lds.data) setLeads(lds.data)
      } else {
        const [lds, tks, prj] = await Promise.all([fetchLeads(), fetchTasks(), fetchProjects()])
        if (!lds.error && lds.data) setLeads(lds.data)
        if (!tks.error && tks.data) setTasks(tks.data)
        if (!prj.error && prj.data) setProjects(prj.data)
      }
      setLoading(false)
    }
    load()
  }, [isFounder, isMarketing])

  // ── Date-range filtered datasets ──
  const revenueRows = useMemo(() => revenue.filter(r => {
    if (!r.month) return true
    const d = String(r.month).slice(0, 10)
    if (dateFrom && d < dateFrom) return false
    if (dateTo && d > dateTo) return false
    return true
  }), [revenue, dateFrom, dateTo])

  const leadRows = useMemo(() => leads.filter(l => {
    if (!l.created_at) return true
    const d = String(l.created_at).slice(0, 10)
    if (dateFrom && d < dateFrom) return false
    if (dateTo && d > dateTo) return false
    return true
  }), [leads, dateFrom, dateTo])

  const campaignRows = useMemo(() => campaigns.filter(c => {
    if (!c.created_at) return true
    const d = String(c.created_at).slice(0, 10)
    if (dateFrom && d < dateFrom) return false
    if (dateTo && d > dateTo) return false
    return true
  }), [campaigns, dateFrom, dateTo])

  const taskRows = useMemo(() => tasks.filter(t => {
    if (!t.created_at) return true
    const d = String(t.created_at).slice(0, 10)
    if (dateFrom && d < dateFrom) return false
    if (dateTo && d > dateTo) return false
    return true
  }), [tasks, dateFrom, dateTo])

  // ── Founder: Revenue ──
  const revenueChartData = useMemo(() => revenueRows.map(r => ({
    name: new Date(r.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    month: r.month, mrr: r.mrr || 0, expenses: r.expenses || 0, net_margin: r.net_margin || 0,
  })), [revenueRows])

  // ── Founder: Profitability ──
  const profitData = useMemo(() => revenueChartData.map(r => {
    const profit = r.mrr - r.expenses
    const margin = r.mrr ? (profit / r.mrr * 100) : 0
    return { ...r, profit, margin }
  }), [revenueChartData])

  // ── Founder: Subscription Spend ──
  const activeSubs = useMemo(() => subscriptions.filter(s => s.status === 'active'), [subscriptions])
  const subCategoryData = useMemo(() => {
    const map: Record<string, number> = {}
    subscriptions.forEach(s => { map[s.category || 'other'] = (map[s.category || 'other'] || 0) + (s.monthly_cost || 0) })
    return Object.entries(map).map(([category, total]) => ({ name: SUB_CATEGORY_LABELS[category] || category, total }))
  }, [subscriptions])
  const renewalsSoon = useMemo(() => subscriptions.filter(s => {
    if (!s.renewal_date) return false
    const days = Math.ceil((new Date(s.renewal_date).getTime() - new Date().getTime()) / 86400000)
    return days >= 0 && days <= 30
  }).length, [subscriptions])

  // ── Marketing: Campaign Performance ──
  const campaignChartData = useMemo(() => campaignRows.map(c => ({
    name: c.name?.length > 14 ? c.name.slice(0, 14) + '…' : c.name,
    leads: c.leads_generated || 0,
  })), [campaignRows])

  // ── Marketing: Lead-Gen Trends ──
  const leadGenData = useMemo(() => {
    const map: Record<string, { count: number; qualitySum: number }> = {}
    leadRows.forEach(l => {
      const key = l.created_at ? String(l.created_at).slice(0, 7) : 'unknown'
      if (!map[key]) map[key] = { count: 0, qualitySum: 0 }
      map[key].count++
      map[key].qualitySum += (l.quality_score ?? 50)
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({
      month,
      name: month === 'unknown' ? 'Unknown' : new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      count: v.count,
      avgQuality: Math.round(v.qualitySum / v.count),
    }))
  }, [leadRows])

  // ── Marketing: Funnel Conversion ──
  const funnelData = useMemo(() => STAGES.map(stage => {
    const stageLeads = leadRows.filter(l => l.stage === stage)
    const avgQuality = stageLeads.length ? Math.round(stageLeads.reduce((a, l) => a + (l.quality_score ?? 50), 0) / stageLeads.length) : 0
    const avgProb = stageLeads.length ? Math.round(stageLeads.reduce((a, l) => a + (l.probability ?? 0), 0) / stageLeads.length) : 0
    return { stage, count: stageLeads.length, avgQuality, avgProb }
  }), [leadRows])

  // ── Admin/CRM: Pipeline Movement ──
  const pipelineData = useMemo(() => STAGES.map(stage => {
    const stageLeads = leadRows.filter(l => l.stage === stage)
    const row: any = { stage, total: stageLeads.length }
    PRIORITY_KEYS.forEach(p => { row[p] = stageLeads.filter(l => (l.priority || 'medium') === p).length })
    row.avgQuality = stageLeads.length ? Math.round(stageLeads.reduce((a, l) => a + (l.quality_score ?? 50), 0) / stageLeads.length) : 0
    return row
  }), [leadRows])

  // ── Admin/CRM: SLA & Response Time ──
  const leadSlaCounts = useMemo(() => {
    const counts: Record<string, number> = { Breached: 0, 'At Risk': 0, 'On Time': 0, 'No SLA': 0 }
    leads.forEach(l => {
      const isDone = ['Converted', 'Lost'].includes(l.stage)
      const { label } = slaRiskStyle(l.sla_due_at, isDone)
      counts[label] = (counts[label] || 0) + 1
    })
    return counts
  }, [leads])
  const taskSlaCounts = useMemo(() => {
    const counts: Record<string, number> = { Breached: 0, 'At Risk': 0, 'On Time': 0, 'No SLA': 0 }
    tasks.forEach(t => {
      const { label } = slaRiskStyle(t.sla_due_at, t.status === 'done')
      counts[label] = (counts[label] || 0) + 1
    })
    return counts
  }, [tasks])
  const slaChartData = useMemo(() => SLA_LABELS.map(label => ({ name: label, Leads: leadSlaCounts[label], Tasks: taskSlaCounts[label] })), [leadSlaCounts, taskSlaCounts])

  // ── Admin/CRM: Task Completion ──
  const taskStatusCounts = useMemo(() => TASK_STATUSES.map(s => ({ name: s.label, value: taskRows.filter(t => t.status === s.value).length, color: s.color })), [taskRows])
  const totalTasks = taskRows.length
  const doneTasks = taskRows.filter(t => t.status === 'done').length
  const overdueTasks = useMemo(() => {
    const now = new Date().getTime()
    return taskRows.filter(t => t.status !== 'done' && t.due_date && new Date(t.due_date).getTime() < now).length
  }, [taskRows])

  // ── Admin/CRM: Project Health ──
  const healthCounts = useMemo(() => HEALTH_STATUSES.map(h => ({ name: h.label, value: projects.filter(p => (p.health || 'on-track') === h.value).length, color: h.color })), [projects])
  const avgProgress = projects.length ? Math.round(projects.reduce((a, p) => a + (p.progress || 0), 0) / projects.length) : 0

  // ── Founder: Combined Performance ──
  const latestMrr = revenueChartData[revenueChartData.length - 1]?.mrr || 0
  const latestMargin = revenueChartData[revenueChartData.length - 1]?.net_margin || 0
  const activePipelineLeads = leadRows.filter(l => !['Converted', 'Lost'].includes(l.stage))
  const pipelineValue = activePipelineLeads.reduce((a, l) => a + (l.value || 0), 0)
  const convertedLeads = leadRows.filter(l => l.stage === 'Converted').length
  const activeCampaigns = campaignRows.filter(c => c.status === 'active').length
  const campaignLeadsGenerated = campaignRows.reduce((a, c) => a + (c.leads_generated || 0), 0)
  const projectsOnTrack = projects.filter(p => (p.health || 'on-track') === 'on-track').length
  const openTasksCount = tasks.filter(t => t.status !== 'done').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-5 h-5 border-2 border-[var(--cp-border)] border-t-[var(--cp-text-muted)] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--cp-text)] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--cp-text-faint)]" /> Reports
          </h1>
          <p className="text-[var(--cp-text-faint)] text-[13px] mt-0.5">Role-aware report catalog with date-range filtering and CSV export.</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[var(--cp-text-faint)]" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 rounded-xl text-[12px] text-[var(--cp-text-secondary)] outline-none" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }} />
          <span className="text-[var(--cp-text-faint)] text-[12px]">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 rounded-xl text-[12px] text-[var(--cp-text-secondary)] outline-none" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }} />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo('') }} className="text-[11px] text-[var(--cp-text-faint)] hover:text-[var(--cp-text-secondary)] transition-colors px-2">Clear</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit flex-wrap" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${tab === t.id ? 'bg-[var(--cp-cyan)] text-white' : 'text-[var(--cp-text-muted)] hover:text-[var(--cp-text-secondary)]'}`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ───────── Founder: Revenue ───────── */}
      {tab === 'revenue' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Kpi label="Latest MRR" value={`₹${latestMrr.toLocaleString('en-IN')}`} icon={Wallet} />
            <Kpi label="Latest ARR" value={`₹${(latestMrr * 12).toLocaleString('en-IN')}`} icon={TrendingUp} />
            <Kpi label="Latest Expenses" value={`₹${(revenueChartData[revenueChartData.length - 1]?.expenses || 0).toLocaleString('en-IN')}`} icon={Activity} />
            <Kpi label="Latest Net Margin" value={`${latestMargin}%`} icon={Gauge} />
          </div>
          <ChartCard title="Revenue & Expenses">
            {revenueChartData.length === 0 ? <EmptyChart icon={Wallet} message="No revenue data for this range." /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartTheme.series[0]} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={chartTheme.series[0]} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartTheme.series[2]} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={chartTheme.series[2]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} width={40} />
                  <RTooltip {...tooltipStyle} formatter={(value: any, name: any) => [`₹${Number(value).toLocaleString('en-IN')}`, name === 'mrr' ? 'Revenue' : 'Expenses']} />
                  <Area type="monotone" dataKey="mrr" stroke={chartTheme.series[0]} strokeWidth={1.5} fillOpacity={1} fill="url(#colorMrr)" dot={false} />
                  <Area type="monotone" dataKey="expenses" stroke={chartTheme.series[2]} strokeWidth={1} fillOpacity={1} fill="url(#colorExp)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
          <ReportTable
            headers={['Month', 'MRR', 'Expenses', 'Net Margin']}
            rows={revenueChartData.map(r => [r.name, `₹${r.mrr.toLocaleString('en-IN')}`, `₹${r.expenses.toLocaleString('en-IN')}`, `${r.net_margin}%`])}
            onExport={() => downloadCSV('revenue-report.csv', ['Month', 'MRR', 'Expenses', 'Net Margin %'], revenueChartData.map(r => [r.name, r.mrr, r.expenses, r.net_margin]))}
          />
        </>
      )}

      {/* ───────── Founder: Profitability ───────── */}
      {tab === 'profitability' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Kpi label="Total Profit" value={`₹${profitData.reduce((a, r) => a + r.profit, 0).toLocaleString('en-IN')}`} icon={Wallet} />
            <Kpi label="Avg Margin" value={`${profitData.length ? (profitData.reduce((a, r) => a + r.margin, 0) / profitData.length).toFixed(1) : '0'}%`} icon={Gauge} />
            <Kpi label="Best Month" value={profitData.length ? profitData.reduce((best, r) => r.profit > best.profit ? r : best, profitData[0]).name : '-'} icon={TrendingUp} />
            <Kpi label="Months Tracked" value={profitData.length} icon={Activity} />
          </div>
          <ChartCard title="Monthly Profit">
            {profitData.length === 0 ? <EmptyChart icon={Wallet} message="No profitability data for this range." /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} width={40} />
                  <RTooltip {...tooltipStyle} formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Profit']} />
                  <Bar dataKey="profit" fill={chartTheme.series[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
          <ReportTable
            headers={['Month', 'Revenue', 'Expenses', 'Profit', 'Margin']}
            rows={profitData.map(r => [r.name, `₹${r.mrr.toLocaleString('en-IN')}`, `₹${r.expenses.toLocaleString('en-IN')}`, `₹${r.profit.toLocaleString('en-IN')}`, `${r.margin.toFixed(1)}%`])}
            onExport={() => downloadCSV('profitability-report.csv', ['Month', 'Revenue', 'Expenses', 'Profit', 'Margin %'], profitData.map(r => [r.name, r.mrr, r.expenses, r.profit, r.margin.toFixed(1)]))}
          />
        </>
      )}

      {/* ───────── Founder: Subscription Spend ───────── */}
      {tab === 'subscriptions' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Kpi label="Total Monthly Spend" value={`₹${activeSubs.reduce((a, s) => a + (s.monthly_cost || 0), 0).toLocaleString('en-IN')}`} icon={Wallet} />
            <Kpi label="Total Yearly Spend" value={`₹${activeSubs.reduce((a, s) => a + (s.yearly_cost || 0), 0).toLocaleString('en-IN')}`} icon={TrendingUp} />
            <Kpi label="Active Tools" value={activeSubs.length} icon={ListChecks} />
            <Kpi label="Renewals Due (30d)" value={renewalsSoon} icon={Calendar} />
          </div>
          <ChartCard title="Monthly Cost by Category">
            {subCategoryData.length === 0 ? <EmptyChart icon={ListChecks} message="No subscription data yet." /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subCategoryData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} width={50} />
                  <RTooltip {...tooltipStyle} formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Monthly Cost']} />
                  <Bar dataKey="total" fill={chartTheme.series[2]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
          <ReportTable
            headers={['Name', 'Category', 'Monthly Cost', 'Yearly Cost', 'Status', 'Renewal Date', 'Owner']}
            rows={subscriptions.map(s => [
              s.name,
              SUB_CATEGORY_LABELS[s.category] || s.category,
              `₹${(s.monthly_cost || 0).toLocaleString('en-IN')}`,
              `₹${(s.yearly_cost || 0).toLocaleString('en-IN')}`,
              <Pill key="status" label={s.status} color={s.status === 'active' ? 'var(--cp-emerald)' : s.status === 'expiring' ? 'var(--cp-amber)' : 'var(--cp-text-muted)'} bg={s.status === 'active' ? 'var(--cp-emerald-soft)' : s.status === 'expiring' ? 'var(--cp-amber-soft)' : 'var(--cp-surface)'} border={s.status === 'active' ? 'var(--cp-emerald-border)' : s.status === 'expiring' ? 'var(--cp-amber-border)' : 'var(--cp-border)'} />,
              s.renewal_date || '-',
              s.owner || '-',
            ])}
            onExport={() => downloadCSV('subscription-spend-report.csv', ['Name', 'Category', 'Monthly Cost', 'Yearly Cost', 'Billing Cycle', 'Status', 'Renewal Date', 'Owner', 'Priority'], subscriptions.map(s => [s.name, SUB_CATEGORY_LABELS[s.category] || s.category, s.monthly_cost || 0, s.yearly_cost || 0, s.billing_cycle, s.status, s.renewal_date || '', s.owner || '', s.priority]))}
          />
        </>
      )}

      {/* ───────── Founder: Combined Performance ───────── */}
      {tab === 'combined' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Kpi label="MRR" value={`₹${latestMrr.toLocaleString('en-IN')}`} icon={Wallet} />
            <Kpi label="Net Margin" value={`${latestMargin}%`} icon={Gauge} />
            <Kpi label="Pipeline Value" value={`₹${pipelineValue.toLocaleString('en-IN')}`} icon={TrendingUp} />
            <Kpi label="Leads Converted" value={`${convertedLeads} / ${leadRows.length}`} icon={Activity} />
            <Kpi label="Active Campaigns" value={activeCampaigns} icon={Megaphone} />
            <Kpi label="Leads from Campaigns" value={campaignLeadsGenerated} icon={TrendingUp} />
            <Kpi label="Projects On Track" value={`${projectsOnTrack} / ${projects.length}`} icon={FolderKanban} />
            <Kpi label="Open Tasks" value={openTasksCount} icon={ListChecks} />
          </div>
          <ChartCard title="Revenue Trend">
            {revenueChartData.length === 0 ? <EmptyChart icon={Wallet} message="No revenue data for this range." /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMrr2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartTheme.series[0]} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={chartTheme.series[0]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} width={40} />
                  <RTooltip {...tooltipStyle} formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']} />
                  <Area type="monotone" dataKey="mrr" stroke={chartTheme.series[0]} strokeWidth={1.5} fillOpacity={1} fill="url(#colorMrr2)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
          <ReportTable
            headers={['Department', 'Metric', 'Value']}
            rows={[
              ['Finance', 'MRR', `₹${latestMrr.toLocaleString('en-IN')}`],
              ['Finance', 'Net Margin', `${latestMargin}%`],
              ['Sales', 'Pipeline Value', `₹${pipelineValue.toLocaleString('en-IN')}`],
              ['Sales', 'Leads Converted', `${convertedLeads} / ${leadRows.length}`],
              ['Marketing', 'Active Campaigns', activeCampaigns],
              ['Marketing', 'Leads Generated', campaignLeadsGenerated],
              ['Operations', 'Projects On Track', `${projectsOnTrack} / ${projects.length}`],
              ['Operations', 'Open Tasks', openTasksCount],
            ]}
            onExport={() => downloadCSV('combined-performance-report.csv', ['Department', 'Metric', 'Value'], [
              ['Finance', 'MRR', latestMrr],
              ['Finance', 'Net Margin %', latestMargin],
              ['Sales', 'Pipeline Value', pipelineValue],
              ['Sales', 'Leads Converted', `${convertedLeads}/${leadRows.length}`],
              ['Marketing', 'Active Campaigns', activeCampaigns],
              ['Marketing', 'Leads Generated', campaignLeadsGenerated],
              ['Operations', 'Projects On Track', `${projectsOnTrack}/${projects.length}`],
              ['Operations', 'Open Tasks', openTasksCount],
            ])}
          />
        </>
      )}

      {/* ───────── Marketing: Campaign Performance ───────── */}
      {tab === 'campaigns' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Kpi label="Active Campaigns" value={campaignRows.filter(c => c.status === 'active').length} icon={Megaphone} />
            <Kpi label="Total Campaigns" value={campaignRows.length} icon={ListChecks} />
            <Kpi label="Leads Generated" value={campaignRows.reduce((a, c) => a + (c.leads_generated || 0), 0)} icon={TrendingUp} />
            <Kpi label="Avg Conversion Rate" value={`${campaignRows.length ? (campaignRows.reduce((a, c) => a + (c.conversion_rate || 0), 0) / campaignRows.length).toFixed(1) : '0'}%`} icon={Gauge} />
          </div>
          <ChartCard title="Leads Generated by Campaign">
            {campaignChartData.length === 0 ? <EmptyChart icon={Megaphone} message="No campaign data for this range." /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} width={30} />
                  <RTooltip {...tooltipStyle} formatter={(value: any) => [value, 'Leads Generated']} />
                  <Bar dataKey="leads" fill={chartTheme.series[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
          <ReportTable
            headers={['Campaign', 'Channel', 'Status', 'Leads Generated', 'Conversion Rate', 'Start', 'End']}
            rows={campaignRows.map(c => [
              c.name,
              c.channel || '-',
              <Pill key="status" label={c.status} color="var(--cp-cyan)" bg="var(--cp-cyan-soft)" border="var(--cp-cyan-border)" />,
              c.leads_generated || 0,
              `${c.conversion_rate || 0}%`,
              c.start_date || '-',
              c.end_date || '-',
            ])}
            onExport={() => downloadCSV('campaign-performance-report.csv', ['Campaign', 'Channel', 'Status', 'Leads Generated', 'Conversion Rate', 'Start Date', 'End Date'], campaignRows.map(c => [c.name, c.channel || '', c.status, c.leads_generated || 0, c.conversion_rate || 0, c.start_date || '', c.end_date || '']))}
          />
        </>
      )}

      {/* ───────── Marketing: Lead-Gen Trends ───────── */}
      {tab === 'leadgen' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Kpi label="Total Leads" value={leadRows.length} icon={TrendingUp} />
            <Kpi label="This Month" value={leadGenData[leadGenData.length - 1]?.count || 0} icon={Calendar} />
            <Kpi label="Avg Quality Score" value={leadRows.length ? Math.round(leadRows.reduce((a, l) => a + (l.quality_score ?? 50), 0) / leadRows.length) : 0} icon={Gauge} />
            <Kpi label="Avg Conv. Probability" value={`${leadRows.length ? Math.round(leadRows.reduce((a, l) => a + (l.probability ?? 0), 0) / leadRows.length) : 0}%`} icon={Activity} />
          </div>
          <ChartCard title="New Leads Over Time">
            {leadGenData.length === 0 ? <EmptyChart icon={TrendingUp} message="No lead data for this range." /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leadGenData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartTheme.series[0]} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={chartTheme.series[0]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
                  <RTooltip {...tooltipStyle} formatter={(value: any) => [value, 'New Leads']} />
                  <Area type="monotone" dataKey="count" stroke={chartTheme.series[0]} strokeWidth={1.5} fillOpacity={1} fill="url(#colorLeads)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
          <ReportTable
            headers={['Month', 'New Leads', 'Avg Quality Score']}
            rows={leadGenData.map(d => [d.name, d.count, d.avgQuality])}
            onExport={() => downloadCSV('lead-gen-trends-report.csv', ['Month', 'New Leads', 'Avg Quality Score'], leadGenData.map(d => [d.name, d.count, d.avgQuality]))}
          />
        </>
      )}

      {/* ───────── Marketing: Funnel Conversion ───────── */}
      {tab === 'funnel' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Kpi label="Total Leads" value={leadRows.length} icon={TrendingUp} />
            <Kpi label="Converted" value={funnelData.find(f => f.stage === 'Converted')?.count || 0} icon={Activity} />
            <Kpi label="Conversion Rate" value={`${leadRows.length ? Math.round((funnelData.find(f => f.stage === 'Converted')?.count || 0) / leadRows.length * 100) : 0}%`} icon={Gauge} />
            <Kpi label="Avg Probability" value={`${leadRows.length ? Math.round(leadRows.reduce((a, l) => a + (l.probability ?? 0), 0) / leadRows.length) : 0}%`} icon={TrendingUp} />
          </div>
          <ChartCard title="Leads by Stage">
            {leadRows.length === 0 ? <EmptyChart icon={Gauge} message="No lead data for this range." /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="stage" stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
                  <RTooltip {...tooltipStyle} formatter={(value: any) => [value, 'Leads']} />
                  <Bar dataKey="count" fill={chartTheme.series[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
          <ReportTable
            headers={['Stage', 'Count', '% of Total', 'Avg Quality Score', 'Avg Conv. Probability']}
            rows={funnelData.map(f => [f.stage, f.count, `${leadRows.length ? Math.round(f.count / leadRows.length * 100) : 0}%`, f.avgQuality, `${f.avgProb}%`])}
            onExport={() => downloadCSV('funnel-conversion-report.csv', ['Stage', 'Count', '% of Total', 'Avg Quality Score', 'Avg Conv. Probability'], funnelData.map(f => [f.stage, f.count, leadRows.length ? Math.round(f.count / leadRows.length * 100) : 0, f.avgQuality, f.avgProb]))}
          />
        </>
      )}

      {/* ───────── Admin/CRM: Pipeline Movement ───────── */}
      {tab === 'pipeline' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Kpi label="Total Leads" value={leadRows.length} icon={TrendingUp} />
            <Kpi label="Active Pipeline" value={leadRows.filter(l => !['Converted', 'Lost'].includes(l.stage)).length} icon={Activity} />
            <Kpi label="Converted" value={leadRows.filter(l => l.stage === 'Converted').length} icon={Gauge} />
            <Kpi label="Avg Quality Score" value={leadRows.length ? Math.round(leadRows.reduce((a, l) => a + (l.quality_score ?? 50), 0) / leadRows.length) : 0} icon={Gauge} />
          </div>
          <ChartCard
            title="Pipeline by Stage & Priority"
            legend={
              <div className="flex items-center gap-3">
                {PRIORITY_KEYS.map(p => (
                  <div key={p} className="flex items-center gap-1.5 text-[10px] text-[var(--cp-text-faint)]">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: priorityStyle(p).color }} /> {priorityStyle(p).label}
                  </div>
                ))}
              </div>
            }
          >
            {leadRows.length === 0 ? <EmptyChart icon={Activity} message="No lead data for this range." /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="stage" stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
                  <RTooltip {...tooltipStyle} />
                  {PRIORITY_KEYS.map(p => (
                    <Bar key={p} dataKey={p} stackId="priority" name={priorityStyle(p).label} fill={priorityStyle(p).color} radius={p === 'critical' ? [4, 4, 0, 0] : undefined} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
          <ReportTable
            headers={['Stage', 'Total', 'Critical', 'High', 'Medium', 'Low', 'Avg Quality']}
            rows={pipelineData.map(r => [r.stage, r.total, r.critical, r.high, r.medium, r.low, r.avgQuality])}
            onExport={() => downloadCSV('pipeline-movement-report.csv', ['Stage', 'Total', 'Critical', 'High', 'Medium', 'Low', 'Avg Quality Score'], pipelineData.map(r => [r.stage, r.total, r.critical, r.high, r.medium, r.low, r.avgQuality]))}
          />
        </>
      )}

      {/* ───────── Admin/CRM: SLA & Response Time ───────── */}
      {tab === 'sla' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Kpi label="Breached" value={leadSlaCounts.Breached + taskSlaCounts.Breached} icon={ShieldAlert} />
            <Kpi label="At Risk" value={leadSlaCounts['At Risk'] + taskSlaCounts['At Risk']} icon={ShieldAlert} />
            <Kpi label="On Time" value={leadSlaCounts['On Time'] + taskSlaCounts['On Time']} icon={Gauge} />
            <Kpi
              label="SLA Compliance"
              value={(() => {
                const onTime = leadSlaCounts['On Time'] + taskSlaCounts['On Time']
                const atRisk = leadSlaCounts['At Risk'] + taskSlaCounts['At Risk']
                const breached = leadSlaCounts.Breached + taskSlaCounts.Breached
                const total = onTime + atRisk + breached
                return `${total ? Math.round(onTime / total * 100) : 100}%`
              })()}
              icon={Activity}
            />
          </div>
          <ChartCard
            title="SLA Status — Leads vs Tasks"
            legend={
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--cp-text-faint)]"><div className="w-1.5 h-1.5 rounded-full" style={{ background: chartTheme.series[0] }} /> Leads</div>
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--cp-text-faint)]"><div className="w-1.5 h-1.5 rounded-full" style={{ background: chartTheme.series[3] }} /> Tasks</div>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slaChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="name" stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
                <RTooltip {...tooltipStyle} />
                <Bar dataKey="Leads" fill={chartTheme.series[0]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Tasks" fill={chartTheme.series[3]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ReportTable
            headers={['SLA Status', 'Leads', 'Tasks', 'Total']}
            rows={SLA_LABELS.map(label => [
              <Pill key="label" label={label} color={SLA_COLORS[label]} bg={`color-mix(in srgb, ${SLA_COLORS[label]} 8%, transparent)`} border={`color-mix(in srgb, ${SLA_COLORS[label]} 20%, transparent)`} />,
              leadSlaCounts[label], taskSlaCounts[label], leadSlaCounts[label] + taskSlaCounts[label],
            ])}
            onExport={() => downloadCSV('sla-response-time-report.csv', ['SLA Status', 'Leads', 'Tasks', 'Total'], SLA_LABELS.map(label => [label, leadSlaCounts[label], taskSlaCounts[label], leadSlaCounts[label] + taskSlaCounts[label]]))}
          />
        </>
      )}

      {/* ───────── Admin/CRM: Task Completion ───────── */}
      {tab === 'tasks' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Kpi label="Total Tasks" value={totalTasks} icon={ListChecks} />
            <Kpi label="Completed" value={doneTasks} icon={Activity} />
            <Kpi label="Completion Rate" value={`${totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0}%`} icon={Gauge} />
            <Kpi label="Overdue" value={overdueTasks} icon={ShieldAlert} />
          </div>
          <ChartCard title="Tasks by Status">
            {totalTasks === 0 ? <EmptyChart icon={ListChecks} message="No task data for this range." /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskStatusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                    {taskStatusCounts.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <RTooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
          <ReportTable
            headers={['Status', 'Count', '% of Total']}
            rows={taskStatusCounts.map(s => [
              <Pill key="status" label={s.name} color={s.color} bg={`${s.color}14`} border={`${s.color}33`} />,
              s.value, `${totalTasks ? Math.round(s.value / totalTasks * 100) : 0}%`,
            ])}
            onExport={() => downloadCSV('task-completion-report.csv', ['Status', 'Count', '% of Total'], taskStatusCounts.map(s => [s.name, s.value, totalTasks ? Math.round(s.value / totalTasks * 100) : 0]))}
          />
        </>
      )}

      {/* ───────── Admin/CRM: Project Health ───────── */}
      {tab === 'projects' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Kpi label="On Track" value={healthCounts.find(h => h.name === 'On Track')?.value || 0} icon={Gauge} />
            <Kpi label="At Risk" value={healthCounts.find(h => h.name === 'At Risk')?.value || 0} icon={ShieldAlert} />
            <Kpi label="Delayed" value={healthCounts.find(h => h.name === 'Delayed')?.value || 0} icon={ShieldAlert} />
            <Kpi label="Avg Progress" value={`${avgProgress}%`} icon={Activity} />
          </div>
          <ChartCard title="Project Health Distribution">
            {projects.length === 0 ? <EmptyChart icon={FolderKanban} message="No project data yet." /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={healthCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                    {healthCounts.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <RTooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
          <ReportTable
            headers={['Project', 'Stage', 'Health', 'Progress']}
            rows={projects.map(p => {
              const h = HEALTH_STATUSES.find(hs => hs.value === (p.health || 'on-track')) || HEALTH_STATUSES[0]
              return [
                p.name,
                p.stage || '-',
                <Pill key="health" label={h.label} color={h.color} bg={`${h.color}14`} border={`${h.color}33`} />,
                `${p.progress || 0}%`,
              ]
            })}
            onExport={() => downloadCSV('project-health-report.csv', ['Project', 'Stage', 'Health', 'Progress'], projects.map(p => [p.name, p.stage || '', (HEALTH_STATUSES.find(hs => hs.value === (p.health || 'on-track')) || HEALTH_STATUSES[0]).label, p.progress || 0]))}
          />
        </>
      )}
    </div>
  )
}
