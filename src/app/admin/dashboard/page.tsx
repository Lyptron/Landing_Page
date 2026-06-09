'use client'
import { useEffect, useState } from 'react'
import { fetchProjects, insertProject, insertMilestone, insertPayment, updateProject, updateMilestone, updatePayment } from '@/lib/db'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ArrowUpRight, Activity, Plus, FolderKanban, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Modal, { ModalInput } from '@/components/ui/Modal'

const REVENUE_DATA = [
  { name: 'Jan', revenue: 125000 },
  { name: 'Feb', revenue: 180000 },
  { name: 'Mar', revenue: 150000 },
  { name: 'Apr', revenue: 265000 },
  { name: 'May', revenue: 375000 },
  { name: 'Jun', revenue: 430000 },
]

export default function AdminDashboard() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [formProjectName, setFormProjectName] = useState('')
  const [formProjectEmail, setFormProjectEmail] = useState('')
  const [formMilestoneName, setFormMilestoneName] = useState('')
  const [formPaymentAmount, setFormPaymentAmount] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadData() {
      const { data: proj, error } = await fetchProjects()
      if (!error && proj) setProjects(proj)
      setLoading(false)
    }
    loadData()
  }, [])

  const toggleMilestone = async (projectId: string, milestoneId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'upcoming' : 'completed'
    setProjects(projects.map(p => p.id === projectId ? { ...p, milestones: p.milestones.map((m: any) => m.id === milestoneId ? { ...m, status: newStatus } : m) } : p))
    await updateMilestone(milestoneId, { status: newStatus })
  }

  const togglePayment = async (projectId: string, paymentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid'
    setProjects(projects.map(p => p.id === projectId ? { ...p, payments: p.payments.map((py: any) => py.id === paymentId ? { ...py, status: newStatus } : py) } : p))
    await updatePayment(paymentId, { status: newStatus })
  }

  const addMilestoneHandler = async () => {
    if (!formMilestoneName || !activeProjectId) return
    setSaving(true)
    const { data } = await insertMilestone({ name: formMilestoneName, status: 'upcoming', project_id: activeProjectId })
    const newM = data || { id: Math.random().toString(), name: formMilestoneName, status: 'upcoming', project_id: activeProjectId }
    setProjects(projects.map(p => p.id === activeProjectId ? { ...p, milestones: [...(p.milestones || []), newM] } : p))
    setFormMilestoneName(''); setSaving(false); setMilestoneModalOpen(false)
  }

  const addPaymentHandler = async () => {
    if (!formPaymentAmount || !activeProjectId) return
    setSaving(true)
    const { data } = await insertPayment({ amount: Number(formPaymentAmount), status: 'pending', project_id: activeProjectId })
    const newP = data || { id: Math.random().toString(), amount: Number(formPaymentAmount), status: 'pending', project_id: activeProjectId }
    setProjects(projects.map(p => p.id === activeProjectId ? { ...p, payments: [...(p.payments || []), newP] } : p))
    setFormPaymentAmount(''); setSaving(false); setPaymentModalOpen(false)
  }

  const updateProgressHandler = async (projectId: string, progress: number) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, progress } : p))
    await updateProject(projectId, { progress })
  }

  const updateStatusHandler = async (projectId: string, status: string) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, status } : p))
    await updateProject(projectId, { status })
  }

  const addProjectHandler = async () => {
    if (!formProjectName || !formProjectEmail) return
    setSaving(true)
    const { data } = await insertProject({ name: formProjectName, client_email: formProjectEmail, status: 'starting', progress: 0, description: 'New project setup...' })
    const newProj = data ? { ...data, milestones: [], payments: [] } : { id: Math.random().toString(), name: formProjectName, client_email: formProjectEmail, status: 'starting', progress: 0, milestones: [], payments: [] }
    setProjects([newProj, ...projects])
    setFormProjectName(''); setFormProjectEmail(''); setSaving(false); setProjectModalOpen(false)
  }

  const finances = projects.reduce((acc, proj) => {
    if (!proj.payments) return acc
    proj.payments.forEach((p: any) => { acc.total += p.amount; if (p.status === 'paid') acc.received += p.amount; else acc.outstanding += p.amount })
    return acc
  }, { total: 0, received: 0, outstanding: 0 })

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white/90">Overview</h1>
          <p className="text-white/25 text-[13px] mt-0.5">Your agency at a glance.</p>
        </div>
        <button
          onClick={() => setProjectModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#050505] font-semibold text-[12px] rounded-xl hover:bg-white/90 transition-all"
          style={{ boxShadow: '0 0 12px rgba(255,255,255,0.06)' }}
        >
          <Plus className="w-3.5 h-3.5" /> New Project
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Pipeline', value: `₹${finances.total.toLocaleString('en-IN')}`, color: 'text-white/85' },
          { label: 'Received', value: `₹${finances.received.toLocaleString('en-IN')}`, color: 'text-emerald-400' },
          { label: 'Outstanding', value: `₹${finances.outstanding.toLocaleString('en-IN')}`, color: 'text-orange-400' },
          { label: 'Projects', value: String(projects.length), color: 'text-white/85' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20 mb-1">{kpi.label}</p>
            <p className={`text-[22px] font-display font-bold tracking-tight ${kpi.color}`}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart + Projects */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-1 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <h3 className="text-[13px] font-bold text-white/70 mb-4">Revenue</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(255,255,255,0.06)" stopOpacity={1} />
                    <stop offset="95%" stopColor="rgba(255,255,255,0)" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.1)" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.1)" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} width={35} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(10,10,12,0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 12px' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontFamily: 'monospace' }}
                  itemStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRevenue)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Projects */}
        <div className="xl:col-span-2 flex flex-col gap-3">
          <h3 className="text-[13px] font-bold text-white/70 flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-white/30" /> Active Projects
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="p-10 border border-dashed border-white/[0.05] rounded-2xl flex flex-col items-center text-center">
              <FolderKanban className="w-10 h-10 text-white/[0.05] mb-3" />
              <h3 className="text-white/50 font-bold mb-1">No projects yet</h3>
              <p className="text-white/20 text-[13px] mb-4">Create your first project to start tracking.</p>
              <button onClick={() => setProjectModalOpen(true)} className="px-5 py-2 bg-white text-black font-semibold text-[12px] rounded-xl hover:bg-white/90 transition-colors">Create Project</button>
            </div>
          ) : (
            projects.map((proj) => (
              <div key={proj.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                {/* Project Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                  <div>
                    <Link href={`/admin/projects/${proj.id}`} className="hover:underline">
                      <h4 className="text-[15px] font-bold text-white/85">{proj.name}</h4>
                    </Link>
                    <p className="text-[11px] text-white/20 font-mono">{proj.client_email}</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <select
                      value={proj.status}
                      onChange={(e) => updateStatusHandler(proj.id, e.target.value)}
                      className={`px-3 py-1 rounded-lg text-[9px] uppercase tracking-[0.1em] font-bold border outline-none cursor-pointer transition-colors [&>option]:bg-[#111] [&>option]:text-white/80
                        ${proj.status === 'in-progress' ? 'bg-emerald-500/[0.06] border-emerald-500/15 text-emerald-400' :
                          proj.status === 'completed' ? 'bg-blue-500/[0.06] border-blue-500/15 text-blue-400' :
                          'bg-white/[0.03] border-white/[0.04] text-white/40'}`}
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="starting">Starting</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/25">
                      <span>{proj.progress}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress slider */}
                <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden relative cursor-ew-resize mb-3">
                  <input
                    type="range" min="0" max="100"
                    value={proj.progress}
                    onChange={(e) => updateProgressHandler(proj.id, Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                  />
                  <div className="h-full rounded-full" style={{ width: `${proj.progress}%`, background: 'linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.6))' }} />
                </div>

                {/* Milestones + Payments side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Milestones */}
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20">Milestones</span>
                      <button onClick={() => { setActiveProjectId(proj.id); setMilestoneModalOpen(true) }} className="text-[9px] text-blue-400/60 hover:text-blue-400 transition-colors">+ Add</button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {proj.milestones?.length > 0 ? proj.milestones.map((m: any) => (
                        <button key={m.id} onClick={() => toggleMilestone(proj.id, m.id, m.status)} className={`flex items-center gap-2 p-2 rounded-lg transition-all text-left ${m.status === 'completed' ? 'bg-emerald-500/[0.03]' : 'hover:bg-white/[0.02]'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.status === 'completed' ? 'bg-emerald-400' : 'bg-white/15'}`} />
                          <span className={`text-[12px] ${m.status === 'completed' ? 'text-emerald-400/70' : 'text-white/40'}`}>{m.name || m.title || 'Milestone'}</span>
                        </button>
                      )) : <span className="text-[10px] text-white/15">No milestones</span>}
                    </div>
                  </div>

                  {/* Payments */}
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20">Payments</span>
                      <button onClick={() => { setActiveProjectId(proj.id); setPaymentModalOpen(true) }} className="text-[9px] text-orange-400/60 hover:text-orange-400 transition-colors">+ Add</button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {proj.payments?.length > 0 ? proj.payments.map((p: any) => (
                        <button key={p.id} onClick={() => togglePayment(proj.id, p.id, p.status)} className={`flex items-center justify-between p-2 rounded-lg transition-all ${p.status === 'paid' ? 'bg-emerald-500/[0.03]' : 'bg-orange-500/[0.02]'}`}>
                          <span className={`text-[13px] font-mono ${p.status === 'paid' ? 'text-emerald-400/70' : 'text-orange-400/70'}`}>₹{p.amount?.toLocaleString('en-IN')}</span>
                          <span className={`text-[8px] uppercase tracking-[0.1em] font-bold px-1.5 py-0.5 rounded ${p.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>{p.status}</span>
                        </button>
                      )) : <span className="text-[10px] text-white/15">No payments</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal open={projectModalOpen} onClose={() => setProjectModalOpen(false)} title="New Project" subtitle="Create a new project to start tracking.">
        <div className="flex flex-col gap-4">
          <ModalInput label="Project Name" value={formProjectName} onChange={setFormProjectName} placeholder="e.g. Aura SaaS Dashboard" required />
          <ModalInput label="Client Email" value={formProjectEmail} onChange={setFormProjectEmail} placeholder="client@company.com" type="email" required />
          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.04]">
            <button onClick={() => setProjectModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-white/30 hover:text-white/60 transition-colors">Cancel</button>
            <button onClick={addProjectHandler} disabled={saving || !formProjectName || !formProjectEmail} className="px-5 py-2 bg-white text-[#050505] font-semibold text-[12px] rounded-xl hover:bg-white/90 transition-all disabled:opacity-30">
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
      <Modal open={milestoneModalOpen} onClose={() => setMilestoneModalOpen(false)} title="Add Milestone" subtitle="Add a milestone to this project.">
        <div className="flex flex-col gap-4">
          <ModalInput label="Milestone Name" value={formMilestoneName} onChange={setFormMilestoneName} placeholder="e.g. UI/UX Design Complete" required />
          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.04]">
            <button onClick={() => setMilestoneModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-white/30 hover:text-white/60 transition-colors">Cancel</button>
            <button onClick={addMilestoneHandler} disabled={saving || !formMilestoneName} className="px-5 py-2 bg-white text-[#050505] font-semibold text-[12px] rounded-xl hover:bg-white/90 transition-all disabled:opacity-30">
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>
      <Modal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Add Payment" subtitle="Record a payment for this project.">
        <div className="flex flex-col gap-4">
          <ModalInput label="Amount (₹)" value={formPaymentAmount} onChange={setFormPaymentAmount} placeholder="40000" type="number" required />
          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.04]">
            <button onClick={() => setPaymentModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-white/30 hover:text-white/60 transition-colors">Cancel</button>
            <button onClick={addPaymentHandler} disabled={saving || !formPaymentAmount} className="px-5 py-2 bg-white text-[#050505] font-semibold text-[12px] rounded-xl hover:bg-white/90 transition-all disabled:opacity-30">
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
