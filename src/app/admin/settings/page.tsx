'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Building2,
  Bell,
  Shield,
  Blocks,
  CheckCircle2,
  Key,
  Copy,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  Settings2,
  SunMoon,
  Sun,
  Moon,
  Monitor,
  Sunrise,
  Sunset,
  MapPin,
  Clock,
  AlertTriangle,
  Wallet,
  RotateCcw,
  Skull
} from 'lucide-react'
import { useAdminAuth } from '@/lib/AdminAuthContext'
import { supabase } from '@/lib/supabase'
import {
  fetchAllProjectsWithCodes,
  generateAccessCode,
  removeAccessCode,
  uploadLogo,
  fetchAgencySettings,
  upsertAgencySettings,
  resetAllFinance,
  resetAllProjectsData,
  resetAllLeads,
  factoryResetAgency,
} from '@/lib/db'
import Modal from '@/components/ui/Modal'
import { useThemeMode, GEOLOCATION_RATIONALE } from '@/hooks/useThemeMode'
import type { AutoStrategy, ThemeMode } from '@/hooks/useThemeMode'
import { useSetLogoUrl } from '@/lib/LogoContext'

const TABS = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'access-codes', label: 'Client Codes', icon: Key },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'integrations', label: 'Integrations', icon: Blocks },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: SunMoon },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
]

const NOTIFICATION_ITEMS = [
  { key: 'new_inquiry', label: 'New client inquiry', desc: 'When someone submits the contact form', default: true },
  { key: 'feedback_submitted', label: 'Client feedback submitted', desc: 'When a client sends feedback via portal', default: true },
  { key: 'payment_received', label: 'Payment received', desc: 'When a client makes a payment', default: true },
  { key: 'approval_requested', label: 'Approval requested', desc: 'When a client approves or rejects a deliverable', default: false },
] as const

type NotificationKey = (typeof NOTIFICATION_ITEMS)[number]['key']
type NotificationPrefs = Record<NotificationKey, boolean>

const DEFAULT_NOTIFICATIONS: NotificationPrefs = NOTIFICATION_ITEMS.reduce(
  (acc, item) => ({ ...acc, [item.key]: item.default }),
  {} as NotificationPrefs
)

const MODE_OPTIONS: { id: ThemeMode; label: string; desc: string; icon: typeof Sun }[] = [
  { id: 'auto', label: 'Auto', desc: 'Switches with the sun (or your system)', icon: SunMoon },
  { id: 'light', label: 'Light', desc: 'Always use the light palette', icon: Sun },
  { id: 'dark', label: 'Dark', desc: 'Always use the dark palette', icon: Moon },
]

const STRATEGY_OPTIONS: { id: AutoStrategy; label: string; desc: string; icon: typeof Sun }[] = [
  { id: 'sunset', label: 'Sunset & Sunrise', desc: 'Dark from sunset to sunrise, based on your location', icon: Sunset },
  { id: 'fixed', label: 'Fixed Hours', desc: 'Dark from 7 PM to 7 AM', icon: Clock },
  { id: 'system', label: 'Match System', desc: 'Follows your device’s light/dark setting', icon: Monitor },
]

function generateRandomCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export default function SettingsPage() {
  const { user } = useAdminAuth()
  const isFounder = user?.role === 'founder'
  const [activeTab, setActiveTab] = useState(() => (
    typeof window !== 'undefined' && window.location.hash === '#appearance' ? 'appearance' : 'general'
  ))
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newCodeProject, setNewCodeProject] = useState<string | null>(null)
  const [customCode, setCustomCode] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [agencyName, setAgencyName] = useState('Lyptron')
  const [agencyEmail, setAgencyEmail] = useState('hello@lyptron.com')
  const [agencyWebsite, setAgencyWebsite] = useState('https://lyptron.com')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [savingGeneral, setSavingGeneral] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [notifications, setNotifications] = useState<NotificationPrefs>(DEFAULT_NOTIFICATIONS)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [notificationsSaved, setNotificationsSaved] = useState(false)
  const [dangerAction, setDangerAction] = useState<null | 'finance' | 'projects' | 'leads' | 'factory'>(null)
  const [dangerBusy, setDangerBusy] = useState(false)
  const [dangerError, setDangerError] = useState<string | null>(null)
  const [dangerDone, setDangerDone] = useState<string | null>(null)
  const [dangerConfirmText, setDangerConfirmText] = useState('')
  const { mode, strategy, resolved, sunTimes, reason, setMode, setStrategy } = useThemeMode()
  const setGlobalLogo = useSetLogoUrl()

  useEffect(() => {
    async function loadSettings() {
      const { data } = await fetchAgencySettings()
      if (data) {
        if (data.name) setAgencyName(data.name)
        if (data.email) setAgencyEmail(data.email)
        if (data.website) setAgencyWebsite(data.website)
        if (data.logo_url) setLogoUrl(data.logo_url)
        if (data.notifications && typeof data.notifications === 'object') {
          setNotifications({ ...DEFAULT_NOTIFICATIONS, ...data.notifications })
        }
      }
    }
    loadSettings()
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user?.name) setDisplayName(user.name)
  }, [user?.name])

  useEffect(() => {
    if (activeTab === 'access-codes') loadProjects()
  }, [activeTab])

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    const { data: url, error } = await uploadLogo(file)
    if (error && process.env.NODE_ENV !== 'production') {
      console.error('Logo upload failed:', error.message)
    }
    if (url) {
      setLogoUrl(url)
      setGlobalLogo(url) // Immediately update across the entire app
      await upsertAgencySettings({ logo_url: url })
    }
    setLogoUploading(false)
  }

  async function handleSaveGeneral() {
    setSavingGeneral(true)
    await upsertAgencySettings({ name: agencyName, email: agencyEmail, website: agencyWebsite, logo_url: logoUrl })
    setSavingGeneral(false)
  }

  async function handleSaveProfile() {
    setSavingProfile(true)
    setProfileSaved(false)
    const { error } = await supabase.auth.updateUser({ data: { full_name: displayName } })
    if (!error) {
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2200)
    } else {
      console.error('Profile save failed:', error)
    }
    setSavingProfile(false)
  }

  function toggleNotification(key: NotificationKey) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSaveNotifications() {
    setSavingNotifications(true)
    setNotificationsSaved(false)
    const { error } = await upsertAgencySettings({ notifications })
    if (!error) {
      setNotificationsSaved(true)
      setTimeout(() => setNotificationsSaved(false), 2200)
    } else {
      console.error('Notifications save failed:', error)
    }
    setSavingNotifications(false)
  }

  function openDanger(action: 'finance' | 'projects' | 'leads' | 'factory') {
    setDangerError(null)
    setDangerDone(null)
    setDangerConfirmText('')
    setDangerAction(action)
  }

  function closeDanger() {
    if (dangerBusy) return
    setDangerAction(null)
    setDangerConfirmText('')
    setDangerError(null)
  }

  async function runDangerAction() {
    if (!dangerAction) return
    setDangerBusy(true)
    setDangerError(null)
    let result: { error: unknown } = { error: null }
    if (dangerAction === 'finance') result = await resetAllFinance()
    else if (dangerAction === 'projects') result = await resetAllProjectsData()
    else if (dangerAction === 'leads') result = await resetAllLeads()
    else if (dangerAction === 'factory') result = await factoryResetAgency()

    if (result.error) {
      console.error('Danger action failed:', result.error)
      setDangerError('Something went wrong. Check the console.')
      setDangerBusy(false)
      return
    }
    setDangerBusy(false)
    setDangerDone(
      dangerAction === 'finance' ? 'All finance records have been deleted.' :
      dangerAction === 'projects' ? 'Every project’s data has been wiped.' :
      dangerAction === 'leads' ? 'All inquiries, leads, and campaigns have been deleted.' :
      'Factory reset complete. Clients, projects, and lead funnel cleared.'
    )
    setDangerAction(null)
    setDangerConfirmText('')
  }

  async function loadProjects() {
    setLoading(true)
    const { data } = await fetchAllProjectsWithCodes()
    if (data) setProjects(data)
    setLoading(false)
  }

  async function handleGenerateCode(projectId: string) {
    const code = customCode.trim().toUpperCase() || generateRandomCode()
    await generateAccessCode(projectId, code)
    setCustomCode('')
    setNewCodeProject(null)
    loadProjects()
  }

  async function handleRemoveCode(projectId: string) {
    await removeAccessCode(projectId)
    loadProjects()
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-[var(--cp-text)] via-[var(--cp-text)] to-[var(--cp-text-muted)] bg-clip-text text-transparent tracking-tight mb-1">Settings</h1>
        <p className="text-[var(--cp-text-faint)] text-[13px]">Manage your agency preferences, client access codes, and integrations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1">
          {TABS.filter((tab) => tab.id !== 'danger' || isFounder).map((tab) => {
            const isActive = activeTab === tab.id
            const isDanger = tab.id === 'danger'
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? isDanger
                      ? 'bg-[var(--cp-red-soft)] text-[var(--cp-red)] border border-[var(--cp-red-border)]'
                      : 'bg-[var(--cp-surface-strong)] text-[var(--cp-text)] border border-[var(--cp-border)]'
                    : isDanger
                      ? 'text-[var(--cp-red)] hover:bg-[var(--cp-red-soft)] border border-transparent opacity-80 hover:opacity-100'
                      : 'text-[var(--cp-text-faint)] hover:bg-[var(--cp-surface)] border border-transparent'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-3xl">
          {/* ─── GENERAL TAB ─── */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-8"
            >
              <div className="premium-card p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="mb-6 border-b border-[var(--cp-border-soft)] pb-6">
                  <h2 className="font-display text-xl font-bold text-[var(--cp-text)]">Agency Profile</h2>
                  <p className="text-[13px] text-[var(--cp-text-faint)] mt-1">This is your agency&apos;s primary identity across the platform.</p>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-fuchsia-500/20 border border-[var(--cp-border)] flex items-center justify-center shrink-0 overflow-hidden">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Agency Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <span className="font-display font-bold text-3xl text-[var(--cp-text)]">L</span>
                      )}
                    </div>
                    <div>
                      <label className="px-4 py-2 bg-[var(--cp-surface)] hover:bg-[var(--cp-surface-strong)] border border-[var(--cp-border-soft)] rounded-lg text-[13px] text-[var(--cp-text)] transition-colors mb-2 cursor-pointer inline-block">
                        {logoUploading ? 'Uploading...' : 'Upload Logo'}
                        <input
                          type="file"
                          accept="image/svg+xml,image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={logoUploading}
                        />
                      </label>
                      <p className="text-[11px] text-[var(--cp-text-faint)] mt-2">SVG, PNG, JPG, or WebP (max. 800x400px)</p>
                      {logoUrl && (
                        <button
                          onClick={async () => {
                            setLogoUrl(null)
                            setGlobalLogo('/images/logo.gif')
                            await upsertAgencySettings({ logo_url: null })
                          }}
                          className="text-[11px] text-[var(--cp-red)] opacity-60 hover:opacity-100 mt-1 transition-opacity"
                        >
                          Remove logo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-text-muted)]">Agency Name</label>
                      <input
                        type="text"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        className="px-4 py-2.5 bg-[var(--cp-bg-soft)] border border-[var(--cp-border)] rounded-lg text-[13px] text-[var(--cp-text)] focus:outline-none focus:border-[var(--cp-border-strong)] transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-text-muted)]">Contact Email</label>
                      <input
                        type="email"
                        value={agencyEmail}
                        onChange={(e) => setAgencyEmail(e.target.value)}
                        className="px-4 py-2.5 bg-[var(--cp-bg-soft)] border border-[var(--cp-border)] rounded-lg text-[13px] text-[var(--cp-text)] focus:outline-none focus:border-[var(--cp-border-strong)] transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-text-muted)]">Website</label>
                      <input
                        type="text"
                        value={agencyWebsite}
                        onChange={(e) => setAgencyWebsite(e.target.value)}
                        className="px-4 py-2.5 bg-[var(--cp-bg-soft)] border border-[var(--cp-border)] rounded-lg text-[13px] text-[var(--cp-text)] focus:outline-none focus:border-[var(--cp-border-strong)] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--cp-border-soft)] flex justify-end">
                  <button
                    onClick={handleSaveGeneral}
                    disabled={savingGeneral}
                    className="px-6 py-2.5 bg-[var(--cp-cyan)] text-white font-semibold text-[13px] rounded-full hover:bg-[var(--cp-cyan-strong)] transition-all shadow-[0_0_20px_color-mix(in_srgb,var(--cp-cyan)_30%,transparent)] disabled:opacity-50"
                  >
                    {savingGeneral ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── ACCESS CODES TAB ─── */}
          {activeTab === 'access-codes' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="premium-card p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="mb-6 border-b border-[var(--cp-border-soft)] pb-6 flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-[var(--cp-text)]">Client Access Codes</h2>
                    <p className="text-[13px] text-[var(--cp-text-faint)] mt-1">Generate, manage, and revoke access codes for client portals. Clients use these to log into their dashboard.</p>
                  </div>
                  <button onClick={loadProjects} className="p-2 rounded-lg text-[var(--cp-text-faint)] hover:text-[var(--cp-text-secondary)] hover:bg-[var(--cp-surface-strong)] transition-all" title="Refresh">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {projects.length === 0 && !loading ? (
                  <div className="text-center py-12">
                    <Key className="w-8 h-8 text-[var(--cp-text-faint)] mx-auto mb-3" />
                    <p className="text-[var(--cp-text-faint)] text-[13px]">No projects found. Create a project first from the Projects page.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="p-5 rounded-2xl border border-[var(--cp-border-soft)] hover:border-[var(--cp-border)] transition-all"
                        style={{ background: 'var(--cp-surface-strong)' }}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="font-bold text-[var(--cp-text)] text-[15px]">{project.name}</h3>
                            <p className="text-[11px] text-[var(--cp-text-faint)] font-mono mt-0.5">{project.client_email || 'No client email'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                              project.status === 'completed' ? 'bg-[var(--cp-emerald-soft)] text-[var(--cp-emerald)] border border-[var(--cp-emerald-border)]' :
                              project.status === 'in-progress' ? 'bg-[var(--cp-cyan-soft)] text-[var(--cp-cyan)] border border-[var(--cp-cyan-border)]' :
                              'bg-[var(--cp-surface)] text-[var(--cp-text-faint)] border border-[var(--cp-border-soft)]'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                        </div>

                        {project.access_code ? (
                          <div className="flex items-center gap-3 mt-4">
                            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--cp-cyan-soft)', border: '1px solid var(--cp-cyan-border)' }}>
                              <Key className="w-4 h-4 text-[var(--cp-cyan)] opacity-60 shrink-0" />
                              <span className="font-mono text-[15px] font-bold text-[var(--cp-cyan)] tracking-[0.2em]">{project.access_code}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(project.access_code, project.id)}
                              className="p-3 rounded-xl text-[var(--cp-text-faint)] hover:text-[var(--cp-text-secondary)] hover:bg-[var(--cp-surface-strong)] transition-all"
                              title="Copy code"
                            >
                              {copiedId === project.id ? <CheckCircle2 className="w-4 h-4 text-[var(--cp-emerald)]" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/client`, project.id + '-url')}
                              className="p-3 rounded-xl text-[var(--cp-text-faint)] hover:text-[var(--cp-text-secondary)] hover:bg-[var(--cp-surface-strong)] transition-all"
                              title="Copy portal URL"
                            >
                              {copiedId === project.id + '-url' ? <CheckCircle2 className="w-4 h-4 text-[var(--cp-emerald)]" /> : <ExternalLink className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleRemoveCode(project.id)}
                              className="p-3 rounded-xl text-[var(--cp-text-faint)] hover:text-[var(--cp-red)] hover:bg-[var(--cp-red-soft)] transition-all"
                              title="Revoke code"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : newCodeProject === project.id ? (
                          <div className="flex items-center gap-3 mt-4">
                            <input
                              type="text"
                              placeholder="Custom code (or leave blank for random)"
                              value={customCode}
                              onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                              className="flex-1 px-4 py-3 rounded-xl text-[13px] text-[var(--cp-text)] font-mono tracking-widest outline-none"
                              style={{ background: 'var(--cp-surface-strong)', border: '1px solid var(--cp-border)' }}
                              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cp-border-strong)' }}
                              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--cp-border)' }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleGenerateCode(project.id)}
                              className="px-5 py-3 bg-[var(--cp-cyan)] text-white font-semibold text-[12px] rounded-xl transition-all hover:bg-[var(--cp-cyan-strong)]"
                              style={{ boxShadow: '0 0 15px color-mix(in srgb, var(--cp-cyan) 25%, transparent)' }}
                            >
                              Generate
                            </button>
                            <button
                              onClick={() => { setNewCodeProject(null); setCustomCode('') }}
                              className="p-3 rounded-xl text-[var(--cp-text-faint)] hover:text-[var(--cp-text-secondary)] hover:bg-[var(--cp-surface-strong)] transition-all"
                            >
                              &times;
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setNewCodeProject(project.id)}
                            className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl text-[12px] font-semibold text-[var(--cp-text-muted)] hover:text-[var(--cp-text-secondary)] hover:bg-[var(--cp-surface-strong)] transition-all border border-dashed border-[var(--cp-border)]"
                          >
                            <Plus className="w-4 h-4" /> Generate Access Code
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Info Card */}
              <div className="premium-card p-6 rounded-3xl relative overflow-hidden">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--cp-cyan-soft)', border: '1px solid var(--cp-cyan-border)' }}>
                    <Settings2 className="w-5 h-5 text-[var(--cp-cyan)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--cp-text)] text-[14px] mb-1">How Client Codes Work</h3>
                    <p className="text-[12px] text-[var(--cp-text-faint)] leading-relaxed">
                      Each project can have a unique access code. Share the code with your client — they enter it at <span className="font-mono text-[var(--cp-cyan)] opacity-60">/client</span> to access their project dashboard. You can revoke or regenerate codes anytime. Everything the client sees is pulled from your Supabase data in real-time.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── PROFILE TAB ─── */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-8"
            >
              <div className="premium-card p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="mb-6 border-b border-[var(--cp-border-soft)] pb-6">
                  <h2 className="font-display text-xl font-bold text-[var(--cp-text)]">My Profile</h2>
                  <p className="text-[13px] text-[var(--cp-text-faint)] mt-1">Your admin account details.</p>
                </div>

                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-2xl p-[2px]" style={{ background: 'linear-gradient(135deg, rgba(29,126,245,0.6), rgba(139,92,246,0.6))' }}>
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-2xl flex items-center justify-center" style={{ background: 'var(--cp-bg)' }}>
                        <span className="text-2xl font-bold text-[var(--cp-text)]">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--cp-text)]">{user?.name || 'Admin'}</h3>
                    <p className="text-[13px] text-[var(--cp-text-faint)]">{user?.email}</p>
                    <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--cp-emerald)] opacity-60 mt-1">Authenticated</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-text-muted)]">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="px-4 py-2.5 bg-[var(--cp-bg-soft)] border border-[var(--cp-border)] rounded-lg text-[13px] text-[var(--cp-text)] focus:outline-none focus:border-[var(--cp-border-strong)] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-text-muted)]">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      disabled
                      className="px-4 py-2.5 bg-[var(--cp-bg-soft)] border border-[var(--cp-border)] rounded-lg text-[13px] text-[var(--cp-text-muted)] cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--cp-border-soft)] flex items-center justify-end gap-3">
                  {profileSaved && (
                    <span className="flex items-center gap-1.5 text-[12px] text-[var(--cp-emerald)]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                    </span>
                  )}
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile || !displayName.trim() || displayName === user?.name}
                    className="px-6 py-2.5 bg-[var(--cp-cyan)] text-white font-semibold text-[13px] rounded-full hover:bg-[var(--cp-cyan-strong)] transition-all shadow-[0_0_20px_color-mix(in_srgb,var(--cp-cyan)_30%,transparent)] disabled:opacity-50"
                  >
                    {savingProfile ? 'Saving…' : 'Update Profile'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── INTEGRATIONS TAB ─── */}
          {activeTab === 'integrations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-8"
            >
              <div className="premium-card p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="mb-6 border-b border-[var(--cp-border-soft)] pb-6">
                  <h2 className="font-display text-xl font-bold text-[var(--cp-text)]">Installed Integrations</h2>
                  <p className="text-[13px] text-[var(--cp-text-faint)] mt-1">Connect your agency&apos;s tools to automate your workflow.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Supabase — Connected */}
                  <div className="flex items-center justify-between p-4 bg-[var(--cp-surface-strong)] border border-[var(--cp-border-soft)] rounded-xl hover:border-[var(--cp-border)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#3ECF8E] text-white rounded-lg flex items-center justify-center shrink-0 font-bold text-lg">
                        S
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-[var(--cp-text)] flex items-center gap-2">
                          Supabase <CheckCircle2 className="w-3 h-3 text-[var(--cp-emerald)]" />
                        </h4>
                        <p className="text-[11px] text-[var(--cp-text-faint)]">Database & Auth connected</p>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 bg-[var(--cp-emerald-soft)] border border-[var(--cp-emerald-border)] text-[var(--cp-emerald)] text-[9px] font-bold font-mono uppercase tracking-[0.15em] rounded-full">Active</span>
                  </div>

                  {/* Google — Connected if using Google auth */}
                  <div className="flex items-center justify-between p-4 bg-[var(--cp-surface-strong)] border border-[var(--cp-border-soft)] rounded-xl hover:border-[var(--cp-border)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-[var(--cp-text)] flex items-center gap-2">
                          Google OAuth {user?.avatar_url && <CheckCircle2 className="w-3 h-3 text-[var(--cp-emerald)]" />}
                        </h4>
                        <p className="text-[11px] text-[var(--cp-text-faint)]">{user?.avatar_url ? 'Sign-in with Google enabled' : 'Enable Google sign-in for admins'}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-[0.15em] ${user?.avatar_url ? 'bg-[var(--cp-emerald-soft)] border border-[var(--cp-emerald-border)] text-[var(--cp-emerald)]' : 'bg-[var(--cp-surface)] border border-[var(--cp-border-soft)] text-[var(--cp-text-faint)]'}`}>
                      {user?.avatar_url ? 'Active' : 'Available'}
                    </span>
                  </div>

                  {/* GitHub */}
                  <div className="flex items-center justify-between p-4 bg-[var(--cp-surface-strong)] border border-[var(--cp-border-soft)] rounded-xl hover:border-[var(--cp-border)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 9 18v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-[var(--cp-text)]">GitHub</h4>
                        <p className="text-[11px] text-[var(--cp-text-faint)]">Connect for commit tracking</p>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 bg-[var(--cp-cyan)] text-white font-semibold rounded-full text-[11px] transition-colors shadow-[0_0_20px_color-mix(in_srgb,var(--cp-cyan)_30%,transparent)]">
                      Connect
                    </button>
                  </div>

                  {/* Stripe — financial integration, founder-only */}
                  {isFounder && (
                    <div className="flex items-center justify-between p-4 bg-[var(--cp-surface-strong)] border border-[var(--cp-border-soft)] rounded-xl hover:border-[var(--cp-border)] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#635BFF] text-white rounded-lg flex items-center justify-center shrink-0 font-bold text-lg">
                          S
                        </div>
                        <div>
                          <h4 className="text-[13px] font-bold text-[var(--cp-text)]">Stripe</h4>
                          <p className="text-[11px] text-[var(--cp-text-faint)]">Sync invoices and payments</p>
                        </div>
                      </div>
                      <button className="px-4 py-1.5 bg-[var(--cp-cyan)] text-white font-semibold rounded-full text-[11px] transition-colors shadow-[0_0_20px_color-mix(in_srgb,var(--cp-cyan)_30%,transparent)]">
                        Connect
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── NOTIFICATIONS TAB ─── */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="mb-6 border-b border-[var(--cp-border-soft)] pb-6">
                <h2 className="font-display text-xl font-bold text-[var(--cp-text)]">Notification Preferences</h2>
                <p className="text-[13px] text-[var(--cp-text-faint)] mt-1">Choose what notifications you want to receive.</p>
              </div>

              <div className="flex flex-col gap-5">
                {NOTIFICATION_ITEMS.map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-[var(--cp-surface-strong)] border border-[var(--cp-border-soft)] rounded-xl">
                    <div>
                      <h4 className="text-[13px] font-medium text-[var(--cp-text)]">{item.label}</h4>
                      <p className="text-[11px] text-[var(--cp-text-faint)] mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!notifications[item.key]}
                        onChange={() => toggleNotification(item.key)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-[var(--cp-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--cp-bg)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--cp-text-muted)] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[color-mix(in_srgb,var(--cp-cyan)_30%,transparent)] peer-checked:after:bg-[var(--cp-cyan)]" />
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--cp-border-soft)] flex items-center justify-end gap-3">
                {notificationsSaved && (
                  <span className="flex items-center gap-1.5 text-[12px] text-[var(--cp-emerald)]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
                <button
                  onClick={handleSaveNotifications}
                  disabled={savingNotifications}
                  className="px-6 py-2.5 bg-[var(--cp-cyan)] text-white font-semibold text-[13px] rounded-full hover:bg-[var(--cp-cyan-strong)] transition-all shadow-[0_0_20px_color-mix(in_srgb,var(--cp-cyan)_30%,transparent)] disabled:opacity-50"
                >
                  {savingNotifications ? 'Saving…' : 'Save Preferences'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── SECURITY TAB ─── */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="mb-6 border-b border-[var(--cp-border-soft)] pb-6">
                <h2 className="font-display text-xl font-bold text-[var(--cp-text)]">Security</h2>
                <p className="text-[13px] text-[var(--cp-text-faint)] mt-1">Manage your authentication and security settings.</p>
              </div>

              <div className="flex flex-col gap-6">
                <div className="p-5 rounded-2xl border border-[var(--cp-border-soft)]" style={{ background: 'var(--cp-surface-strong)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-[14px] font-bold text-[var(--cp-text)]">Authentication Method</h4>
                      <p className="text-[12px] text-[var(--cp-text-faint)] mt-0.5">How you sign in to the admin panel</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--cp-emerald-soft)] border border-[var(--cp-emerald-border)]">
                      <CheckCircle2 className="w-3 h-3 text-[var(--cp-emerald)]" />
                      <span className="text-[var(--cp-emerald)] text-[9px] font-bold font-mono uppercase tracking-[0.15em]">Active</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-[var(--cp-text-secondary)]">
                    Signed in as <span className="font-mono text-[var(--cp-cyan)] opacity-70">{user?.email}</span>
                    {user?.avatar_url ? ' via Google OAuth' : ' via email/password'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-[var(--cp-border-soft)]" style={{ background: 'var(--cp-surface-strong)' }}>
                  <h4 className="text-[14px] font-bold text-[var(--cp-text)] mb-2">Row Level Security</h4>
                  <p className="text-[12px] text-[var(--cp-text-faint)] leading-relaxed">
                    RLS is enabled on all tables with permissive policies. For production, tighten these policies in your Supabase dashboard to restrict access based on authenticated users.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── DANGER ZONE TAB ─── */}
          {activeTab === 'danger' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              <div
                className="p-6 md:p-8 rounded-3xl relative overflow-hidden"
                style={{ background: 'var(--cp-red-soft)', border: '1px solid var(--cp-red-border)' }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--cp-red) 18%, transparent)', border: '1px solid var(--cp-red-border)' }}>
                    <AlertTriangle className="w-5 h-5 text-[var(--cp-red)]" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-[var(--cp-text)]">Danger Zone</h2>
                    <p className="text-[13px] text-[var(--cp-text-secondary)] mt-1 leading-relaxed">
                      These actions wipe production data across the entire agency. They cannot be undone. Use them when seed/test data needs to be cleared, or when you’re starting fresh.
                    </p>
                  </div>
                </div>
              </div>

              {dangerDone && (
                <div
                  className="p-4 rounded-2xl flex items-center gap-3"
                  style={{ background: 'var(--cp-emerald-soft)', border: '1px solid var(--cp-emerald-border)' }}
                >
                  <CheckCircle2 className="w-4 h-4 text-[var(--cp-emerald)] shrink-0" />
                  <p className="text-[13px] text-[var(--cp-text-secondary)]">{dangerDone}</p>
                </div>
              )}

              {(
                [
                  {
                    id: 'finance' as const,
                    label: 'Reset all finance',
                    desc: 'Delete every payment, invoice, expense, and subscription row across the agency.',
                    icon: Wallet,
                    cta: 'Reset finance',
                  },
                  {
                    id: 'projects' as const,
                    label: 'Reset all project data',
                    desc: 'Wipe milestones, documents, meetings, feedback, gallery, approvals, deployments, activity, and announcements for every project. Projects + clients stay.',
                    icon: RotateCcw,
                    cta: 'Reset project data',
                  },
                  {
                    id: 'leads' as const,
                    label: 'Reset CRM',
                    desc: 'Delete every inquiry, lead, campaign, and marketing task. Clients are not touched.',
                    icon: RotateCcw,
                    cta: 'Reset CRM',
                  },
                  {
                    id: 'factory' as const,
                    label: 'Factory reset agency',
                    desc: 'Nuke every client, project, payment, document, meeting, lead, inquiry, campaign, task, and roadmap item. Admin users, agency settings, team members survive.',
                    icon: Skull,
                    cta: 'Factory reset',
                    severe: true,
                  },
                ]
              ).map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl flex items-start justify-between gap-4"
                  style={{
                    background: item.severe ? 'color-mix(in srgb, var(--cp-red) 6%, var(--cp-surface-strong))' : 'var(--cp-surface-strong)',
                    border: item.severe ? '1px solid var(--cp-red-border)' : '1px solid var(--cp-border-soft)',
                  }}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: item.severe ? 'color-mix(in srgb, var(--cp-red) 18%, transparent)' : 'var(--cp-bg-soft)',
                        border: item.severe ? '1px solid var(--cp-red-border)' : '1px solid var(--cp-border-soft)',
                      }}
                    >
                      <item.icon className={`w-4 h-4 ${item.severe ? 'text-[var(--cp-red)]' : 'text-[var(--cp-text-muted)]'}`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-bold text-[var(--cp-text)]">{item.label}</h4>
                      <p className="text-[12px] text-[var(--cp-text-faint)] mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openDanger(item.id)}
                    className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
                    style={{
                      background: item.severe ? 'var(--cp-red)' : 'transparent',
                      color: item.severe ? '#fff' : 'var(--cp-red)',
                      border: item.severe ? '1px solid var(--cp-red)' : '1px solid var(--cp-red-border)',
                      boxShadow: item.severe ? '0 0 16px color-mix(in srgb, var(--cp-red) 30%, transparent)' : 'none',
                    }}
                  >
                    {item.cta}
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {/* ─── APPEARANCE TAB ─── */}
          {activeTab === 'appearance' && (
            <motion.div
              id="appearance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="mb-6 border-b border-[var(--cp-border-soft)] pb-6">
                <h2 className="font-display text-xl font-bold text-[var(--cp-text)]">Appearance</h2>
                <p className="text-[13px] text-[var(--cp-text-faint)] mt-1">Choose how the admin panel looks, or let it follow the sun.</p>
              </div>

              {/* Theme Mode */}
              <div className="flex flex-col gap-3 mb-8">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-text-muted)]">Theme Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MODE_OPTIONS.map((opt) => {
                    const isActive = mode === opt.id
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setMode(opt.id)}
                        className={`flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all ${
                          isActive
                            ? 'bg-[var(--cp-surface-strong)] border-[var(--cp-border)] text-[var(--cp-text)]'
                            : 'bg-[var(--cp-surface)] border-[var(--cp-border-soft)] text-[var(--cp-text-muted)] hover:text-[var(--cp-text-secondary)] hover:border-[var(--cp-border)]'
                        }`}
                      >
                        <opt.icon className={`w-5 h-5 ${isActive ? 'text-[var(--cp-cyan)]' : ''}`} />
                        <div>
                          <p className="text-[13px] font-bold">{opt.label}</p>
                          <p className="text-[11px] mt-0.5 opacity-70">{opt.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Auto Strategy — only relevant when mode is 'auto' */}
              {mode === 'auto' && (
                <div className="flex flex-col gap-3 mb-8">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-text-muted)]">Auto Strategy</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {STRATEGY_OPTIONS.map((opt) => {
                      const isActive = strategy === opt.id
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setStrategy(opt.id)}
                          className={`flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all ${
                            isActive
                              ? 'bg-[var(--cp-surface-strong)] border-[var(--cp-border)] text-[var(--cp-text)]'
                              : 'bg-[var(--cp-surface)] border-[var(--cp-border-soft)] text-[var(--cp-text-muted)] hover:text-[var(--cp-text-secondary)] hover:border-[var(--cp-border)]'
                          }`}
                        >
                          <opt.icon className={`w-5 h-5 ${isActive ? 'text-[var(--cp-cyan)]' : ''}`} />
                          <div>
                            <p className="text-[13px] font-bold">{opt.label}</p>
                            <p className="text-[11px] mt-0.5 opacity-70">{opt.desc}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {strategy === 'sunset' && (
                    <div className="flex items-start gap-3 p-4 rounded-xl mt-1" style={{ background: 'var(--cp-cyan-soft)', border: '1px solid var(--cp-cyan-border)' }}>
                      <MapPin className="w-4 h-4 text-[var(--cp-cyan)] shrink-0 mt-0.5" />
                      <p className="text-[12px] text-[var(--cp-text-secondary)] leading-relaxed">{GEOLOCATION_RATIONALE}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Current status */}
              <div className="p-5 rounded-2xl border border-[var(--cp-border-soft)] flex items-center justify-between gap-4 flex-wrap" style={{ background: 'var(--cp-surface-strong)' }}>
                <div className="flex items-center gap-3">
                  {resolved === 'dark' ? <Moon className="w-5 h-5 text-[var(--cp-cyan)]" /> : <Sun className="w-5 h-5 text-[var(--cp-cyan)]" />}
                  <div>
                    <p className="text-[13px] font-bold text-[var(--cp-text)]">Currently {resolved === 'dark' ? 'Dark' : 'Light'}</p>
                    <p className="text-[11px] text-[var(--cp-text-faint)] mt-0.5">{reason}</p>
                  </div>
                </div>
                {mode === 'auto' && strategy === 'sunset' && sunTimes && !Number.isNaN(sunTimes.sunrise.getTime()) && !Number.isNaN(sunTimes.sunset.getTime()) && (
                  <div className="flex items-center gap-4 text-[11px] text-[var(--cp-text-muted)]">
                    <span className="flex items-center gap-1.5"><Sunrise className="w-3.5 h-3.5" /> {formatTime(sunTimes.sunrise)}</span>
                    <span className="flex items-center gap-1.5"><Sunset className="w-3.5 h-3.5" /> {formatTime(sunTimes.sunset)}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Danger Confirmation Modal */}
      <Modal
        open={!!dangerAction}
        onClose={closeDanger}
        title={
          dangerAction === 'finance' ? 'Reset all finance' :
          dangerAction === 'projects' ? 'Reset all project data' :
          dangerAction === 'leads' ? 'Reset CRM' :
          dangerAction === 'factory' ? 'Factory reset agency' :
          ''
        }
        width="max-w-md"
      >
        {dangerAction && (() => {
          const requireType = dangerAction === 'factory'
          const expected = 'RESET'
          const matches = !requireType || dangerConfirmText.trim().toUpperCase() === expected
          const headline =
            dangerAction === 'finance' ? 'Delete every payment, invoice, expense, and subscription?' :
            dangerAction === 'projects' ? 'Wipe every per-project row across the agency?' :
            dangerAction === 'leads' ? 'Delete every inquiry, lead, and campaign?' :
            'Permanently wipe the entire agency database?'
          const body =
            dangerAction === 'finance'
              ? 'Affects every payment, expense, and subscription row. Clients, projects, and other data are untouched. This cannot be undone.'
              : dangerAction === 'projects'
              ? 'Clears payments, milestones, approvals, documents, meetings, feedback, gallery, deployments, activity, announcements, and team assignments — for every project. Projects themselves and clients stay. This cannot be undone.'
              : dangerAction === 'leads'
              ? 'Deletes every inquiry, lead, campaign, and marketing task. Clients are not touched. This cannot be undone.'
              : 'This will delete every client, every project, every payment, every document, every meeting, every lead, every inquiry, every campaign, every task, and every roadmap item. Admin users, agency settings, and team members survive. This cannot be undone.'
          const cta =
            dangerAction === 'finance' ? 'Reset finance' :
            dangerAction === 'projects' ? 'Reset project data' :
            dangerAction === 'leads' ? 'Reset CRM' :
            'Factory reset'

          return (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--cp-red-soft)', border: '1px solid var(--cp-red-border)' }}>
                {dangerAction === 'factory' ? <Skull className="w-6 h-6" style={{ color: 'var(--cp-red)' }} /> : <AlertTriangle className="w-6 h-6" style={{ color: 'var(--cp-red)' }} />}
              </div>
              <p className="text-[14px] font-semibold" style={{ color: 'var(--cp-text)' }}>{headline}</p>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--cp-text-muted)' }}>{body}</p>

              {requireType && (
                <div className="w-full text-left">
                  <label className="block text-[10px] font-mono uppercase tracking-[0.15em] mb-1.5" style={{ color: 'var(--cp-text-faint)' }}>
                    Type <span style={{ color: 'var(--cp-text)' }}>RESET</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={dangerConfirmText}
                    onChange={(e) => setDangerConfirmText(e.target.value)}
                    placeholder="RESET"
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
                  {dangerBusy ? 'Working…' : cta}
                </button>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
