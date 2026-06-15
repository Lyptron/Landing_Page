'use client'
import { useEffect, useState } from 'react'
import {
  fetchProjects,
  fetchClients,
  insertProject,
  insertMilestone,
  updateProject,
  updateMilestone,
} from '@/lib/db'
import { Plus, FolderKanban, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'

const STAGES = ['Backlog', 'Design', 'Development', 'Review', 'Completed']

type Client = { id: string; company: string; email?: string }

function slugifyAccessCode(name: string) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<any[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  const [formProjectName, setFormProjectName] = useState('')
  const [formClientId, setFormClientId] = useState('')
  const [formStage, setFormStage] = useState('Backlog')
  const [formCode, setFormCode] = useState('')
  const [formMilestoneName, setFormMilestoneName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [proj, cli] = await Promise.all([fetchProjects(), fetchClients()])
      if (!proj.error && proj.data) setProjects(proj.data)
      if (!cli.error && cli.data) setClients(cli.data)
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (formProjectName && !formCode) setFormCode(slugifyAccessCode(formProjectName))
  }, [formProjectName]) // eslint-disable-line react-hooks/exhaustive-deps

  const clientLabel = (proj: any) => {
    if (proj.client_id) {
      const found = clients.find((c) => c.id === proj.client_id)
      if (found) return found.company
    }
    return proj.client_email || 'Unassigned'
  }

  const toggleMilestone = async (projectId: string, milestoneId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'upcoming' : 'completed'
    setProjects(
      projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              milestones: p.milestones.map((m: any) =>
                m.id === milestoneId ? { ...m, status: newStatus } : m
              ),
            }
          : p
      )
    )
    await updateMilestone(milestoneId, { status: newStatus })
  }

  const addMilestoneHandler = async () => {
    if (!formMilestoneName || !activeProjectId) return
    setSaving(true)
    const { data } = await insertMilestone({
      name: formMilestoneName,
      status: 'upcoming',
      project_id: activeProjectId,
    })
    const newM = data || {
      id: Math.random().toString(),
      name: formMilestoneName,
      status: 'upcoming',
      project_id: activeProjectId,
    }
    setProjects(
      projects.map((p) =>
        p.id === activeProjectId ? { ...p, milestones: [...(p.milestones || []), newM] } : p
      )
    )
    setFormMilestoneName('')
    setSaving(false)
    setMilestoneModalOpen(false)
  }

  const updateProgressHandler = async (projectId: string, progress: number) => {
    setProjects(projects.map((p) => (p.id === projectId ? { ...p, progress } : p)))
    await updateProject(projectId, { progress })
  }

  const updateStatusHandler = async (projectId: string, status: string) => {
    setProjects(projects.map((p) => (p.id === projectId ? { ...p, status } : p)))
    await updateProject(projectId, { status })
  }

  const addProjectHandler = async () => {
    if (!formProjectName || !formClientId) return
    setSaving(true)
    const client = clients.find((c) => c.id === formClientId) || null
    const { data } = await insertProject({
      name: formProjectName,
      client_id: formClientId,
      client_email: client?.email,
      status: 'starting',
      progress: 0,
      access_code: formCode || slugifyAccessCode(formProjectName),
      stage: formStage,
      description: 'New project setup...',
    })
    const newProj = data
      ? { ...data, milestones: [], payments: [] }
      : {
          id: Math.random().toString(),
          name: formProjectName,
          client_id: formClientId,
          client_email: client?.email,
          status: 'starting',
          progress: 0,
          milestones: [],
          payments: [],
        }
    setProjects([newProj, ...projects])
    setFormProjectName('')
    setFormClientId('')
    setFormCode('')
    setFormStage('Backlog')
    setSaving(false)
    setProjectModalOpen(false)
  }

  const kpis = [
    {
      label: 'Active',
      value: projects.filter((p) => p.status === 'in-progress').length,
      color: 'var(--cp-emerald)',
    },
    { label: 'Total', value: projects.length, color: 'var(--cp-text)' },
    {
      label: 'Avg Progress',
      value:
        projects.length > 0
          ? `${Math.round(projects.reduce((a, p) => a + (p.progress || 0), 0) / projects.length)}%`
          : '0%',
      color: 'var(--cp-cyan)',
    },
    {
      label: 'Clients',
      value: clients.length,
      color: 'var(--cp-violet)',
    },
  ]

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-[26px] font-semibold tracking-tight" style={{ color: 'var(--cp-text)' }}>
            Overview
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--cp-text-muted)' }}>
            Your agency at a glance — projects, milestones, and client activity.
          </p>
        </div>
        <button
          onClick={() => setProjectModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 font-medium text-[12.5px] rounded-xl transition-colors"
          style={{
            background: 'var(--cp-cyan-soft)',
            color: 'var(--cp-cyan)',
            border: '1px solid var(--cp-cyan-border)',
          }}
        >
          <Plus className="w-3.5 h-3.5" /> New Project
        </button>
      </div>

      {/* KPI Strip — divider-style */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 mb-7 rounded-xl overflow-hidden"
        style={{
          background: 'var(--cp-surface)',
          border: '1px solid var(--cp-border)',
        }}
      >
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="px-5 py-4 flex flex-col gap-1"
            style={{
              borderRight: i < kpis.length - 1 ? '1px solid var(--cp-border)' : undefined,
            }}
          >
            <span
              className="text-[10px] uppercase font-semibold tracking-[0.12em]"
              style={{ color: 'var(--cp-text-faint)' }}
            >
              {kpi.label}
            </span>
            <span
              className="text-[24px] font-display font-semibold tracking-tight"
              style={{ color: kpi.color }}
            >
              {kpi.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Active Projects */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-[11px] uppercase font-semibold tracking-[0.12em] flex items-center gap-2"
          style={{ color: 'var(--cp-text-muted)' }}
        >
          <FolderKanban className="w-3.5 h-3.5" /> Active Projects
        </h3>
        <Link
          href="/admin/projects"
          className="text-[11px] flex items-center gap-1"
          style={{ color: 'var(--cp-cyan)' }}
        >
          View board <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 border-2 border-[var(--cp-border)] border-t-[var(--cp-text-muted)] rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div
          className="p-10 rounded-2xl flex flex-col items-center text-center"
          style={{ border: '1px dashed var(--cp-border)' }}
        >
          <FolderKanban className="w-10 h-10 mb-3" style={{ color: 'var(--cp-text-faint)' }} />
          <h3 className="font-semibold mb-1" style={{ color: 'var(--cp-text-secondary)' }}>No projects yet</h3>
          <p className="text-[13px] mb-4" style={{ color: 'var(--cp-text-muted)' }}>
            Create your first project to start tracking milestones and progress.
          </p>
          <button
            onClick={() => setProjectModalOpen(true)}
            className="px-5 py-2 font-medium text-[12px] rounded-xl"
            style={{
              background: 'var(--cp-cyan-soft)',
              color: 'var(--cp-cyan)',
              border: '1px solid var(--cp-cyan-border)',
            }}
          >
            Create Project
          </button>
        </div>
      ) : (
        // Unified list box per Eased Obsidian guidelines
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'var(--cp-surface)',
            border: '1px solid var(--cp-border)',
          }}
        >
          {projects.map((proj, i) => (
            <div
              key={proj.id}
              className="p-5"
              style={{
                borderTop: i > 0 ? '1px solid var(--cp-border-soft)' : undefined,
              }}
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-1 h-1 mt-2 rounded-full shrink-0"
                    style={{
                      background:
                        proj.status === 'in-progress'
                          ? 'var(--cp-emerald)'
                          : proj.status === 'completed'
                          ? 'var(--cp-cyan)'
                          : 'var(--cp-text-faint)',
                    }}
                  />
                  <div className="min-w-0">
                    <Link href={`/admin/projects/${proj.id}`} className="hover:underline">
                      <h4 className="text-[15px] font-semibold truncate" style={{ color: 'var(--cp-text)' }}>
                        {proj.name}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px]" style={{ color: 'var(--cp-text-muted)' }}>
                        {clientLabel(proj)}
                      </span>
                      {proj.access_code && (
                        <span
                          className="text-[9.5px] font-mono px-1.5 py-0.5 rounded"
                          style={{
                            color: 'var(--cp-text-faint)',
                            background: 'var(--cp-bg-soft)',
                          }}
                        >
                          {proj.access_code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <select
                    value={proj.status}
                    onChange={(e) => updateStatusHandler(proj.id, e.target.value)}
                    className="px-3 py-1 rounded-lg text-[10px] uppercase tracking-[0.1em] font-semibold outline-none cursor-pointer [&>option]:bg-[var(--cp-bg-elevated)] [&>option]:text-[var(--cp-text)]"
                    style={{
                      background:
                        proj.status === 'in-progress'
                          ? 'var(--cp-emerald-soft)'
                          : proj.status === 'completed'
                          ? 'var(--cp-cyan-soft)'
                          : 'var(--cp-bg-soft)',
                      color:
                        proj.status === 'in-progress'
                          ? 'var(--cp-emerald)'
                          : proj.status === 'completed'
                          ? 'var(--cp-cyan)'
                          : 'var(--cp-text-muted)',
                      border:
                        proj.status === 'in-progress'
                          ? '1px solid var(--cp-emerald-border)'
                          : proj.status === 'completed'
                          ? '1px solid var(--cp-cyan-border)'
                          : '1px solid var(--cp-border)',
                    }}
                  >
                    <option value="starting">Starting</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <span
                    className="text-[11px] font-mono"
                    style={{ color: 'var(--cp-text-muted)' }}
                  >
                    {proj.progress ?? 0}%
                  </span>
                </div>
              </div>

              {/* Progress slider */}
              <div
                className="w-full h-[3px] rounded-full overflow-hidden relative cursor-ew-resize mb-4"
                style={{ background: 'var(--cp-surface-strong)' }}
              >
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={proj.progress ?? 0}
                  onChange={(e) => updateProgressHandler(proj.id, Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                />
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${proj.progress ?? 0}%`,
                    background:
                      'linear-gradient(90deg, var(--cp-cyan), var(--cp-emerald))',
                  }}
                />
              </div>

              {/* Milestones */}
              <div
                className="rounded-xl p-3"
                style={{
                  background: 'var(--cp-surface)',
                  border: '1px solid var(--cp-border-soft)',
                }}
              >
                <div className="flex justify-between items-center mb-2.5">
                  <span
                    className="text-[10px] uppercase font-semibold tracking-[0.12em]"
                    style={{ color: 'var(--cp-text-faint)' }}
                  >
                    Milestones
                  </span>
                  <button
                    onClick={() => {
                      setActiveProjectId(proj.id)
                      setMilestoneModalOpen(true)
                    }}
                    className="text-[10.5px] transition-colors"
                    style={{ color: 'var(--cp-cyan)' }}
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {proj.milestones?.length > 0 ? (
                    proj.milestones.map((m: any) => (
                      <button
                        key={m.id}
                        onClick={() => toggleMilestone(proj.id, m.id, m.status)}
                        className="flex items-center gap-2 p-2 rounded-lg transition-colors text-left hover:bg-[var(--cp-bg-soft)]"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            background:
                              m.status === 'completed'
                                ? 'var(--cp-emerald)'
                                : 'var(--cp-border-strong)',
                          }}
                        />
                        <span
                          className="text-[12px]"
                          style={{
                            color:
                              m.status === 'completed'
                                ? 'var(--cp-emerald)'
                                : 'var(--cp-text-secondary)',
                          }}
                        >
                          {m.name || m.title || 'Milestone'}
                        </span>
                      </button>
                    ))
                  ) : (
                    <span className="text-[11px]" style={{ color: 'var(--cp-text-faint)' }}>
                      No milestones yet
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        title="New Project"
        subtitle="Create a project and link it to an existing client."
      >
        <div className="flex flex-col gap-4">
          <ModalInput
            label="Project Name"
            value={formProjectName}
            onChange={setFormProjectName}
            placeholder="e.g. Nirman"
            required
          />
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>
              Client <span style={{ color: 'var(--cp-red)' }}>*</span>
            </label>
            {clients.length === 0 ? (
              <div
                className="px-4 py-3 rounded-xl text-[12.5px]"
                style={{
                  background: 'var(--cp-bg-soft)',
                  border: '1px solid var(--cp-border)',
                  color: 'var(--cp-text-muted)',
                }}
              >
                No clients yet —{' '}
                <Link href="/admin/clients" className="underline" style={{ color: 'var(--cp-cyan)' }}>
                  add a client first
                </Link>
                .
              </div>
            ) : (
              <select
                value={formClientId}
                onChange={(e) => setFormClientId(e.target.value)}
                className="px-4 py-3 rounded-xl text-[13px] outline-none appearance-none cursor-pointer [&>option]:bg-[var(--cp-bg-elevated)] [&>option]:text-[var(--cp-text)]"
                style={{
                  background: 'var(--cp-bg-soft)',
                  border: '1px solid var(--cp-border)',
                  color: 'var(--cp-text)',
                }}
              >
                <option value="">— Select a client —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company}
                    {c.email ? ` · ${c.email}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
          <ModalInput
            label="Access Code"
            value={formCode}
            onChange={(v) => setFormCode(slugifyAccessCode(v))}
            placeholder="NIRMAN"
          />
          <ModalSelect
            label="Initial Stage"
            value={formStage}
            onChange={setFormStage}
            options={STAGES.map((s) => ({ value: s, label: s }))}
          />

          <div
            className="flex justify-end gap-3 pt-4"
            style={{ borderTop: '1px solid var(--cp-border-soft)' }}
          >
            <button
              onClick={() => setProjectModalOpen(false)}
              className="px-4 py-2 rounded-xl text-[12px] font-medium transition-colors text-[var(--cp-text-muted)] hover:text-[var(--cp-text)]"
            >
              Cancel
            </button>
            <button
              onClick={addProjectHandler}
              disabled={saving || !formProjectName || !formClientId}
              className="px-5 py-2 font-medium text-[12px] rounded-xl transition-colors disabled:opacity-30"
              style={{
                background: 'var(--cp-cyan-soft)',
                color: 'var(--cp-cyan)',
                border: '1px solid var(--cp-cyan-border)',
              }}
            >
              {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={milestoneModalOpen}
        onClose={() => setMilestoneModalOpen(false)}
        title="Add Milestone"
        subtitle="Add a milestone to this project."
      >
        <div className="flex flex-col gap-4">
          <ModalInput
            label="Milestone Name"
            value={formMilestoneName}
            onChange={setFormMilestoneName}
            placeholder="e.g. UI/UX Design Complete"
            required
          />
          <div
            className="flex justify-end gap-3 pt-4"
            style={{ borderTop: '1px solid var(--cp-border-soft)' }}
          >
            <button
              onClick={() => setMilestoneModalOpen(false)}
              className="px-4 py-2 rounded-xl text-[12px] font-medium transition-colors text-[var(--cp-text-muted)] hover:text-[var(--cp-text)]"
            >
              Cancel
            </button>
            <button
              onClick={addMilestoneHandler}
              disabled={saving || !formMilestoneName}
              className="px-5 py-2 font-medium text-[12px] rounded-xl transition-colors disabled:opacity-30"
              style={{
                background: 'var(--cp-cyan-soft)',
                color: 'var(--cp-cyan)',
                border: '1px solid var(--cp-cyan-border)',
              }}
            >
              {saving ? 'Adding…' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
