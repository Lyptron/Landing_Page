'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Mail, Phone, MapPin, Globe, Briefcase, X, Users2, AlertTriangle, Trash2, RotateCcw, Wallet } from 'lucide-react'
import { fetchClients, insertClient, fetchProjects, fetchDocuments, fetchMeetings, fetchActivities, resetClientFinance, resetAllClientData, deleteClientCascade } from '@/lib/db'
import { clientTierStyle } from '@/lib/badges'
import { useAdminAuth } from '@/lib/AdminAuthContext'
import RestrictedValue from '@/components/ui/RestrictedValue'
import Modal, { ModalInput } from '@/components/ui/Modal'

const ONBOARDING_STAGES = ['Backlog', 'Design', 'Development', 'Review', 'Completed']

function TierPill({ tier }: { tier: string | null | undefined }) {
  const s = clientTierStyle(tier)
  return (
    <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-[0.1em] border" style={{ color: s.color, background: s.bg, borderColor: s.border }}>
      {s.label}
    </span>
  )
}

function OnboardingStepper({ stage, progress }: { stage: string; progress: number }) {
  const currentIndex = Math.max(0, ONBOARDING_STAGES.indexOf(stage))
  return (
    <div>
      <div className="flex items-center mb-2.5">
        {ONBOARDING_STAGES.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${i <= currentIndex ? 'bg-[var(--cp-emerald)]' : 'bg-[var(--cp-border-strong)]'}`} />
            {i < ONBOARDING_STAGES.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${i < currentIndex ? 'bg-[var(--cp-emerald)]/40' : 'bg-[var(--cp-border)]'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[11px] mb-2">
        <span className="font-medium" style={{ color: 'var(--cp-text-secondary)' }}>{stage}</span>
        <span className="font-mono" style={{ color: 'var(--cp-text-faint)' }}>{progress}%</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--cp-surface-strong)' }}>
        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'var(--cp-emerald)' }} />
      </div>
    </div>
  )
}

export default function ClientsPage() {
  const { user } = useAdminAuth()
  const isFounder = user?.role === 'founder'
  const [clients, setClients] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [meetings, setMeetings] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formCompany, setFormCompany] = useState('')
  const [formContact, setFormContact] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formIndustry, setFormIndustry] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formWebsite, setFormWebsite] = useState('')
  const [saving, setSaving] = useState(false)
  const [dangerAction, setDangerAction] = useState<null | 'finance' | 'data' | 'delete'>(null)
  const [dangerBusy, setDangerBusy] = useState(false)
  const [dangerError, setDangerError] = useState<string | null>(null)
  const [confirmText, setConfirmText] = useState('')

  useEffect(() => {
    async function load() {
      const [clientsRes, projectsRes] = await Promise.all([fetchClients(), fetchProjects()])
      if (!clientsRes.error && clientsRes.data) setClients(clientsRes.data)
      if (!projectsRes.error && projectsRes.data) setProjects(projectsRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const clientProject = useMemo(() => {
    if (!selectedClient) return null
    return projects.find((p) => p.client_id === selectedClient.id) ?? null
  }, [selectedClient, projects])

  useEffect(() => {
    async function loadDetails() {
      if (!clientProject) {
        setDocuments([]); setMeetings([]); setActivities([])
        return
      }
      setDetailLoading(true)
      const [docsRes, meetingsRes, activitiesRes] = await Promise.all([
        fetchDocuments(clientProject.id),
        fetchMeetings(clientProject.id),
        fetchActivities(clientProject.id, 5),
      ])
      if (!docsRes.error && docsRes.data) setDocuments(docsRes.data)
      if (!meetingsRes.error && meetingsRes.data) setMeetings(meetingsRes.data)
      if (!activitiesRes.error && activitiesRes.data) setActivities(activitiesRes.data)
      setDetailLoading(false)
    }
    loadDetails()
  }, [clientProject])

  const addClient = async () => {
    if (!formCompany || !formContact || !formEmail) return
    setSaving(true)
    const { data } = await insertClient({ company: formCompany, contact: formContact, email: formEmail, phone: formPhone || undefined, industry: formIndustry || undefined, location: formLocation || undefined, website: formWebsite || undefined })
    if (data) setClients([data, ...clients])
    setFormCompany(''); setFormContact(''); setFormEmail(''); setFormPhone(''); setFormIndustry(''); setFormLocation(''); setFormWebsite('')
    setSaving(false); setModalOpen(false)
  }

  function openDanger(action: 'finance' | 'data' | 'delete') {
    setDangerError(null)
    setConfirmText('')
    setDangerAction(action)
  }

  function closeDanger() {
    if (dangerBusy) return
    setDangerAction(null)
    setConfirmText('')
    setDangerError(null)
  }

  async function runDangerAction() {
    if (!selectedClient || !dangerAction) return
    setDangerBusy(true)
    setDangerError(null)
    const clientId = selectedClient.id
    let result: { error: unknown } = { error: null }
    if (dangerAction === 'finance') result = await resetClientFinance(clientId)
    else if (dangerAction === 'data') result = await resetAllClientData(clientId)
    else if (dangerAction === 'delete') result = await deleteClientCascade(clientId)

    if (result.error) {
      console.error('Danger action failed:', result.error)
      setDangerError('Something went wrong. Check the console.')
      setDangerBusy(false)
      return
    }

    if (dangerAction === 'delete') {
      setClients((prev) => prev.filter((c) => c.id !== clientId))
      setProjects((prev) => prev.filter((p) => p.client_id !== clientId))
      setSelectedClient(null)
    } else if (dangerAction === 'data') {
      setDocuments([])
      setMeetings([])
      setActivities([])
    }

    setDangerBusy(false)
    setDangerAction(null)
    setConfirmText('')
  }

  const statusStyle = (s: string) => {
    if (s === 'Active') return 'bg-[var(--cp-emerald-soft)] text-[var(--cp-emerald)] border-[var(--cp-emerald-border)]'
    if (s === 'Onboarding') return 'bg-[var(--cp-cyan-soft)] text-[var(--cp-cyan)] border-[var(--cp-cyan-border)]'
    return 'bg-[var(--cp-bg-soft)] text-[var(--cp-text-faint)] border-[var(--cp-border)]'
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--cp-text)' }}>Clients</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--cp-text-faint)' }}>Manage all agency clients and contracts.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="cp-btn-primary flex items-center gap-1.5 px-4 py-2 text-[12px]">
          <Plus className="w-3.5 h-3.5" /> New Client
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[var(--cp-border)] border-t-[var(--cp-text-muted)] rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Users2 className="w-10 h-10 mb-3" style={{ color: 'var(--cp-text-faint)' }} />
          <h3 className="font-bold mb-1" style={{ color: 'var(--cp-text-secondary)' }}>No clients yet</h3>
          <p className="text-[13px] mb-4" style={{ color: 'var(--cp-text-faint)' }}>Add your first client to get started.</p>
          <button onClick={() => setModalOpen(true)} className="cp-btn-primary px-5 py-2 text-[12px]">Add Client</button>
        </div>
      ) : (
        <div className={`flex-1 overflow-hidden flex gap-0 transition-all duration-300 ${selectedClient ? 'pr-[360px]' : ''}`}>
          {/* Table */}
          <div className="flex-1 rounded-2xl overflow-hidden flex flex-col cp-card">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b text-[9px] font-mono uppercase tracking-[0.15em]" style={{ borderColor: 'var(--cp-border-soft)', color: 'var(--cp-text-faint)' }}>
              <div className="col-span-3">Company</div>
              <div className="col-span-2">Contact</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">{isFounder ? 'Value' : 'Tier'}</div>
              <div className="col-span-3">Industry</div>
            </div>
            {/* Rows */}
            <div className="flex-1 overflow-y-auto">
              {clients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`grid grid-cols-12 gap-3 px-4 py-3 items-center cursor-pointer border-b transition-colors ${selectedClient?.id === client.id ? 'bg-[var(--cp-cyan-soft)]' : 'hover:bg-[var(--cp-bg-soft)]'}`}
                  style={{ borderColor: 'var(--cp-border-soft)' }}
                >
                  <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)' }}>
                      <span className="text-[11px] font-bold" style={{ color: 'var(--cp-text-secondary)' }}>{client.company?.charAt(0)}</span>
                    </div>
                    <span className="text-[13px] font-medium truncate" style={{ color: 'var(--cp-text)' }}>{client.company}</span>
                  </div>
                  <div className="col-span-2 flex flex-col min-w-0">
                    <span className="text-[12px] truncate" style={{ color: 'var(--cp-text-secondary)' }}>{client.contact}</span>
                    <span className="text-[10px] truncate" style={{ color: 'var(--cp-text-faint)' }}>{client.email}</span>
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-[0.1em] border ${statusStyle(client.status)}`}>{client.status || 'New'}</span>
                  </div>
                  <div className="col-span-2">
                    {isFounder ? (
                      <span className="text-[13px] font-mono" style={{ color: 'var(--cp-text-muted)' }}>
                        {client.contract_value ? <RestrictedValue value={client.contract_value} /> : '-'}
                      </span>
                    ) : (
                      <TierPill tier={client.tier} />
                    )}
                  </div>
                  <div className="col-span-3 text-[12px] truncate" style={{ color: 'var(--cp-text-faint)' }}>{client.industry || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail Slide-out */}
      <AnimatePresence>
        {selectedClient && (
          <motion.div
            initial={{ x: 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="absolute top-0 right-0 bottom-0 w-[360px] flex flex-col z-20"
            style={{ background: 'var(--cp-surface)', borderLeft: '1px solid var(--cp-border-soft)', boxShadow: '-8px 0 24px rgba(0,0,0,0.06)' }}
          >
            {/* Slide-out Header */}
            <div className="p-5 border-b flex items-start justify-between" style={{ borderColor: 'var(--cp-border-soft)' }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)' }}>
                  <span className="font-display font-bold text-lg" style={{ color: 'var(--cp-text-secondary)' }}>{selectedClient.company?.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-[16px] font-bold" style={{ color: 'var(--cp-text)' }}>{selectedClient.company}</h2>
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-[0.1em] border mt-0.5 ${statusStyle(selectedClient.status)}`}>{selectedClient.status || 'New'}</span>
                </div>
              </div>
              <button onClick={() => setSelectedClient(null)} className="p-1.5 rounded-lg transition-colors hover:bg-[var(--cp-bg-soft)] hover:text-[var(--cp-text)]" style={{ color: 'var(--cp-text-faint)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slide-out Body */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--cp-text-faint)' }}>Contact</p>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5 text-[12px]">
                    <Briefcase className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cp-text-faint)' }} />
                    <span style={{ color: 'var(--cp-text-secondary)' }}>{selectedClient.contact}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[12px]">
                    <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cp-text-faint)' }} />
                    <span style={{ color: 'var(--cp-cyan)' }}>{selectedClient.email}</span>
                  </div>
                  {selectedClient.phone && <div className="flex items-center gap-2.5 text-[12px]"><Phone className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cp-text-faint)' }} /><span style={{ color: 'var(--cp-text-secondary)' }}>{selectedClient.phone}</span></div>}
                  {selectedClient.location && <div className="flex items-center gap-2.5 text-[12px]"><MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cp-text-faint)' }} /><span style={{ color: 'var(--cp-text-secondary)' }}>{selectedClient.location}</span></div>}
                  {selectedClient.website && <div className="flex items-center gap-2.5 text-[12px]"><Globe className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cp-text-faint)' }} /><span style={{ color: 'var(--cp-cyan)' }}>{selectedClient.website}</span></div>}
                </div>
              </div>

              <div className="h-px" style={{ background: 'var(--cp-border-soft)' }} />

              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--cp-text-faint)' }}>{isFounder ? 'Financials' : 'Client Tier'}</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {isFounder ? (
                    <div className="p-3 rounded-xl" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)' }}>
                      <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--cp-text-faint)' }}>Contract Value</p>
                      <p className="text-[16px] font-mono font-bold" style={{ color: 'var(--cp-text)' }}><RestrictedValue value={selectedClient.contract_value} /></p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl flex flex-col items-start" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)' }}>
                      <p className="text-[9px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--cp-text-faint)' }}>Tier</p>
                      <TierPill tier={selectedClient.tier} />
                    </div>
                  )}
                  <div className="p-3 rounded-xl" style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)' }}>
                    <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--cp-text-faint)' }}>Renewal</p>
                    <p className="text-[13px] font-medium" style={{ color: 'var(--cp-text-secondary)' }}>{selectedClient.renewal_date || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="h-px" style={{ background: 'var(--cp-border-soft)' }} />

              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--cp-text-faint)' }}>Onboarding Progress</p>
                {clientProject ? (
                  <OnboardingStepper stage={clientProject.stage} progress={clientProject.progress ?? 0} />
                ) : (
                  <p className="text-[11px]" style={{ color: 'var(--cp-text-faint)' }}>No project linked yet.</p>
                )}
              </div>

              <div className="h-px" style={{ background: 'var(--cp-border-soft)' }} />

              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--cp-text-faint)' }}>Document Status</p>
                {!clientProject ? (
                  <p className="text-[11px]" style={{ color: 'var(--cp-text-faint)' }}>No project linked yet.</p>
                ) : detailLoading ? (
                  <div className="flex justify-center py-3"><div className="w-4 h-4 border-2 border-[var(--cp-border)] border-t-[var(--cp-text-muted)] rounded-full animate-spin" /></div>
                ) : documents.length === 0 ? (
                  <p className="text-[11px]" style={{ color: 'var(--cp-text-faint)' }}>No documents uploaded.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {documents.map((d) => (
                      <div key={d.id} className="flex items-center justify-between gap-2 text-[12px]">
                        <span className="truncate" style={{ color: 'var(--cp-text-secondary)' }}>{d.title}</span>
                        <span className="shrink-0 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-[0.1em] border bg-[var(--cp-bg-soft)] text-[var(--cp-text-muted)] border-[var(--cp-border)]">{d.type || 'File'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-px" style={{ background: 'var(--cp-border-soft)' }} />

              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--cp-text-faint)' }}>Communication Log</p>
                {!clientProject ? (
                  <p className="text-[11px]" style={{ color: 'var(--cp-text-faint)' }}>No project linked yet.</p>
                ) : detailLoading ? (
                  <div className="flex justify-center py-3"><div className="w-4 h-4 border-2 border-[var(--cp-border)] border-t-[var(--cp-text-muted)] rounded-full animate-spin" /></div>
                ) : activities.length === 0 ? (
                  <p className="text-[11px]" style={{ color: 'var(--cp-text-faint)' }}>No activity recorded.</p>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {activities.map((a) => (
                      <div key={a.id} className="text-[12px]">
                        <p style={{ color: 'var(--cp-text-secondary)' }}><span className="font-medium" style={{ color: 'var(--cp-text)' }}>{a.actor_name}</span> {a.action_text}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--cp-text-faint)' }}>{a.created_at ? new Date(a.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-px" style={{ background: 'var(--cp-border-soft)' }} />

              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--cp-text-faint)' }}>Meeting Schedule</p>
                {!clientProject ? (
                  <p className="text-[11px]" style={{ color: 'var(--cp-text-faint)' }}>No project linked yet.</p>
                ) : detailLoading ? (
                  <div className="flex justify-center py-3"><div className="w-4 h-4 border-2 border-[var(--cp-border)] border-t-[var(--cp-text-muted)] rounded-full animate-spin" /></div>
                ) : meetings.length === 0 ? (
                  <p className="text-[11px]" style={{ color: 'var(--cp-text-faint)' }}>No meetings scheduled.</p>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {meetings.map((m) => (
                      <div key={m.id} className="flex items-center justify-between gap-2 text-[12px]">
                        <div className="min-w-0">
                          <p className="truncate" style={{ color: 'var(--cp-text-secondary)' }}>{m.title}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--cp-text-faint)' }}>{m.meeting_date ? new Date(m.meeting_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}{m.meeting_time ? ` · ${m.meeting_time}` : ''}</p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-[0.1em] border ${m.type === 'past' ? 'bg-[var(--cp-bg-soft)] text-[var(--cp-text-faint)] border-[var(--cp-border)]' : 'bg-[var(--cp-cyan-soft)] text-[var(--cp-cyan)] border-[var(--cp-cyan-border)]'}`}>{m.type === 'past' ? 'Past' : 'Upcoming'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-px" style={{ background: 'var(--cp-border-soft)' }} />

              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--cp-red)' }}>Danger Zone</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => openDanger('finance')}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl text-left transition-colors hover:bg-[var(--cp-red-soft)]"
                    style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)' }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Wallet className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cp-red)' }} />
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold" style={{ color: 'var(--cp-text)' }}>Reset finance</p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--cp-text-faint)' }}>Delete every payment & invoice</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => openDanger('data')}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl text-left transition-colors hover:bg-[var(--cp-red-soft)]"
                    style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)' }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cp-red)' }} />
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold" style={{ color: 'var(--cp-text)' }}>Reset all data</p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--cp-text-faint)' }}>Wipe payments, docs, meetings, activity</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => openDanger('delete')}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl text-left transition-colors"
                    style={{ background: 'var(--cp-red-soft)', border: '1px solid var(--cp-red-border)' }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Trash2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cp-red)' }} />
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold" style={{ color: 'var(--cp-red)' }}>Delete client</p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--cp-text-faint)' }}>Removes client and all linked projects</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Client Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Client" subtitle="Add a new client to your agency.">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Company" value={formCompany} onChange={setFormCompany} placeholder="Acme Corp" required />
            <ModalInput label="Contact Person" value={formContact} onChange={setFormContact} placeholder="John Doe" required />
          </div>
          <ModalInput label="Email" value={formEmail} onChange={setFormEmail} placeholder="john@acme.com" type="email" required />
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Phone" value={formPhone} onChange={setFormPhone} placeholder="+91 98765 43210" />
            <ModalInput label="Industry" value={formIndustry} onChange={setFormIndustry} placeholder="Technology" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Location" value={formLocation} onChange={setFormLocation} placeholder="Mumbai, IN" />
            <ModalInput label="Website" value={formWebsite} onChange={setFormWebsite} placeholder="acme.com" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-[var(--cp-text-muted)] hover:text-[var(--cp-text)] transition-colors">Cancel</button>
            <button onClick={addClient} disabled={saving || !formCompany || !formContact || !formEmail} className="cp-btn-primary px-5 py-2 text-[12px]">
              {saving ? 'Adding...' : 'Add Client'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Danger Confirmation Modal */}
      <Modal
        open={!!dangerAction}
        onClose={closeDanger}
        title={
          dangerAction === 'delete' ? 'Delete client' :
          dangerAction === 'data' ? 'Reset all data' :
          'Reset finance'
        }
        width="max-w-md"
      >
        {dangerAction && selectedClient && (() => {
          const requireType = dangerAction === 'delete'
          const expected = selectedClient.company || ''
          const matches = !requireType || confirmText.trim() === expected
          const headline =
            dangerAction === 'delete' ? 'Permanently delete this client?' :
            dangerAction === 'data' ? 'Wipe every record tied to this client?' :
            'Delete every payment and invoice?'
          const body =
            dangerAction === 'delete'
              ? 'This removes the client, every project they own, and every payment, document, meeting, milestone, and activity attached to those projects. This cannot be undone.'
              : dangerAction === 'data'
              ? 'This clears payments, milestones, approvals, documents, meetings, feedback, gallery items, deployments, announcements, and activity for every project this client owns. The client and their projects stay. This cannot be undone.'
              : 'This deletes every payment row across every project this client owns. The client, projects, and all other data stay. This cannot be undone.'
          const ctaLabel =
            dangerAction === 'delete' ? 'Delete client' :
            dangerAction === 'data' ? 'Reset all data' :
            'Reset finance'

          return (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--cp-red-soft)', border: '1px solid var(--cp-red-border)' }}>
                <AlertTriangle className="w-6 h-6" style={{ color: 'var(--cp-red)' }} />
              </div>
              <div>
                <p className="text-[14px] font-semibold" style={{ color: 'var(--cp-text)' }}>{headline}</p>
                <p className="text-[15px] font-bold mt-1" style={{ color: 'var(--cp-red)' }}>&ldquo;{expected}&rdquo;</p>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--cp-text-muted)' }}>{body}</p>

              {requireType && (
                <div className="w-full text-left">
                  <label className="block text-[10px] font-mono uppercase tracking-[0.15em] mb-1.5" style={{ color: 'var(--cp-text-faint)' }}>
                    Type <span style={{ color: 'var(--cp-text)' }}>{expected}</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={expected}
                    className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                    style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)', color: 'var(--cp-text)' }}
                    autoFocus
                  />
                </div>
              )}

              {dangerError && (
                <p className="text-[12px] w-full text-left" style={{ color: 'var(--cp-red)' }}>{dangerError}</p>
              )}

              <div className="flex items-center gap-3 w-full pt-2 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
                <button
                  onClick={closeDanger}
                  disabled={dangerBusy}
                  className="flex-1 px-4 py-2.5 rounded-xl text-[12.5px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  style={{ color: 'var(--cp-text-muted)', background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={runDangerAction}
                  disabled={dangerBusy || !matches}
                  className="flex-1 px-4 py-2.5 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer disabled:opacity-50"
                  style={{ background: 'var(--cp-red)', color: '#fff', boxShadow: '0 0 16px color-mix(in srgb, var(--cp-red) 30%, transparent)' }}
                >
                  {dangerBusy ? 'Working…' : ctaLabel}
                </button>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
