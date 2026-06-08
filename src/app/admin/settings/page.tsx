'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Building2,
  Bell,
  Shield,
  Blocks,
  CreditCard,
  CheckCircle2,
  Lock,
  Key,
  Copy,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  Settings2
} from 'lucide-react'
import { useAdminAuth } from '@/lib/AdminAuthContext'
import { fetchAllProjectsWithCodes, generateAccessCode, removeAccessCode, updateProject, uploadLogo, fetchAgencySettings, upsertAgencySettings } from '@/lib/db'

const TABS = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'access-codes', label: 'Client Codes', icon: Key },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'integrations', label: 'Integrations', icon: Blocks },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
]

function generateRandomCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export default function SettingsPage() {
  const { user } = useAdminAuth()
  const [activeTab, setActiveTab] = useState('general')
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

  useEffect(() => {
    // Load agency settings on mount
    async function loadSettings() {
      const { data } = await fetchAgencySettings()
      if (data) {
        if (data.name) setAgencyName(data.name)
        if (data.email) setAgencyEmail(data.email)
        if (data.website) setAgencyWebsite(data.website)
        if (data.logo_url) setLogoUrl(data.logo_url)
      }
    }
    loadSettings()
  }, [])

  useEffect(() => {
    if (activeTab === 'access-codes') loadProjects()
  }, [activeTab])

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    const { data: url, error } = await uploadLogo(file)
    if (url) {
      setLogoUrl(url)
      await upsertAgencySettings({ logo_url: url })
    }
    setLogoUploading(false)
  }

  async function handleSaveGeneral() {
    setSavingGeneral(true)
    await upsertAgencySettings({ name: agencyName, email: agencyEmail, website: agencyWebsite, logo_url: logoUrl })
    setSavingGeneral(false)
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
        <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/50 bg-clip-text text-transparent tracking-tight mb-1">Settings</h1>
        <p className="text-white/30 text-[13px]">Manage your agency preferences, client access codes, and integrations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-white/[0.06] text-white border border-white/[0.06]'
                    : 'text-white/30 hover:bg-white/[0.03] border border-transparent'
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
                <div className="mb-6 border-b border-white/[0.06] pb-6">
                  <h2 className="font-display text-xl font-bold text-white/90">Agency Profile</h2>
                  <p className="text-[13px] text-white/30 mt-1">This is your agency&apos;s primary identity across the platform.</p>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-fuchsia-500/20 border border-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Agency Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <span className="font-display font-bold text-3xl text-white">L</span>
                      )}
                    </div>
                    <div>
                      <label className="px-4 py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg text-[13px] text-white transition-colors mb-2 cursor-pointer inline-block">
                        {logoUploading ? 'Uploading...' : 'Upload Logo'}
                        <input
                          type="file"
                          accept="image/svg+xml,image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={logoUploading}
                        />
                      </label>
                      <p className="text-[11px] text-white/30 mt-2">SVG, PNG, JPG, or WebP (max. 800x400px)</p>
                      {logoUrl && (
                        <button onClick={() => { setLogoUrl(null) }} className="text-[11px] text-red-400/60 hover:text-red-400 mt-1 transition-colors">
                          Remove logo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Agency Name</label>
                      <input
                        type="text"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        className="px-4 py-2.5 bg-[rgba(5,5,5,0.6)] border border-white/[0.06] rounded-lg text-[13px] text-white focus:outline-none focus:border-white/[0.12] transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Contact Email</label>
                      <input
                        type="email"
                        value={agencyEmail}
                        onChange={(e) => setAgencyEmail(e.target.value)}
                        className="px-4 py-2.5 bg-[rgba(5,5,5,0.6)] border border-white/[0.06] rounded-lg text-[13px] text-white focus:outline-none focus:border-white/[0.12] transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Website</label>
                      <input
                        type="text"
                        value={agencyWebsite}
                        onChange={(e) => setAgencyWebsite(e.target.value)}
                        className="px-4 py-2.5 bg-[rgba(5,5,5,0.6)] border border-white/[0.06] rounded-lg text-[13px] text-white focus:outline-none focus:border-white/[0.12] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/[0.06] flex justify-end">
                  <button
                    onClick={handleSaveGeneral}
                    disabled={savingGeneral}
                    className="px-6 py-2.5 bg-white text-[#050505] font-semibold text-[13px] rounded-full hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50"
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
                <div className="mb-6 border-b border-white/[0.06] pb-6 flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-white/90">Client Access Codes</h2>
                    <p className="text-[13px] text-white/30 mt-1">Generate, manage, and revoke access codes for client portals. Clients use these to log into their dashboard.</p>
                  </div>
                  <button onClick={loadProjects} className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all" title="Refresh">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {projects.length === 0 && !loading ? (
                  <div className="text-center py-12">
                    <Key className="w-8 h-8 text-white/15 mx-auto mb-3" />
                    <p className="text-white/30 text-[13px]">No projects found. Create a project first from the Projects page.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="p-5 rounded-2xl border border-white/[0.04] hover:border-white/[0.08] transition-all"
                        style={{ background: 'rgba(255,255,255,0.015)' }}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="font-bold text-white/85 text-[15px]">{project.name}</h3>
                            <p className="text-[11px] text-white/25 font-mono mt-0.5">{project.client_email || 'No client email'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                              project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              project.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              'bg-white/[0.04] text-white/30 border border-white/[0.06]'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                        </div>

                        {project.access_code ? (
                          <div className="flex items-center gap-3 mt-4">
                            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)' }}>
                              <Key className="w-4 h-4 text-blue-400/60 shrink-0" />
                              <span className="font-mono text-[15px] font-bold text-blue-400 tracking-[0.2em]">{project.access_code}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(project.access_code, project.id)}
                              className="p-3 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all"
                              title="Copy code"
                            >
                              {copiedId === project.id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/client`, project.id + '-url')}
                              className="p-3 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all"
                              title="Copy portal URL"
                            >
                              {copiedId === project.id + '-url' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ExternalLink className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleRemoveCode(project.id)}
                              className="p-3 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/[0.04] transition-all"
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
                              className="flex-1 px-4 py-3 rounded-xl text-[13px] text-white/80 font-mono tracking-widest outline-none"
                              style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.08)' }}
                              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleGenerateCode(project.id)}
                              className="px-5 py-3 bg-white text-[#050505] font-semibold text-[12px] rounded-xl transition-all hover:bg-white/90"
                              style={{ boxShadow: '0 0 15px rgba(255,255,255,0.08)' }}
                            >
                              Generate
                            </button>
                            <button
                              onClick={() => { setNewCodeProject(null); setCustomCode('') }}
                              className="p-3 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                            >
                              &times;
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setNewCodeProject(project.id)}
                            className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl text-[12px] font-semibold text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all border border-dashed border-white/[0.08]"
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
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                    <Settings2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white/80 text-[14px] mb-1">How Client Codes Work</h3>
                    <p className="text-[12px] text-white/30 leading-relaxed">
                      Each project can have a unique access code. Share the code with your client — they enter it at <span className="font-mono text-blue-400/60">/client</span> to access their project dashboard. You can revoke or regenerate codes anytime. Everything the client sees is pulled from your Supabase data in real-time.
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
                <div className="mb-6 border-b border-white/[0.06] pb-6">
                  <h2 className="font-display text-xl font-bold text-white/90">My Profile</h2>
                  <p className="text-[13px] text-white/30 mt-1">Your admin account details.</p>
                </div>

                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-2xl p-[2px]" style={{ background: 'linear-gradient(135deg, rgba(29,126,245,0.6), rgba(139,92,246,0.6))' }}>
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#0a0a0c] rounded-2xl flex items-center justify-center">
                        <span className="text-2xl font-bold text-white/80">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white/90">{user?.name || 'Admin'}</h3>
                    <p className="text-[13px] text-white/30">{user?.email}</p>
                    <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-emerald-400/60 mt-1">Authenticated</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Display Name</label>
                    <input
                      type="text"
                      defaultValue={user?.name || ''}
                      className="px-4 py-2.5 bg-[rgba(5,5,5,0.6)] border border-white/[0.06] rounded-lg text-[13px] text-white focus:outline-none focus:border-white/[0.12] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      disabled
                      className="px-4 py-2.5 bg-[rgba(5,5,5,0.6)] border border-white/[0.06] rounded-lg text-[13px] text-white/40 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/[0.06] flex justify-end">
                  <button className="px-6 py-2.5 bg-white text-[#050505] font-semibold text-[13px] rounded-full hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                    Update Profile
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
                <div className="mb-6 border-b border-white/[0.06] pb-6">
                  <h2 className="font-display text-xl font-bold text-white/90">Installed Integrations</h2>
                  <p className="text-[13px] text-white/30 mt-1">Connect your agency&apos;s tools to automate your workflow.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Supabase — Connected */}
                  <div className="flex items-center justify-between p-4 bg-white/[0.015] border border-white/[0.03] rounded-xl hover:border-white/[0.08] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#3ECF8E] text-white rounded-lg flex items-center justify-center shrink-0 font-bold text-lg">
                        S
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-white/90 flex items-center gap-2">
                          Supabase <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        </h4>
                        <p className="text-[11px] text-white/30">Database & Auth connected</p>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 bg-emerald-500/[0.06] border border-emerald-500/15 text-emerald-400 text-[9px] font-bold font-mono uppercase tracking-[0.15em] rounded-full">Active</span>
                  </div>

                  {/* Google — Connected if using Google auth */}
                  <div className="flex items-center justify-between p-4 bg-white/[0.015] border border-white/[0.03] rounded-xl hover:border-white/[0.08] transition-colors">
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
                        <h4 className="text-[13px] font-bold text-white/90 flex items-center gap-2">
                          Google OAuth {user?.avatar_url && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        </h4>
                        <p className="text-[11px] text-white/30">{user?.avatar_url ? 'Sign-in with Google enabled' : 'Enable Google sign-in for admins'}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-[0.15em] ${user?.avatar_url ? 'bg-emerald-500/[0.06] border border-emerald-500/15 text-emerald-400' : 'bg-white/[0.04] border border-white/[0.06] text-white/30'}`}>
                      {user?.avatar_url ? 'Active' : 'Available'}
                    </span>
                  </div>

                  {/* GitHub */}
                  <div className="flex items-center justify-between p-4 bg-white/[0.015] border border-white/[0.03] rounded-xl hover:border-white/[0.08] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 9 18v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-white/90">GitHub</h4>
                        <p className="text-[11px] text-white/30">Connect for commit tracking</p>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 bg-white text-[#050505] font-semibold rounded-full text-[11px] transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                      Connect
                    </button>
                  </div>

                  {/* Stripe */}
                  <div className="flex items-center justify-between p-4 bg-white/[0.015] border border-white/[0.03] rounded-xl hover:border-white/[0.08] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#635BFF] text-white rounded-lg flex items-center justify-center shrink-0 font-bold text-lg">
                        S
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-white/90">Stripe</h4>
                        <p className="text-[11px] text-white/30">Sync invoices and payments</p>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 bg-white text-[#050505] font-semibold rounded-full text-[11px] transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                      Connect
                    </button>
                  </div>
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
              <div className="mb-6 border-b border-white/[0.06] pb-6">
                <h2 className="font-display text-xl font-bold text-white/90">Notification Preferences</h2>
                <p className="text-[13px] text-white/30 mt-1">Choose what notifications you want to receive.</p>
              </div>

              <div className="flex flex-col gap-5">
                {[
                  { label: 'New client inquiry', desc: 'When someone submits the contact form', default: true },
                  { label: 'Client feedback submitted', desc: 'When a client sends feedback via portal', default: true },
                  { label: 'Payment received', desc: 'When a client makes a payment', default: true },
                  { label: 'Approval requested', desc: 'When a client approves or rejects a deliverable', default: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 bg-white/[0.015] border border-white/[0.03] rounded-xl">
                    <div>
                      <h4 className="text-[13px] font-medium text-white/80">{item.label}</h4>
                      <p className="text-[11px] text-white/25 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                      <div className="w-10 h-5 bg-white/[0.06] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500/30 peer-checked:after:bg-blue-400" />
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06] flex justify-end">
                <button className="px-6 py-2.5 bg-white text-[#050505] font-semibold text-[13px] rounded-full hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                  Save Preferences
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
              <div className="mb-6 border-b border-white/[0.06] pb-6">
                <h2 className="font-display text-xl font-bold text-white/90">Security</h2>
                <p className="text-[13px] text-white/30 mt-1">Manage your authentication and security settings.</p>
              </div>

              <div className="flex flex-col gap-6">
                <div className="p-5 rounded-2xl border border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.015)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-[14px] font-bold text-white/85">Authentication Method</h4>
                      <p className="text-[12px] text-white/30 mt-0.5">How you sign in to the admin panel</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/[0.06] border border-emerald-500/15">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 text-[9px] font-bold font-mono uppercase tracking-[0.15em]">Active</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-white/50">
                    Signed in as <span className="font-mono text-blue-400/70">{user?.email}</span>
                    {user?.avatar_url ? ' via Google OAuth' : ' via email/password'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.015)' }}>
                  <h4 className="text-[14px] font-bold text-white/85 mb-2">Row Level Security</h4>
                  <p className="text-[12px] text-white/30 leading-relaxed">
                    RLS is enabled on all tables with permissive policies. For production, tighten these policies in your Supabase dashboard to restrict access based on authenticated users.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
