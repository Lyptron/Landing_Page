'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Megaphone, TrendingUp, Target, Calendar, Trash2, Radio, ListChecks } from 'lucide-react'
import { fetchCampaigns, insertCampaign, updateCampaign, deleteCampaign, fetchMarketingTasks, insertMarketingTask, updateMarketingTask, deleteMarketingTask } from '@/lib/db'
import { useAdminAuth } from '@/lib/AdminAuthContext'
import RestrictedValue from '@/components/ui/RestrictedValue'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'

const CHANNELS = ['Social Media', 'Email', 'SEO', 'Paid Ads', 'Content', 'Events', 'Referral', 'Other']
const CAMPAIGN_STATUSES = ['planning', 'active', 'paused', 'completed', 'archived']
const TASK_STATUSES = ['todo', 'in-progress', 'review', 'done', 'archived']

function campaignStatusStyle(status: string | null | undefined) {
  switch (status) {
    case 'active': return { color: 'var(--cp-emerald)', bg: 'var(--cp-emerald-soft)', border: 'var(--cp-emerald-border)' }
    case 'paused': return { color: 'var(--cp-amber)', bg: 'var(--cp-amber-soft)', border: 'var(--cp-amber-border)' }
    case 'completed': return { color: 'var(--cp-cyan)', bg: 'var(--cp-cyan-soft)', border: 'var(--cp-cyan-border)' }
    case 'archived': return { color: 'var(--cp-text-faint)', bg: 'var(--cp-surface)', border: 'var(--cp-border-soft)' }
    default: return { color: 'var(--cp-violet)', bg: 'var(--cp-violet-soft)', border: 'var(--cp-violet-border)' }
  }
}

function taskStatusStyle(status: string | null | undefined) {
  switch (status) {
    case 'done': return { color: 'var(--cp-emerald)', bg: 'var(--cp-emerald-soft)', border: 'var(--cp-emerald-border)' }
    case 'review': return { color: 'var(--cp-amber)', bg: 'var(--cp-amber-soft)', border: 'var(--cp-amber-border)' }
    case 'in-progress': return { color: 'var(--cp-cyan)', bg: 'var(--cp-cyan-soft)', border: 'var(--cp-cyan-border)' }
    case 'archived': return { color: 'var(--cp-text-faint)', bg: 'var(--cp-surface)', border: 'var(--cp-border-soft)' }
    default: return { color: 'var(--cp-violet)', bg: 'var(--cp-violet-soft)', border: 'var(--cp-violet-border)' }
  }
}

function nextStatus(list: string[], current: string | null | undefined) {
  const idx = list.indexOf(current || list[0])
  return list[(idx + 1) % list.length]
}

const emptyCampaignForm = {
  name: '', channel: CHANNELS[0], status: 'planning', budget: '', leads_generated: '', conversion_rate: '', start_date: '', end_date: '',
}

const emptyTaskForm = {
  title: '', platform: '', status: 'todo', owner: '', due_date: '', campaign_id: '',
}

export default function CampaignsPage() {
  const { user } = useAdminAuth()
  const isFounder = user?.role === 'founder'
  const [tab, setTab] = useState<'campaigns' | 'calendar'>('campaigns')
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [campaignModalOpen, setCampaignModalOpen] = useState(false)
  const [campaignForm, setCampaignForm] = useState(emptyCampaignForm)
  const [savingCampaign, setSavingCampaign] = useState(false)

  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskForm, setTaskForm] = useState(emptyTaskForm)
  const [savingTask, setSavingTask] = useState(false)

  useEffect(() => {
    async function load() {
      const [campaignsRes, tasksRes] = await Promise.all([fetchCampaigns(), fetchMarketingTasks()])
      if (campaignsRes.data) setCampaigns(campaignsRes.data)
      if (tasksRes.data) setTasks(tasksRes.data)
      setLoading(false)
    }
    load()
  }, [])

  // ── KPIs ──
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalLeadsGenerated = campaigns.reduce((acc, c) => acc + (c.leads_generated || 0), 0)
  const avgConversion = campaigns.length ? Math.round((campaigns.reduce((acc, c) => acc + (c.conversion_rate || 0), 0) / campaigns.length) * 10) / 10 : 0
  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0)

  // ── Campaign actions ──
  const cycleCampaignStatus = async (campaign: any) => {
    const status = nextStatus(CAMPAIGN_STATUSES, campaign.status)
    const snapshot = campaigns
    setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, status } : c))
    const { error } = await updateCampaign(campaign.id, { status })
    if (error) setCampaigns(snapshot)
  }

  const addCampaign = async () => {
    if (!campaignForm.name) return
    setSavingCampaign(true)
    const { data } = await insertCampaign({
      name: campaignForm.name,
      channel: campaignForm.channel,
      status: campaignForm.status,
      budget: campaignForm.budget ? Number(campaignForm.budget) : 0,
      leads_generated: campaignForm.leads_generated ? Number(campaignForm.leads_generated) : 0,
      conversion_rate: campaignForm.conversion_rate ? Number(campaignForm.conversion_rate) : 0,
      start_date: campaignForm.start_date || undefined,
      end_date: campaignForm.end_date || undefined,
    })
    if (data) setCampaigns([data, ...campaigns])
    setCampaignForm(emptyCampaignForm)
    setSavingCampaign(false)
    setCampaignModalOpen(false)
  }

  const removeCampaign = async (id: string) => {
    const snapshot = campaigns
    setCampaigns(campaigns.filter(c => c.id !== id))
    const { error } = await deleteCampaign(id)
    if (error) setCampaigns(snapshot)
  }

  // ── Content calendar actions ──
  const cycleTaskStatus = async (task: any) => {
    const status = nextStatus(TASK_STATUSES, task.status)
    const snapshot = tasks
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status } : t))
    const { error } = await updateMarketingTask(task.id, { status })
    if (error) setTasks(snapshot)
  }

  const addTask = async () => {
    if (!taskForm.title) return
    setSavingTask(true)
    const { data } = await insertMarketingTask({
      title: taskForm.title,
      platform: taskForm.platform || undefined,
      status: taskForm.status,
      owner: taskForm.owner || undefined,
      due_date: taskForm.due_date || undefined,
      campaign_id: taskForm.campaign_id || undefined,
    })
    if (data) setTasks([data, ...tasks])
    setTaskForm(emptyTaskForm)
    setSavingTask(false)
    setTaskModalOpen(false)
  }

  const removeTask = async (id: string) => {
    const snapshot = tasks
    setTasks(tasks.filter(t => t.id !== id))
    const { error } = await deleteMarketingTask(id)
    if (error) setTasks(snapshot)
  }

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-(--cp-text)">Campaigns</h1>
          <p className="text-(--cp-text-faint) text-[13px] mt-0.5">Plan, launch, and track marketing campaigns and content.</p>
        </div>
        <button
          onClick={() => tab === 'campaigns' ? setCampaignModalOpen(true) : setTaskModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-(--cp-cyan) text-white font-semibold text-[12px] rounded-xl hover:bg-(--cp-cyan-strong) transition-all"
          style={{ boxShadow: '0 0 12px color-mix(in srgb, var(--cp-cyan) 30%, transparent)' }}
        >
          <Plus className="w-3.5 h-3.5" /> {tab === 'campaigns' ? 'New Campaign' : 'New Content Item'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          { label: 'Active Campaigns', value: String(activeCampaigns), icon: Megaphone, color: 'text-(--cp-emerald)' },
          { label: 'Leads Generated', value: String(totalLeadsGenerated), icon: TrendingUp, color: 'text-(--cp-cyan)' },
          { label: 'Avg Conversion', value: `${avgConversion}%`, icon: Target, color: 'text-(--cp-violet)' },
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
              <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-(--cp-text-faint) mb-1">{kpi.label}</p>
              <p className={`text-[24px] font-display font-bold tracking-tight ${kpi.color}`}>{kpi.value}</p>
            </div>
            <kpi.icon className={`w-5 h-5 ${kpi.color} opacity-50`} />
          </motion.div>
        ))}
        {isFounder && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-5 rounded-2xl flex items-start justify-between"
            style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}
          >
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-(--cp-text-faint) mb-1">Total Budget</p>
              <RestrictedValue value={totalBudget} className="text-[24px] font-display font-bold tracking-tight text-(--cp-text)" />
            </div>
            <Target className="w-5 h-5 text-(--cp-text-muted) opacity-50" />
          </motion.div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
        {[
          { key: 'campaigns', label: 'Campaigns', icon: Radio },
          { key: 'calendar', label: 'Content Calendar', icon: ListChecks },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'campaigns' | 'calendar')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${tab === t.key ? 'bg-(--cp-cyan) text-white' : 'text-(--cp-text-muted) hover:text-(--cp-text-secondary)'}`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-(--cp-border) border-t-(--cp-text-muted) rounded-full animate-spin" />
        </div>
      ) : tab === 'campaigns' ? (
        campaigns.length === 0 ? (
          <div className="py-16 text-center text-(--cp-text-faint) text-[13px] rounded-2xl" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>No campaigns yet. Create your first campaign.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map(c => {
              const sStyle = campaignStatusStyle(c.status)
              return (
                <div key={c.id} className="p-5 rounded-2xl group relative" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
                  <button onClick={() => removeCampaign(c.id)} className="absolute top-4 right-4 w-6 h-6 rounded-lg flex items-center justify-center text-(--cp-text-faint) hover:text-(--cp-red) hover:bg-(--cp-red-soft) opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <h3 className="text-[14px] font-bold text-(--cp-text) pr-8">{c.name}</h3>
                  <p className="text-[11px] text-(--cp-text-faint) mt-0.5 mb-3">{c.channel || 'Other'}</p>
                  <button onClick={() => cycleCampaignStatus(c)} className="text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md mb-3 inline-block" style={{ color: sStyle.color, background: sStyle.bg, border: `1px solid ${sStyle.border}` }}>
                    {c.status}
                  </button>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2.5 rounded-lg" style={{ background: 'var(--cp-surface-strong)', border: '1px solid var(--cp-border-soft)' }}>
                      <p className="text-[9px] uppercase tracking-wider text-(--cp-text-faint) mb-0.5">Leads Gen.</p>
                      <p className="text-[14px] font-mono text-(--cp-text-secondary)">{c.leads_generated || 0}</p>
                    </div>
                    <div className="p-2.5 rounded-lg" style={{ background: 'var(--cp-surface-strong)', border: '1px solid var(--cp-border-soft)' }}>
                      <p className="text-[9px] uppercase tracking-wider text-(--cp-text-faint) mb-0.5">Conversion</p>
                      <p className="text-[14px] font-mono text-(--cp-text-secondary)">{c.conversion_rate || 0}%</p>
                    </div>
                  </div>
                  {isFounder && (
                    <div className="p-2.5 rounded-lg mb-3" style={{ background: 'var(--cp-surface-strong)', border: '1px solid var(--cp-border-soft)' }}>
                      <p className="text-[9px] uppercase tracking-wider text-(--cp-text-faint) mb-0.5">Budget</p>
                      <RestrictedValue value={c.budget} className="text-[14px] font-mono text-(--cp-text-secondary)" />
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[10px] text-(--cp-text-faint) font-mono pt-2 border-t border-(--cp-border-soft)">
                    <Calendar className="w-3 h-3" />
                    {c.start_date ? new Date(c.start_date).toLocaleDateString('en-IN') : '—'} → {c.end_date ? new Date(c.end_date).toLocaleDateString('en-IN') : '—'}
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        tasks.length === 0 ? (
          <div className="py-16 text-center text-(--cp-text-faint) text-[13px] rounded-2xl" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>No content items yet. Add one to your calendar.</div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-(--cp-text-faint) border-b border-(--cp-border-soft)">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                  <th className="px-4 py-3 font-medium">Campaign</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => {
                  const tStyle = taskStatusStyle(t.status)
                  return (
                    <tr key={t.id} className="border-b border-(--cp-border-soft) last:border-0 hover:bg-(--cp-surface-strong)">
                      <td className="px-4 py-3 text-(--cp-text) font-medium">{t.title}</td>
                      <td className="px-4 py-3 text-(--cp-text-muted)">{t.platform || '—'}</td>
                      <td className="px-4 py-3 text-(--cp-text-muted)">{t.campaigns?.name || '—'}</td>
                      <td className="px-4 py-3 text-(--cp-text-muted)">{t.owner || '—'}</td>
                      <td className="px-4 py-3 text-(--cp-text-muted) font-mono">{t.due_date ? new Date(t.due_date).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => cycleTaskStatus(t)} className="text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md" style={{ color: tStyle.color, background: tStyle.bg, border: `1px solid ${tStyle.border}` }}>
                          {t.status}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeTask(t.id)} className="text-(--cp-text-faint) hover:text-(--cp-red) transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* New Campaign Modal */}
      <Modal open={campaignModalOpen} onClose={() => setCampaignModalOpen(false)} title="New Campaign" subtitle="Add a marketing campaign to track.">
        <div className="flex flex-col gap-4">
          <ModalInput label="Campaign Name" value={campaignForm.name} onChange={(v) => setCampaignForm({ ...campaignForm, name: v })} placeholder="e.g. Summer Launch" required />
          <div className="grid grid-cols-2 gap-4">
            <ModalSelect label="Channel" value={campaignForm.channel} onChange={(v) => setCampaignForm({ ...campaignForm, channel: v })} options={CHANNELS.map(c => ({ value: c, label: c }))} />
            <ModalSelect label="Status" value={campaignForm.status} onChange={(v) => setCampaignForm({ ...campaignForm, status: v })} options={CAMPAIGN_STATUSES.map(s => ({ value: s, label: s }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Start Date" value={campaignForm.start_date} onChange={(v) => setCampaignForm({ ...campaignForm, start_date: v })} type="date" />
            <ModalInput label="End Date" value={campaignForm.end_date} onChange={(v) => setCampaignForm({ ...campaignForm, end_date: v })} type="date" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Leads Generated" value={campaignForm.leads_generated} onChange={(v) => setCampaignForm({ ...campaignForm, leads_generated: v })} placeholder="0" type="number" />
            <ModalInput label="Conversion Rate (%)" value={campaignForm.conversion_rate} onChange={(v) => setCampaignForm({ ...campaignForm, conversion_rate: v })} placeholder="0" type="number" />
          </div>
          {isFounder && (
            <ModalInput label="Budget (₹)" value={campaignForm.budget} onChange={(v) => setCampaignForm({ ...campaignForm, budget: v })} placeholder="50000" type="number" />
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-(--cp-border-soft)">
            <button onClick={() => setCampaignModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-(--cp-text-faint) hover:text-(--cp-text-secondary) transition-colors">Cancel</button>
            <button onClick={addCampaign} disabled={savingCampaign || !campaignForm.name} className="px-5 py-2 bg-(--cp-cyan) text-white font-semibold text-[12px] rounded-xl hover:bg-(--cp-cyan-strong) transition-all disabled:opacity-30">
              {savingCampaign ? 'Adding...' : 'Add Campaign'}
            </button>
          </div>
        </div>
      </Modal>

      {/* New Content Item Modal */}
      <Modal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="New Content Item" subtitle="Add an item to the content calendar.">
        <div className="flex flex-col gap-4">
          <ModalInput label="Title" value={taskForm.title} onChange={(v) => setTaskForm({ ...taskForm, title: v })} placeholder="e.g. Instagram reel — product demo" required />
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Platform" value={taskForm.platform} onChange={(v) => setTaskForm({ ...taskForm, platform: v })} placeholder="e.g. Instagram" />
            <ModalSelect label="Status" value={taskForm.status} onChange={(v) => setTaskForm({ ...taskForm, status: v })} options={TASK_STATUSES.map(s => ({ value: s, label: s }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Owner" value={taskForm.owner} onChange={(v) => setTaskForm({ ...taskForm, owner: v })} placeholder="e.g. Priya" />
            <ModalInput label="Due Date" value={taskForm.due_date} onChange={(v) => setTaskForm({ ...taskForm, due_date: v })} type="date" />
          </div>
          <ModalSelect label="Campaign" value={taskForm.campaign_id} onChange={(v) => setTaskForm({ ...taskForm, campaign_id: v })} options={[{ value: '', label: 'None' }, ...campaigns.map(c => ({ value: c.id, label: c.name }))]} />
          <div className="flex justify-end gap-3 pt-4 border-t border-(--cp-border-soft)">
            <button onClick={() => setTaskModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-(--cp-text-faint) hover:text-(--cp-text-secondary) transition-colors">Cancel</button>
            <button onClick={addTask} disabled={savingTask || !taskForm.title} className="px-5 py-2 bg-(--cp-cyan) text-white font-semibold text-[12px] rounded-xl hover:bg-(--cp-cyan-strong) transition-all disabled:opacity-30">
              {savingTask ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
