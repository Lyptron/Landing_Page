'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Calendar, CheckCircle2, AlertCircle, Clock, Search } from 'lucide-react'
import Link from 'next/link'
import { fetchProjectsKanban, fetchClients, insertProject, updateProject, insertClient } from '@/lib/db'
import { newAccessCode, normalizeAccessCode } from '@/lib/accessCode'
import { optimistic } from '@/lib/optimistic'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'

const STAGES = ['Backlog', 'Design', 'Development', 'Review', 'Completed']

type Client = { id: string; company: string; email?: string }
type Project = {
  id: string
  name: string
  stage: string
  status: string
  health?: string
  progress?: number
  due_date?: string | null
  access_code?: string | null
  client_id?: string | null
  client_email?: string | null
  client_name?: string | null
  clients?: Client | null
  team?: string[]
}


export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [draggedProject, setDraggedProject] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')

  const [formName, setFormName] = useState('')
  const [formClientName, setFormClientName] = useState('')
  const [formClientEmail, setFormClientEmail] = useState('')
  const [formClientId, setFormClientId] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formStage, setFormStage] = useState('Backlog')
  const [formCode, setFormCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [createNewClient, setCreateNewClient] = useState(false)
  const [formContactPerson, setFormContactPerson] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const [proj, cli] = await Promise.all([fetchProjectsKanban(), fetchClients()])
      if (!proj.error && proj.data) {
        setProjects(
          proj.data.map((p: any) => ({
            ...p,
            team: p.project_team?.map((pt: any) => {
              const tm = Array.isArray(pt.team_members) ? pt.team_members[0] : pt.team_members
              return tm?.initials || '??'
            }) || [],
          }))
        )
      }
      if (!cli.error && cli.data) setClients(cli.data)
      setLoading(false)
    }
    load()
  }, [])

  // Auto-fill a crypto-secure access code once the admin has named
  // the project. Deriving the code from the name (previous behavior)
  // made codes trivially guessable — see src/lib/accessCode.ts.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (formName && !formCode) setFormCode(newAccessCode())
  }, [formName]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectClient = (clientId: string) => {
    setFormClientId(clientId)
    const client = clients.find((c) => c.id === clientId)
    if (client) {
      setFormClientName(client.company)
      setFormClientEmail(client.email || '')
    }
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedProject(id)
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  const handleDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault()
    if (!draggedProject) return
    const id = draggedProject
    setDraggedProject(null)
    await optimistic(
      setProjects,
      (prev) => prev.map((p) => (p.id === id ? { ...p, stage } : p)),
      () => updateProject(id, { stage })
    )
  }

  const handleAddProject = async () => {
    if (!formName || (!formClientId && !createNewClient) || (createNewClient && !formClientName)) {
      setError('Project Name and Client details are required.')
      return
    }
    setSaving(true)
    setError('')

    let linkedClientId = formClientId || null
    let clientEmail = null
    let clientName = null

    if (createNewClient && !linkedClientId) {
      const { data: newClient, error: clientError } = await insertClient({
        company: formClientName,
        contact: formContactPerson || 'Primary Contact',
        email: formClientEmail,
      })
      if (clientError) {
        setError('Failed to create client: ' + (clientError as any).message)
        setSaving(false)
        return
      }
      if (newClient) {
        linkedClientId = newClient.id
        clientEmail = newClient.email
        clientName = newClient.company
        setClients((prev) => [newClient, ...prev])
      }
    } else if (linkedClientId) {
      const client = clients.find((c) => c.id === linkedClientId)
      clientEmail = client?.email
      clientName = client?.company
    }

    const { data, error: projectError } = await insertProject({
      name: formName,
      client_name: clientName || formClientName,
      client_email: clientEmail || formClientEmail || undefined,
      client_id: linkedClientId,
      status: 'starting',
      progress: 0,
      description: formDesc || undefined,
      access_code: formCode || newAccessCode(),
      stage: formStage,
    })

    if (projectError) {
      setError('Failed to create project: ' + (projectError as any).message)
      setSaving(false)
      return
    }

    if (data) {
      const finalClientObj = linkedClientId
        ? (clients.find((c) => c.id === linkedClientId) || (createNewClient ? { id: linkedClientId, company: formClientName, email: formClientEmail } : null))
        : null
      setProjects([
        {
          ...(data as any),
          team: [],
          clients: finalClientObj,
        },
        ...projects,
      ])
    }
    setFormName('')
    setFormClientName('')
    setFormClientEmail('')
    setFormClientId('')
    setFormDesc('')
    setFormCode('')
    setFormStage('Backlog')
    setCreateNewClient(false)
    setFormContactPerson('')
    setError('')
    setSaving(false)
    setModalOpen(false)
  }

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects
    const q = search.toLowerCase()
    return projects.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.clients?.company?.toLowerCase().includes(q) ||
        p.client_name?.toLowerCase().includes(q) ||
        p.access_code?.toLowerCase().includes(q)
    )
  }, [projects, search])

  const healthMeta = (h: string | undefined) => {
    if (h === 'on-track')
      return { color: 'var(--cp-emerald)', soft: 'var(--cp-emerald-soft)', border: 'var(--cp-emerald-border)' }
    if (h === 'at-risk')
      return { color: 'var(--cp-amber)', soft: 'var(--cp-amber-soft)', border: 'var(--cp-amber-border)' }
    if (h === 'delayed')
      return { color: 'var(--cp-red)', soft: 'var(--cp-red-soft)', border: 'var(--cp-red-border)' }
    return { color: 'var(--cp-text-faint)', soft: 'var(--cp-bg-soft)', border: 'var(--cp-border)' }
  }

  const HealthIcon = ({ health }: { health: string }) => {
    if (health === 'on-track') return <CheckCircle2 className="w-3 h-3" />
    if (health === 'at-risk') return <AlertCircle className="w-3 h-3" />
    if (health === 'delayed') return <Clock className="w-3 h-3" />
    return <CheckCircle2 className="w-3 h-3" />
  }

  const totalActive = projects.filter((p) => p.status === 'in-progress').length
  const totalBacklog = projects.filter((p) => p.stage === 'Backlog').length
  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
      : 0

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--cp-text)' }}>
            Projects
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--cp-text-muted)' }}>
            Drag cards across stages. Each project is linked to a client and exposes a portal access code.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex p-0.5 rounded-xl bg-(--cp-bg-soft) border" style={{ borderColor: 'var(--cp-border)' }}>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-(--cp-surface) text-(--cp-text) shadow-sm'
                  : 'text-(--cp-text-muted) hover:text-(--cp-text)'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-(--cp-surface) text-(--cp-text) shadow-sm'
                  : 'text-(--cp-text-muted) hover:text-(--cp-text)'
              }`}
            >
              Table
            </button>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 font-medium text-[12.5px] rounded-xl transition-colors cursor-pointer"
            style={{
              background: 'var(--cp-cyan-soft)',
              color: 'var(--cp-cyan)',
              border: '1px solid var(--cp-cyan-border)',
            }}
          >
            <Plus className="w-3.5 h-3.5" /> New Project
          </button>
        </div>
      </div>

      {/* Metric strip */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 mb-5 rounded-xl overflow-hidden"
        style={{
          background: 'var(--cp-surface)',
          border: '1px solid var(--cp-border)',
        }}
      >
        {[
          { label: 'Total', value: projects.length },
          { label: 'Active', value: totalActive, color: 'var(--cp-emerald)' },
          { label: 'Backlog', value: totalBacklog, color: 'var(--cp-amber)' },
          { label: 'Avg Progress', value: `${avgProgress}%`, color: 'var(--cp-cyan)' },
        ].map((m, i) => (
          <div
            key={m.label}
            className="px-4 py-3 flex flex-col gap-0.5"
            style={{
              borderRight: i < 3 ? '1px solid var(--cp-border)' : undefined,
            }}
          >
            <span
              className="text-[10px] uppercase font-semibold tracking-[0.12em]"
              style={{ color: 'var(--cp-text-faint)' }}
            >
              {m.label}
            </span>
            <span
              className="font-display font-semibold text-[20px] tracking-tight"
              style={{ color: m.color || 'var(--cp-text)' }}
            >
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 mb-4 rounded-xl"
        style={{
          background: 'var(--cp-surface)',
          border: '1px solid var(--cp-border)',
        }}
      >
        <Search className="w-3.5 h-3.5" style={{ color: 'var(--cp-text-faint)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects, clients, or access codes…"
          className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-(--cp-text-faint)"
          style={{ color: 'var(--cp-text)' }}
        />
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-(--cp-border) border-t-(--cp-text-muted) rounded-full animate-spin" />
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 flex gap-4">
          {STAGES.map((stage) => {
            const stageProjects = filteredProjects.filter((p) => p.stage === stage)
            return (
              <div
                key={stage}
                className="flex flex-col w-75 shrink-0 rounded-xl max-h-full overflow-hidden"
                style={{
                  background: 'var(--cp-bg-soft)',
                  border: '1px solid var(--cp-border)',
                }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
              >
                {/* Column Header */}
                <div
                  className="flex justify-between items-center px-4 py-3"
                  style={{ borderBottom: '1px solid var(--cp-border-soft)' }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] uppercase font-semibold tracking-[0.12em]"
                      style={{ color: 'var(--cp-text-secondary)' }}
                    >
                      {stage}
                    </span>
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded-md"
                      style={{
                        color: 'var(--cp-text-muted)',
                        background: 'var(--cp-surface)',
                      }}
                    >
                      {stageProjects.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2 custom-scrollbar">
                  {stageProjects.map((project) => {
                    const hMeta = healthMeta(project.health)
                    return (
                      <motion.div
                        layoutId={project.id}
                        key={project.id}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e as unknown as React.DragEvent, project.id)
                        }
                        className="p-3.5 rounded-xl cursor-grab active:cursor-grabbing transition-colors"
                        style={{
                          background: 'var(--cp-surface)',
                          border: '1px solid var(--cp-border)',
                        }}
                        whileHover={{ borderColor: 'var(--cp-cyan-border)' }}
                      >
                        {/* Health badge + access code */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-widest"
                            style={{
                              color: hMeta.color,
                              background: hMeta.soft,
                              border: `1px solid ${hMeta.border}`,
                            }}
                          >
                            <HealthIcon health={project.health || 'on-track'} />
                            {(project.health || 'on-track').replace('-', ' ')}
                          </span>
                          {project.access_code && (
                            <span
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                              style={{
                                color: 'var(--cp-text-faint)',
                                background: 'var(--cp-bg-soft)',
                              }}
                            >
                              {project.access_code}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <Link
                          href={`/admin/projects/${project.id}`}
                          className="block hover:underline"
                          style={{ textDecorationColor: 'var(--cp-cyan)' }}
                        >
                          <h4 className="text-[13.5px] font-semibold mb-0.5 leading-tight" style={{ color: 'var(--cp-text)' }}>
                            {project.name}
                          </h4>
                        </Link>

                        {/* Client linkage */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <span
                            className="w-1 h-1 rounded-full"
                            style={{ background: project.client_name || project.clients ? 'var(--cp-cyan)' : 'var(--cp-border-strong)' }}
                          />
                          {project.clients?.id ? (
                            <Link
                              href={`/admin/clients`}
                              className="text-[11px] truncate"
                              style={{ color: 'var(--cp-cyan)' }}
                            >
                              {project.clients.company}
                            </Link>
                          ) : (
                            <span className="text-[11px]" style={{ color: 'var(--cp-text-secondary)' }}>
                              {project.client_name || project.client_email || 'Unassigned client'}
                            </span>
                          )}
                        </div>

                        {/* Progress */}
                        <div className="flex justify-between text-[9.5px] font-mono mb-1" style={{ color: 'var(--cp-text-faint)' }}>
                          <span>Progress</span>
                          <span>{project.progress ?? 0}%</span>
                        </div>
                        <div className="w-full h-0.75 rounded-full overflow-hidden mb-3" style={{ background: 'var(--cp-surface-strong)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${project.progress ?? 0}%`,
                              background:
                                'linear-gradient(90deg, var(--cp-cyan), var(--cp-emerald))',
                            }}
                          />
                        </div>

                        {/* Footer */}
                        <div
                          className="flex items-center justify-between pt-2.5"
                          style={{ borderTop: '1px solid var(--cp-border-soft)' }}
                        >
                          <div
                            className="flex items-center gap-1 text-[10px] font-mono"
                            style={{ color: 'var(--cp-text-faint)' }}
                          >
                            <Calendar className="w-3 h-3" />
                            {project.due_date
                              ? new Date(project.due_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'No date'}
                          </div>
                          <div className="flex -space-x-1.5">
                            {(project.team || []).slice(0, 3).map((member: string, i: number) => (
                              <div
                                key={i}
                                className="w-5 h-5 rounded-full flex items-center justify-center"
                                style={{
                                  background: 'var(--cp-cyan-soft)',
                                  border: '1px solid var(--cp-cyan-border)',
                                  zIndex: 3 - i,
                                }}
                              >
                                <span
                                  className="text-[7px] font-semibold"
                                  style={{ color: 'var(--cp-cyan)' }}
                                >
                                  {member}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                  {stageProjects.length === 0 && (
                    <div
                      className="flex-1 min-h-20 rounded-xl flex items-center justify-center"
                      style={{ border: '1px dashed var(--cp-border-soft)' }}
                    >
                      <span className="text-[10px]" style={{ color: 'var(--cp-text-faint)' }}>
                        Drop here
                      </span>
                    </div>
                  )}
                </div>

                {/* Add button */}
                <div className="px-2.5 py-2" style={{ borderTop: '1px solid var(--cp-border-soft)' }}>
                  <button
                    onClick={() => {
                      setFormStage(stage)
                      setModalOpen(true)
                    }}
                    className="w-full py-1.5 flex items-center justify-center gap-1.5 text-[10.5px] rounded-lg transition-colors cursor-pointer"
                    style={{ color: 'var(--cp-text-muted)' }}
                  >
                    <Plus className="w-3 h-3" /> Add to {stage}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div
          className="flex-1 overflow-auto rounded-xl border"
          style={{
            background: 'var(--cp-surface)',
            borderColor: 'var(--cp-border)',
          }}
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className="border-b"
                style={{
                  borderColor: 'var(--cp-border)',
                  background: 'var(--cp-bg-soft)',
                }}
              >
                <th className="p-3 text-[10px] uppercase font-mono tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>Project</th>
                <th className="p-3 text-[10px] uppercase font-mono tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>Client</th>
                <th className="p-3 text-[10px] uppercase font-mono tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>Stage</th>
                <th className="p-3 text-[10px] uppercase font-mono tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>Health</th>
                <th className="p-3 text-[10px] uppercase font-mono tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>Progress</th>
                <th className="p-3 text-[10px] uppercase font-mono tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>Due Date</th>
                <th className="p-3 text-[10px] uppercase font-mono tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>Access Code</th>
                <th className="p-3 text-[10px] uppercase font-mono tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--cp-border-soft)">
              {filteredProjects.map((project) => {
                const hMeta = healthMeta(project.health)
                return (
                  <tr
                    key={project.id}
                    className="hover:bg-(--cp-surface-strong) transition-colors"
                  >
                    <td className="p-3">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="font-semibold text-[13px] hover:underline"
                        style={{ color: 'var(--cp-text)', textDecorationColor: 'var(--cp-cyan)' }}
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="p-3 text-[12px]">
                      <div className="flex flex-col">
                        <span style={{ color: 'var(--cp-text)' }}>
                          {project.client_name || project.clients?.company || '—'}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--cp-text-muted)' }}>
                          {project.client_email || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <select
                        value={project.stage}
                        onChange={async (e) => {
                          const val = e.target.value
                          setProjects(projects.map(p => p.id === project.id ? { ...p, stage: val } : p))
                          await updateProject(project.id, { stage: val })
                        }}
                        className="bg-transparent border-none outline-none text-[12px] font-medium cursor-pointer"
                        style={{ color: 'var(--cp-text-secondary)' }}
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-widest"
                        style={{
                          color: hMeta.color,
                          background: hMeta.soft,
                          border: `1px solid ${hMeta.border}`,
                        }}
                      >
                        <HealthIcon health={project.health || 'on-track'} />
                        {(project.health || 'on-track').replace('-', ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 min-w-25">
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--cp-surface-strong)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${project.progress ?? 0}%`,
                              background: 'linear-gradient(90deg, var(--cp-cyan), var(--cp-emerald))',
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--cp-text-muted)' }}>
                          {project.progress ?? 0}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-[11.5px]" style={{ color: 'var(--cp-text-muted)' }}>
                      {project.due_date
                        ? new Date(project.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'No date'}
                    </td>
                    <td className="p-3">
                      {project.access_code ? (
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded"
                          style={{
                            color: 'var(--cp-cyan)',
                            background: 'var(--cp-cyan-soft)',
                            border: '1px solid var(--cp-cyan-border)',
                          }}
                        >
                          {project.access_code}
                        </span>
                      ) : (
                        <span className="text-[10px]" style={{ color: 'var(--cp-text-faint)' }}>None</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex -space-x-1.5">
                        {(project.team || []).slice(0, 3).map((member: string, i: number) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{
                              background: 'var(--cp-cyan-soft)',
                              border: '1px solid var(--cp-cyan-border)',
                              zIndex: 3 - i,
                            }}
                          >
                            <span
                              className="text-[7px] font-semibold"
                              style={{ color: 'var(--cp-cyan)' }}
                            >
                              {member}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[12px]" style={{ color: 'var(--cp-text-faint)' }}>
                    No projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New Project Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setError('')
        }}
        title="New Project"
        subtitle="Create a project, specify client details, and assign a portal access code."
      >
        <div className="flex flex-col gap-4">
          {error && (
            <div
              className="p-3 text-[12.5px] rounded-xl border"
              style={{
                borderColor: 'var(--cp-red-border)',
                background: 'var(--cp-red-soft)',
                color: 'var(--cp-text)',
              }}
            >
              {error}
            </div>
          )}

          <ModalInput
            label="Project Name"
            value={formName}
            onChange={setFormName}
            placeholder="e.g. Nirman"
            required
          />

          {/* CRM Client Link Selection or Inline Registration */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>
                Client Link
              </label>
              <button
                type="button"
                onClick={() => {
                  setCreateNewClient(!createNewClient)
                  setFormClientId('')
                  setFormClientName('')
                  setFormClientEmail('')
                  setFormContactPerson('')
                }}
                className="text-[11px] cursor-pointer"
                style={{ color: 'var(--cp-cyan)', background: 'transparent', border: 'none' }}
              >
                {createNewClient ? '— Select Existing' : '+ Register New Client'}
              </button>
            </div>

            {createNewClient ? (
              <div className="flex flex-col gap-3 p-3.5 rounded-xl border border-(--cp-border-soft)" style={{ background: 'var(--cp-bg-soft)' }}>
                <ModalInput
                  label="Client Company"
                  value={formClientName}
                  onChange={setFormClientName}
                  placeholder="Acme Corp"
                  required
                />
                <ModalInput
                  label="Contact Person"
                  value={formContactPerson}
                  onChange={setFormContactPerson}
                  placeholder="John Doe"
                  required
                />
                <ModalInput
                  label="Client Email"
                  value={formClientEmail}
                  onChange={setFormClientEmail}
                  placeholder="contact@acme.com"
                  type="email"
                />
              </div>
            ) : (
              clients.length === 0 ? (
                <div
                  className="px-4 py-3 rounded-xl text-[12.5px]"
                  style={{
                    background: 'var(--cp-bg-soft)',
                    border: '1px solid var(--cp-border)',
                    color: 'var(--cp-text-muted)',
                  }}
                >
                  No clients yet —{' '}
                  <button
                    type="button"
                    onClick={() => setCreateNewClient(true)}
                    className="underline cursor-pointer"
                    style={{ color: 'var(--cp-cyan)', background: 'transparent', border: 'none', padding: 0 }}
                  >
                    register a client first
                  </button>
                  .
                </div>
              ) : (
                <select
                  value={formClientId}
                  onChange={(e) => handleSelectClient(e.target.value)}
                  className="px-4 py-3 rounded-xl text-[13px] outline-none appearance-none cursor-pointer [&>option]:bg-(--cp-bg-elevated) [&>option]:text-(--cp-text) w-full"
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
              )
            )}
          </div>

          <ModalInput
            label="Access Code"
            value={formCode}
            onChange={(v) => setFormCode(normalizeAccessCode(v))}
            placeholder="Auto-generated when you name the project"
          />
          <ModalInput
            label="Description"
            value={formDesc}
            onChange={setFormDesc}
            placeholder="Brief project description…"
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
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-[12px] font-medium transition-colors text-(--cp-text-muted) hover:text-(--cp-text)"
            >
              Cancel
            </button>
            <button
              onClick={handleAddProject}
              disabled={saving || !formName || !formClientName}
              className="px-5 py-2 font-medium text-[12px] rounded-xl transition-colors disabled:opacity-30 cursor-pointer"
              style={{
                background: 'var(--cp-cyan-soft)',
                color: 'var(--cp-cyan)',
                border: '1px solid var(--cp-cyan-border)',
              }}
            >
              {saving ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
