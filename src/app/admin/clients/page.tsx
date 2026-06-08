'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Mail, Phone, MapPin, Globe, Briefcase, X, Users2 } from 'lucide-react'
import { fetchClients, insertClient } from '@/lib/db'
import Modal, { ModalInput } from '@/components/ui/Modal'

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
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

  useEffect(() => {
    async function load() {
      const { data, error } = await fetchClients()
      if (!error && data) setClients(data)
      setLoading(false)
    }
    load()
  }, [])

  const addClient = async () => {
    if (!formCompany || !formContact || !formEmail) return
    setSaving(true)
    const { data } = await insertClient({ company: formCompany, contact: formContact, email: formEmail, phone: formPhone || undefined, industry: formIndustry || undefined, location: formLocation || undefined, website: formWebsite || undefined })
    if (data) setClients([data, ...clients])
    setFormCompany(''); setFormContact(''); setFormEmail(''); setFormPhone(''); setFormIndustry(''); setFormLocation(''); setFormWebsite('')
    setSaving(false); setModalOpen(false)
  }

  const statusStyle = (s: string) => {
    if (s === 'Active') return 'bg-emerald-500/[0.06] text-emerald-400 border-emerald-500/15'
    if (s === 'Onboarding') return 'bg-blue-500/[0.06] text-blue-400 border-blue-500/15'
    return 'bg-white/[0.03] text-white/25 border-white/[0.05]'
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white/90">Clients</h1>
          <p className="text-white/25 text-[13px] mt-0.5">Manage all agency clients and contracts.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#050505] font-semibold text-[12px] rounded-xl hover:bg-white/90 transition-all" style={{ boxShadow: '0 0 12px rgba(255,255,255,0.06)' }}>
          <Plus className="w-3.5 h-3.5" /> New Client
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Users2 className="w-10 h-10 text-white/[0.05] mb-3" />
          <h3 className="text-white/50 font-bold mb-1">No clients yet</h3>
          <p className="text-white/20 text-[13px] mb-4">Add your first client to get started.</p>
          <button onClick={() => setModalOpen(true)} className="px-5 py-2 bg-white text-black font-semibold text-[12px] rounded-xl">Add Client</button>
        </div>
      ) : (
        <div className={`flex-1 overflow-hidden flex gap-0 transition-all duration-300 ${selectedClient ? 'pr-[360px]' : ''}`}>
          {/* Table */}
          <div className="flex-1 rounded-2xl overflow-hidden flex flex-col" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-white/[0.03] text-[9px] font-mono uppercase tracking-[0.15em] text-white/20">
              <div className="col-span-3">Company</div>
              <div className="col-span-2">Contact</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Value</div>
              <div className="col-span-3">Industry</div>
            </div>
            {/* Rows */}
            <div className="flex-1 overflow-y-auto">
              {clients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`grid grid-cols-12 gap-3 px-4 py-3 items-center cursor-pointer border-b border-white/[0.02] transition-colors ${selectedClient?.id === client.id ? 'bg-white/[0.03]' : 'hover:bg-white/[0.015]'}`}
                >
                  <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-[11px] font-bold text-white/70">{client.company?.charAt(0)}</span>
                    </div>
                    <span className="text-[13px] font-medium text-white/80 truncate">{client.company}</span>
                  </div>
                  <div className="col-span-2 flex flex-col min-w-0">
                    <span className="text-[12px] text-white/60 truncate">{client.contact}</span>
                    <span className="text-[10px] text-white/20 truncate">{client.email}</span>
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-[0.1em] border ${statusStyle(client.status)}`}>{client.status || 'New'}</span>
                  </div>
                  <div className="col-span-2 text-[13px] font-mono text-white/50">
                    {client.contract_value ? `₹${client.contract_value.toLocaleString('en-IN')}` : '-'}
                  </div>
                  <div className="col-span-3 text-[12px] text-white/30 truncate">{client.industry || '-'}</div>
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
            style={{ background: 'rgba(8,8,10,0.97)', borderLeft: '1px solid rgba(255,255,255,0.04)' }}
          >
            {/* Slide-out Header */}
            <div className="p-5 border-b border-white/[0.04] flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="font-display font-bold text-white text-lg">{selectedClient.company?.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-white/90">{selectedClient.company}</h2>
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-[0.1em] border mt-0.5 ${statusStyle(selectedClient.status)}`}>{selectedClient.status || 'New'}</span>
                </div>
              </div>
              <button onClick={() => setSelectedClient(null)} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slide-out Body */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20 mb-3">Contact</p>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5 text-[12px]">
                    <Briefcase className="w-3.5 h-3.5 text-white/20 shrink-0" />
                    <span className="text-white/60">{selectedClient.contact}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[12px]">
                    <Mail className="w-3.5 h-3.5 text-white/20 shrink-0" />
                    <span className="text-blue-400/70">{selectedClient.email}</span>
                  </div>
                  {selectedClient.phone && <div className="flex items-center gap-2.5 text-[12px]"><Phone className="w-3.5 h-3.5 text-white/20 shrink-0" /><span className="text-white/60">{selectedClient.phone}</span></div>}
                  {selectedClient.location && <div className="flex items-center gap-2.5 text-[12px]"><MapPin className="w-3.5 h-3.5 text-white/20 shrink-0" /><span className="text-white/60">{selectedClient.location}</span></div>}
                  {selectedClient.website && <div className="flex items-center gap-2.5 text-[12px]"><Globe className="w-3.5 h-3.5 text-white/20 shrink-0" /><span className="text-blue-400/70">{selectedClient.website}</span></div>}
                </div>
              </div>

              <div className="h-px bg-white/[0.03]" />

              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20 mb-3">Financials</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <p className="text-[9px] text-white/20 uppercase tracking-wider mb-1">Contract Value</p>
                    <p className="text-[16px] font-mono font-bold text-white/80">₹{(selectedClient.contract_value || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <p className="text-[9px] text-white/20 uppercase tracking-wider mb-1">Renewal</p>
                    <p className="text-[13px] font-medium text-white/60">{selectedClient.renewal_date || '-'}</p>
                  </div>
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
          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.04]">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-white/30 hover:text-white/60 transition-colors">Cancel</button>
            <button onClick={addClient} disabled={saving || !formCompany || !formContact || !formEmail} className="px-5 py-2 bg-white text-[#050505] font-semibold text-[12px] rounded-xl hover:bg-white/90 transition-all disabled:opacity-30">
              {saving ? 'Adding...' : 'Add Client'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
