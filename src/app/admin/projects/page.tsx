'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Calendar, CheckCircle2, AlertCircle, Clock, FolderKanban } from 'lucide-react'
import Link from 'next/link'
import { fetchProjectsKanban, insertProject, updateProject } from '@/lib/db'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'

const STAGES = ['Backlog', 'Design', 'Development', 'Review', 'Completed']

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [draggedProject, setDraggedProject] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formStage, setFormStage] = useState('Backlog')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await fetchProjectsKanban()
      if (!error && data) {
        setProjects(data.map((p: any) => ({
          ...p,
          client: p.client_email || '',
          team: p.project_team?.map((pt: any) => pt.team_members?.initials || '??') || [],
        })))
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedProject(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setDragImage(e.currentTarget as Element, 20, 20)
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }

  const handleDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault()
    if (!draggedProject) return
    setProjects(projects.map(p => p.id === draggedProject ? { ...p, stage } : p))
    setDraggedProject(null)
    await updateProject(draggedProject, { stage })
  }

  const handleAddProject = async () => {
    if (!formName || !formEmail) return
    setSaving(true)
    const { data } = await insertProject({ name: formName, client_email: formEmail, status: 'starting', progress: 0, description: formDesc || 'New project' })
    if (data) {
      setProjects([{ ...data, client: formEmail, team: [], stage: formStage, health: 'on-track' }, ...projects])
      if (formStage !== 'Backlog') await updateProject(data.id, { stage: formStage })
    }
    setFormName(''); setFormEmail(''); setFormDesc(''); setFormStage('Backlog'); setSaving(false); setModalOpen(false)
  }

  const healthStyle = (h: string) => {
    if (h === 'on-track') return 'text-emerald-400 bg-emerald-500/[0.06] border-emerald-500/15'
    if (h === 'at-risk') return 'text-orange-400 bg-orange-500/[0.06] border-orange-500/15'
    if (h === 'delayed') return 'text-red-400 bg-red-500/[0.06] border-red-500/15'
    return 'text-white/30 bg-white/[0.03] border-white/[0.06]'
  }

  const HealthIcon = ({ health }: { health: string }) => {
    if (health === 'on-track') return <CheckCircle2 className="w-3 h-3" />
    if (health === 'at-risk') return <AlertCircle className="w-3 h-3" />
    if (health === 'delayed') return <Clock className="w-3 h-3" />
    return null
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white/90">Projects</h1>
          <p className="text-white/25 text-[13px] mt-0.5">Drag cards between stages to update progress.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#050505] font-semibold text-[12px] rounded-xl hover:bg-white/90 transition-all" style={{ boxShadow: '0 0 12px rgba(255,255,255,0.06)' }}>
          <Plus className="w-3.5 h-3.5" /> New Project
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 flex gap-4">
          {STAGES.map((stage) => {
            const stageProjects = projects.filter(p => p.stage === stage)
            return (
              <div key={stage} className="flex flex-col w-[280px] shrink-0 rounded-2xl max-h-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage)}>
                {/* Column Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[12px] font-bold text-white/60">{stage}</h3>
                    <span className="text-[9px] font-mono bg-white/[0.06] text-white/30 px-1.5 py-0.5 rounded-md">{stageProjects.length}</span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2.5">
                  {stageProjects.map((project) => (
                    <motion.div
                      layoutId={project.id}
                      key={project.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, project.id)}
                      className="p-3.5 rounded-xl cursor-grab active:cursor-grabbing transition-all group"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                      whileHover={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-[0.1em] border ${healthStyle(project.health)}`}>
                          <HealthIcon health={project.health || 'on-track'} />
                          {(project.health || 'on-track').replace('-', ' ')}
                        </span>
                      </div>
                      <Link href={`/admin/projects/${project.id}`} className="hover:underline">
                        <h4 className="text-[13px] font-bold text-white/85 mb-0.5">{project.name}</h4>
                      </Link>
                      <p className="text-[10px] text-white/20 font-mono mb-3">{project.client}</p>

                      {/* Progress */}
                      <div className="flex justify-between text-[9px] font-mono text-white/20 mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden mb-3">
                        <div className="h-full rounded-full" style={{ width: `${project.progress}%`, background: 'linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.5))' }} />
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.03]">
                        <div className="flex items-center gap-1 text-[9px] font-mono text-white/20">
                          <Calendar className="w-3 h-3" />
                          {project.due_date ? new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                        </div>
                        <div className="flex -space-x-1.5">
                          {(project.team || []).slice(0, 3).map((member: string, i: number) => (
                            <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600/80 to-purple-600/80 flex items-center justify-center border border-[#0a0a0c]" style={{ zIndex: 3 - i }}>
                              <span className="text-[7px] font-bold text-white">{member}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {stageProjects.length === 0 && (
                    <div className="flex-1 min-h-[80px] border border-dashed border-white/[0.04] rounded-xl flex items-center justify-center">
                      <span className="text-[10px] text-white/15">Drop here</span>
                    </div>
                  )}
                </div>

                {/* Add button */}
                <div className="px-2.5 py-2 border-t border-white/[0.03]">
                  <button onClick={() => { setFormStage(stage); setModalOpen(true) }} className="w-full py-1.5 flex items-center justify-center gap-1.5 text-[10px] text-white/20 hover:text-white/50 hover:bg-white/[0.02] rounded-lg transition-colors">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Project" subtitle="Create a new project and assign it to a stage.">
        <div className="flex flex-col gap-4">
          <ModalInput label="Project Name" value={formName} onChange={setFormName} placeholder="e.g. Aura SaaS Dashboard" required />
          <ModalInput label="Client Email" value={formEmail} onChange={setFormEmail} placeholder="client@company.com" type="email" required />
          <ModalInput label="Description" value={formDesc} onChange={setFormDesc} placeholder="Brief project description..." />
          <ModalSelect label="Initial Stage" value={formStage} onChange={setFormStage} options={STAGES.map(s => ({ value: s, label: s }))} />
          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.04]">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-white/30 hover:text-white/60 transition-colors">Cancel</button>
            <button onClick={handleAddProject} disabled={saving || !formName || !formEmail} className="px-5 py-2 bg-white text-[#050505] font-semibold text-[12px] rounded-xl hover:bg-white/90 transition-all disabled:opacity-30">
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
