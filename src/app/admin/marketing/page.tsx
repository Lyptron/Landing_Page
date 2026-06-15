'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList,
} from 'recharts'
import { Megaphone, Target, Gauge, TrendingUp, Radio, AlertTriangle, Clock, ArrowRight, Sparkles } from 'lucide-react'
import { fetchLeads, fetchCampaigns, fetchMarketingTasks, updateLead } from '@/lib/db'
import { priorityStyle, qualityColor, followupUrgency } from '@/lib/badges'
import Modal, { ModalSelect, ModalInput } from '@/components/ui/Modal'
import { useChartTheme, tooltipContentStyle } from '@/lib/theme/chartTheme'

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost']

const STAGE_OPTIONS = STAGES.map(s => ({ value: s, label: s }))
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export default function MarketingDashboard() {
  const [leads, setLeads] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Edit Lead State
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ stage: 'New', priority: 'medium', quality_score: '50', next_followup_at: '' })

  const chartTheme = useChartTheme()

  useEffect(() => {
    async function loadData() {
      const [leadsRes, campaignsRes, tasksRes] = await Promise.all([
        fetchLeads(),
        fetchCampaigns(),
        fetchMarketingTasks(),
      ])
      if (leadsRes.data) setLeads(leadsRes.data)
      if (campaignsRes.data) setCampaigns(campaignsRes.data)
      if (tasksRes.data) setTasks(tasksRes.data)
      setLoading(false)
    }
    loadData()
  }, [])

  const openEditModal = (lead: any) => {
    setSelectedLead(lead)
    setForm({
      stage: lead.stage || 'New',
      priority: lead.priority || 'medium',
      quality_score: String(lead.quality_score ?? 50),
      next_followup_at: lead.next_followup_at ? lead.next_followup_at.slice(0, 10) : '',
    })
    setEditModalOpen(true)
  }

  const handleUpdateLead = async () => {
    if (!selectedLead) return
    setSaving(true)
    const updates = {
      stage: form.stage,
      priority: form.priority,
      quality_score: Number(form.quality_score) || 50,
      next_followup_at: form.next_followup_at || null,
    }
    await updateLead(selectedLead.id, updates)
    setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, ...updates } : l))
    setSaving(false)
    setEditModalOpen(false)
  }

  // ── KPIs (non-monetary) ──
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const leadsGenerated = campaigns.reduce((acc, c) => acc + (c.leads_generated || 0), 0)
  const convertedCount = leads.filter(l => l.stage === 'Converted').length
  const conversionRate = leads.length ? Math.round((convertedCount / leads.length) * 1000) / 10 : 0
  const avgQuality = leads.length ? Math.round(leads.reduce((acc, l) => acc + (l.quality_score ?? 50), 0) / leads.length) : 0

  // ── Traffic source breakdown ──
  const sourceCounts: Record<string, number> = {}
  leads.forEach(l => { const src = l.source || 'Unknown'; sourceCounts[src] = (sourceCounts[src] || 0) + 1 })
  const sourceData = Object.entries(sourceCounts).map(([source, count]) => ({ source, count }))

  // ── Funnel data (lead counts per stage, excluding Lost) ──
  const funnelData = STAGES.filter(s => s !== 'Lost').map((stage, i) => ({
    name: stage,
    value: leads.filter(l => l.stage === stage).length,
    fill: chartTheme.series[i % chartTheme.series.length],
  }))

  // ── Channel performance cards ──
  const channelMap: Record<string, { campaigns: number; leadsGen: number; convSum: number; active: number }> = {}
  campaigns.forEach(c => {
    const ch = c.channel || 'Other'
    if (!channelMap[ch]) channelMap[ch] = { campaigns: 0, leadsGen: 0, convSum: 0, active: 0 }
    channelMap[ch].campaigns += 1
    channelMap[ch].leadsGen += c.leads_generated || 0
    channelMap[ch].convSum += c.conversion_rate || 0
    if (c.status === 'active') channelMap[ch].active += 1
  })
  const channelData = Object.entries(channelMap).map(([channel, v]) => ({
    channel,
    campaigns: v.campaigns,
    leadsGen: v.leadsGen,
    avgConv: v.campaigns ? Math.round((v.convSum / v.campaigns) * 10) / 10 : 0,
    active: v.active,
  }))

  // ── Notifications ──
  const now = new Date().getTime()
  const newLeads = leads.filter(l => l.created_at && (now - new Date(l.created_at).getTime()) < 86400000)
  const delayedCampaigns = campaigns.filter(c => c.end_date && new Date(c.end_date).getTime() < now && !['completed', 'archived'].includes(c.status))
  const dueTasks = tasks.filter(t => t.due_date && t.status !== 'done' && (new Date(t.due_date).getTime() - now) < 3 * 86400000)
  const notifications = [
    ...newLeads.map(l => ({ icon: Sparkles, color: 'var(--cp-emerald)', text: `New lead: ${l.company}`, sub: 'New lead activity' })),
    ...delayedCampaigns.map(c => ({ icon: AlertTriangle, color: 'var(--cp-red)', text: `Campaign delayed: ${c.name}`, sub: 'Past end date, still active' })),
    ...dueTasks.map(t => ({ icon: Clock, color: 'var(--cp-amber)', text: `Content due: ${t.title}`, sub: t.due_date ? `Due ${new Date(t.due_date).toLocaleDateString('en-IN')}` : 'Due soon' })),
  ].slice(0, 8)

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--cp-text)]">Marketing Hub</h1>
          <p className="text-[var(--cp-text-faint)] text-[13px] mt-0.5">Campaign performance, lead generation, and content pipeline.</p>
        </div>
        <Link href="/admin/campaigns" className="flex items-center gap-1.5 px-4 py-2 bg-[var(--cp-cyan)] text-white font-semibold text-[12px] rounded-xl hover:bg-[var(--cp-cyan-strong)] transition-all" style={{ boxShadow: '0 0 12px color-mix(in srgb, var(--cp-cyan) 30%, transparent)' }}>
          <Megaphone className="w-3.5 h-3.5" /> Campaigns <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          { label: 'Active Campaigns', value: String(activeCampaigns), icon: Megaphone, color: 'text-[var(--cp-emerald)]' },
          { label: 'Leads Generated', value: String(leadsGenerated || leads.length), icon: TrendingUp, color: 'text-[var(--cp-cyan)]' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, icon: Target, color: 'text-[var(--cp-violet)]' },
          { label: 'Avg Lead Quality', value: String(avgQuality), icon: Gauge, color: 'text-[var(--cp-amber)]' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl flex items-start justify-between"
            style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}
          >
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--cp-text-faint)] mb-1">{kpi.label}</p>
              <p className={`text-[24px] font-display font-bold tracking-tight ${kpi.color}`}>{kpi.value}</p>
            </div>
            <kpi.icon className={`w-5 h-5 ${kpi.color} opacity-50`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Traffic source chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
          <h3 className="text-[13px] font-bold text-[var(--cp-text-secondary)] mb-4">Lead Sources</h3>
          {sourceData.length === 0 ? (
            <div className="py-12 text-center text-[var(--cp-text-faint)] text-[13px]">No lead source data yet.</div>
          ) : (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="source" tick={{ fill: chartTheme.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: chartTheme.axis, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipContentStyle(chartTheme)} cursor={{ fill: chartTheme.cursorFill }} />
                  <Bar dataKey="count" fill={chartTheme.series[0]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="p-5 rounded-2xl" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
          <h3 className="text-[13px] font-bold text-[var(--cp-text-secondary)] mb-4">Notifications</h3>
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-[var(--cp-text-faint)] text-[13px]">All clear. No notifications.</div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
              {notifications.map((n, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl" style={{ background: 'var(--cp-surface-strong)', border: '1px solid var(--cp-border-soft)' }}>
                  <n.icon className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: n.color }} />
                  <div className="min-w-0">
                    <p className="text-[12px] text-[var(--cp-text-secondary)] truncate">{n.text}</p>
                    <p className="text-[10px] text-[var(--cp-text-faint)]">{n.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Marketing funnel */}
        <div className="p-5 rounded-2xl" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
          <h3 className="text-[13px] font-bold text-[var(--cp-text-secondary)] mb-4">Marketing Funnel</h3>
          {leads.length === 0 ? (
            <div className="py-12 text-center text-[var(--cp-text-faint)] text-[13px]">No leads yet.</div>
          ) : (
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip contentStyle={tooltipContentStyle(chartTheme)} />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="right" fill={chartTheme.tooltipItem} stroke="none" dataKey="name" fontSize={11} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Channel performance */}
        <div className="lg:col-span-2 p-5 rounded-2xl" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
          <h3 className="text-[13px] font-bold text-[var(--cp-text-secondary)] mb-4">Channel Performance</h3>
          {channelData.length === 0 ? (
            <div className="py-12 text-center text-[var(--cp-text-faint)] text-[13px]">No campaigns yet. Add one from the Campaigns page.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {channelData.map((c) => (
                <div key={c.channel} className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'var(--cp-surface-strong)', border: '1px solid var(--cp-border-soft)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--cp-cyan-soft)', border: '1px solid var(--cp-cyan-border)' }}>
                    <Radio className="w-4 h-4 text-[var(--cp-cyan)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-[var(--cp-text)] truncate">{c.channel}</p>
                    <p className="text-[10px] text-[var(--cp-text-faint)] font-mono">{c.campaigns} campaigns · {c.active} active</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-mono text-[var(--cp-text-secondary)]">{c.leadsGen}</p>
                    <p className="text-[9px] text-[var(--cp-text-faint)] uppercase tracking-wider">leads · {c.avgConv}% conv</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="p-5 rounded-2xl" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[13px] font-bold text-[var(--cp-text-secondary)]">Recent Leads</h3>
          <p className="text-[11px] text-[var(--cp-text-faint)]">Click a lead to edit</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-[var(--cp-border)] border-t-[var(--cp-text-muted)] rounded-full animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <div className="py-8 text-center text-[var(--cp-text-faint)] text-[13px]">No leads found.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {leads.slice(0, 10).map(lead => {
              const pStyle = priorityStyle(lead.priority)
              const urgency = followupUrgency(lead.next_followup_at)
              return (
                <div
                  key={lead.id}
                  onClick={() => openEditModal(lead)}
                  className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-[var(--cp-surface-strong)] transition-colors border border-transparent hover:border-[var(--cp-border)] gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-[var(--cp-text)] truncate">{lead.company}</p>
                    <p className="text-[11px] text-[var(--cp-text-faint)] font-mono truncate">{lead.contact}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    <span className="text-[10px] uppercase tracking-[0.1em] font-bold px-2 py-0.5 rounded bg-[var(--cp-surface-strong)] text-[var(--cp-text-muted)]">{lead.stage}</span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md" style={{ color: pStyle.color, background: pStyle.bg, border: `1px solid ${pStyle.border}` }}>
                      {pStyle.label}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-md" style={{ color: qualityColor(lead.quality_score), background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
                      <Gauge className="w-3 h-3" /> {lead.quality_score ?? 50}
                    </span>
                    <span className="text-[9px] font-mono text-[var(--cp-text-faint)] px-2 py-0.5 rounded-md" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
                      {lead.probability}% conv.
                    </span>
                    {urgency && (
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md" style={{ color: urgency.color, background: urgency.bg, border: `1px solid ${urgency.border}` }}>
                        <Clock className="w-2.5 h-2.5" /> {urgency.label}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Lead Details"
        subtitle={`Updating details for ${selectedLead?.company || ''}`}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <ModalSelect label="Stage" value={form.stage} onChange={(v) => setForm({ ...form, stage: v })} options={STAGE_OPTIONS} />
            <ModalSelect label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={PRIORITY_OPTIONS} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Quality Score (0-100)" value={form.quality_score} onChange={(v) => setForm({ ...form, quality_score: v })} placeholder="50" type="number" />
            <ModalInput label="Next Follow-up" value={form.next_followup_at} onChange={(v) => setForm({ ...form, next_followup_at: v })} type="date" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--cp-border-soft)]">
            <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-[var(--cp-text-faint)] hover:text-[var(--cp-text-secondary)] transition-colors">
              Cancel
            </button>
            <button onClick={handleUpdateLead} disabled={saving} className="px-5 py-2 bg-[var(--cp-cyan)] text-white font-semibold text-[12px] rounded-xl hover:bg-[var(--cp-cyan-strong)] transition-all disabled:opacity-30">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
