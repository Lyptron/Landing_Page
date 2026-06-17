'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, ShieldCheck, Users2, Check, X as XIcon } from 'lucide-react'
import { fetchAdminUsers, insertAdminUser, updateAdminUserRole, deleteAdminUser } from '@/lib/db'
import { ROLE_ROUTE_MAP, AdminRole } from '@/lib/adminRoles'
import { useAdminAuth } from '@/lib/AdminAuthContext'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'

const ROLES: { value: AdminRole; label: string }[] = [
  { value: 'founder', label: 'Founder' },
  { value: 'admin', label: 'Admin / CRM' },
  { value: 'marketing', label: 'Marketing' },
]

const emptyForm = { email: '', role: 'admin' }
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function PermissionsPage() {
  const { user } = useAdminAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; email: string } | null>(null)

  useEffect(() => {
    async function load() {
      const { data, error } = await fetchAdminUsers()
      if (!error && data) setUsers(data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleInvite() {
    setInviteError(null)
    const email = form.email.toLowerCase().trim()
    if (!email) return
    if (!EMAIL_REGEX.test(email)) {
      setInviteError('Please enter a valid email address.')
      return
    }
    setSaving(true)
    const { data, error } = await insertAdminUser({ email, role: form.role })
    if (error) {
      setSaving(false)
      setInviteError(error.message)
      return
    }
    if (data) setUsers([...users, data])
    setForm(emptyForm)
    setSaving(false)
    setModalOpen(false)
  }

  async function handleRoleChange(id: string, role: string) {
    const snapshot = users
    setUsers(users.map(u => u.id === id ? { ...u, role } : u))
    const { error } = await updateAdminUserRole(id, role)
    if (error) setUsers(snapshot)
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    const id = pendingDelete.id
    const snapshot = users
    setUsers(users.filter(u => u.id !== id))
    setPendingDelete(null)
    const { error } = await deleteAdminUser(id)
    if (error) setUsers(snapshot)
  }

  const counts = ROLES.map(r => ({ ...r, count: users.filter(u => u.role === r.value).length }))

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--cp-text)' }}>Permissions</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--cp-text-faint)' }}>Manage admin access and review role-based route permissions.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="cp-btn-primary flex items-center gap-1.5 px-4 py-2 text-[12px]">
          <Plus className="w-3.5 h-3.5" /> Invite Admin
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {counts.map((c, i) => (
          <motion.div
            key={c.value}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="cp-card p-4 flex items-start justify-between"
          >
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: 'var(--cp-text-faint)' }}>{c.label}</p>
              <p className="text-[22px] font-display font-bold tracking-tight" style={{ color: 'var(--cp-text)' }}>{c.count}</p>
            </div>
            <Users2 className="w-5 h-5 opacity-50" style={{ color: 'var(--cp-text-muted)' }} />
          </motion.div>
        ))}
      </div>

      {/* Admin Users table */}
      <div className="cp-card overflow-hidden mb-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-[var(--cp-border)] border-t-[var(--cp-text-muted)] rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <Users2 className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--cp-text-faint)' }} />
            <p className="text-[13px]" style={{ color: 'var(--cp-text-muted)' }}>No admin users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--cp-border-soft)' }}>
                  {['Email', 'Role', 'Added', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-[9px] font-mono uppercase tracking-[0.15em] whitespace-nowrap" style={{ color: 'var(--cp-text-faint)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-[var(--cp-bg-soft)] transition-colors group" style={{ borderColor: 'var(--cp-border-soft)' }}>
                    <td className="px-4 py-3 text-[13px] whitespace-nowrap" style={{ color: 'var(--cp-text)' }}>{u.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={u.email === user?.email}
                        className="px-3 py-1.5 rounded-lg text-[12px] outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed [&>option]:bg-[var(--cp-bg-elevated)] [&>option]:text-[var(--cp-text)]"
                        style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-secondary)' }}
                      >
                        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-[12px] font-mono whitespace-nowrap" style={{ color: 'var(--cp-text-muted)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => setPendingDelete({ id: u.id, email: u.email })}
                        disabled={u.email === user?.email}
                        aria-label={`Revoke admin access for ${u.email}`}
                        className="p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0 text-[var(--cp-text-faint)] hover:text-[var(--cp-red)] hover:bg-[var(--cp-red-soft)]"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permission Matrix */}
      <div className="mb-2 flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--cp-text-faint)' }} />
        <h3 className="text-[11px] font-mono uppercase tracking-[0.15em]" style={{ color: 'var(--cp-text-muted)' }}>Route Permission Matrix</h3>
      </div>
      <div className="cp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--cp-border-soft)' }}>
                <th className="px-4 py-3 text-[9px] font-mono uppercase tracking-[0.15em] whitespace-nowrap" style={{ color: 'var(--cp-text-faint)' }}>Route</th>
                {ROLES.map(r => (
                  <th key={r.value} className="px-4 py-3 text-[9px] font-mono uppercase tracking-[0.15em] whitespace-nowrap text-center" style={{ color: 'var(--cp-text-faint)' }}>{r.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(ROLE_ROUTE_MAP).map(([route, roles]) => (
                <tr key={route} className="border-b hover:bg-[var(--cp-bg-soft)] transition-colors" style={{ borderColor: 'var(--cp-border-soft)' }}>
                  <td className="px-4 py-3 text-[12px] font-mono whitespace-nowrap" style={{ color: 'var(--cp-text-secondary)' }}>{route}</td>
                  {ROLES.map(r => (
                    <td key={r.value} className="px-4 py-3 text-center">
                      {roles.includes(r.value) ? (
                        <Check className="w-3.5 h-3.5 inline-block" style={{ color: 'var(--cp-emerald)' }} />
                      ) : (
                        <XIcon className="w-3.5 h-3.5 inline-block" style={{ color: 'var(--cp-text-faint)' }} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Admin Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setInviteError(null) }} title="Invite Admin" subtitle="Grant dashboard access to a new team member.">
        <div className="flex flex-col gap-4">
          <ModalInput label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="name@lyptron.com" type="email" required />
          <ModalSelect label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={ROLES} />
          {inviteError && <p role="alert" className="text-[12px]" style={{ color: 'var(--cp-red)' }}>{inviteError}</p>}
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button type="button" onClick={() => { setModalOpen(false); setInviteError(null) }} className="px-4 py-2 rounded-xl text-[12px] font-medium transition-colors text-[var(--cp-text-muted)] hover:text-[var(--cp-text)]">Cancel</button>
            <button type="button" onClick={handleInvite} disabled={saving || !form.email} className="cp-btn-primary px-5 py-2 text-[12px]">
              {saving ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Revoke confirmation modal — replaces the blocking native confirm() */}
      <Modal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="Revoke admin access"
        subtitle={pendingDelete ? `Remove ${pendingDelete.email} from the admin team.` : undefined}
      >
        <div className="flex flex-col gap-4">
          <p className="text-[13px]" style={{ color: 'var(--cp-text-muted)' }}>
            They will lose dashboard access immediately. Their auth account is not deleted.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button type="button" onClick={() => setPendingDelete(null)} className="px-4 py-2 rounded-xl text-[12px] font-medium transition-colors text-[var(--cp-text-muted)] hover:text-[var(--cp-text)]">Cancel</button>
            <button type="button" onClick={confirmDelete} className="cp-btn-primary px-5 py-2 text-[12px]" style={{ background: 'var(--cp-red)' }}>
              Revoke access
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
