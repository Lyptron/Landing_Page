'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, TrendingUp, Mail, Phone, Handshake } from 'lucide-react'
import { fetchLeads, insertLead, updateLead } from '@/lib/db'
import Modal, { ModalInput, ModalSelect } from '@/components/ui/Modal'

const STAGES = ['New Lead', 'Discovery Call', 'Proposal Sent', 'Negotiation', 'Won']

function timeAgo(date: string | null) {
  if (!date) return '-'
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function CRMPipelinePage() {
  const [leads, setLeads] = useState<any[]>([])
  const [draggedLead, setDraggedLead] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formCompany, setFormCompany] = useState('')
  const [formContact, setFormContact] = useState('')
  const [formValue, setFormValue] = useState('')
  const [formSource, setFormSource] = useState('Inbound')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await fetchLeads()
      if (!error && data) setLeads(data.map((l: any) => ({ ...l, last_contact: timeAgo(l.last_contact) })))
      setLoading(false)
    }
    load()
  }, [])

  const handleDragStart = (e: React.DragEvent, id: string) => { setDraggedLead(id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setDragImage(e.currentTarget as Element, 20, 20) }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }

  const handleDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault()
    if (!draggedLead) return
    setLeads(leads.map(l => l.id === draggedLead ? { ...l, stage } : l))
    setDraggedLead(null)
    await updateLead(draggedLead, { stage })
  }

  const addLead = async () => {
    if (!formCompany || !formContact) return
    setSaving(true)
    const { data } = await insertLead({ company: formCompany, contact: formContact, value: Number(formValue) || 0, stage: 'New Lead', probability: 20, source: formSource as any })
    if (data) setLeads([{ ...data, last_contact: 'now' }, ...leads])
    setFormCompany(''); setFormContact(''); setFormValue(''); setFormSource('Inbound'); setSaving(false); setModalOpen(false)
  }

  const totalPipeline = leads.reduce((acc, l) => acc + (l.value || 0), 0)

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white/90">Sales Pipeline</h1>
          <p className="text-white/25 text-[13px] mt-0.5">
            Pipeline: <span className="text-white/50 font-mono">₹{totalPipeline.toLocaleString('en-IN')}</span> across <span className="text-white/50 font-mono">{leads.length}</span> leads.
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#050505] font-semibold text-[12px] rounded-xl hover:bg-white/90 transition-all" style={{ boxShadow: '0 0 12px rgba(255,255,255,0.06)' }}>
          <Plus className="w-3.5 h-3.5" /> New Lead
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 flex gap-4">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter(l => l.stage === stage)
            const stageValue = stageLeads.reduce((acc, l) => acc + (l.value || 0), 0)
            return (
              <div key={stage} className="flex flex-col w-[270px] shrink-0 rounded-2xl max-h-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage)}>
                <div className="px-4 py-3 border-b border-white/[0.03]">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[12px] font-bold text-white/60">{stage}</h3>
                      <span className="text-[9px] font-mono bg-white/[0.06] text-white/30 px-1.5 py-0.5 rounded-md">{stageLeads.length}</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-white/20 mt-0.5">₹{stageValue.toLocaleString('en-IN')}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2.5">
                  {stageLeads.map((lead) => (
                    <motion.div
                      layoutId={lead.id}
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, lead.id)}
                      className="p-3.5 rounded-xl cursor-grab active:cursor-grabbing transition-all group relative overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                      whileHover={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    >
                      {/* Probability bar */}
                      <div className="absolute top-0 left-0 h-[2px]" style={{ width: `${lead.probability}%`, background: 'linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.04))' }} />

                      <h4 className="text-[13px] font-bold text-white/85 mb-0.5 mt-1">{lead.company}</h4>
                      <p className="text-[10px] text-white/30 mb-3">{lead.contact}</p>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[12px] font-mono text-white/50 px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          ₹{((lead.value || 0) / 1000).toFixed(0)}k
                        </span>
                        <span className="flex items-center gap-1 text-[9px] font-mono text-white/25 px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <TrendingUp className="w-3 h-3" /> {lead.probability}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.03]">
                        <div className="flex items-center gap-1.5">
                          <button className="w-5 h-5 rounded flex items-center justify-center text-white/20 hover:text-blue-400 hover:bg-white/[0.03] transition-colors"><Mail className="w-3 h-3" /></button>
                          <button className="w-5 h-5 rounded flex items-center justify-center text-white/20 hover:text-emerald-400 hover:bg-white/[0.03] transition-colors"><Phone className="w-3 h-3" /></button>
                        </div>
                        <span className="text-[9px] font-mono text-white/20">{lead.last_contact}</span>
                      </div>
                    </motion.div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="flex-1 min-h-[80px] border border-dashed border-white/[0.04] rounded-xl flex items-center justify-center">
                      <span className="text-[10px] text-white/15">Drop here</span>
                    </div>
                  )}
                </div>

                <div className="px-2.5 py-2 border-t border-white/[0.03]">
                  <button onClick={() => setModalOpen(true)} className="w-full py-1.5 flex items-center justify-center gap-1.5 text-[10px] text-white/20 hover:text-white/50 hover:bg-white/[0.02] rounded-lg transition-colors">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Lead" subtitle="Add a new lead to your pipeline.">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Company" value={formCompany} onChange={setFormCompany} placeholder="Acme Corp" required />
            <ModalInput label="Contact Person" value={formContact} onChange={setFormContact} placeholder="John Doe" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalInput label="Deal Value (₹)" value={formValue} onChange={setFormValue} placeholder="100000" type="number" />
            <ModalSelect label="Source" value={formSource} onChange={setFormSource} options={[{ value: 'Inbound', label: 'Inbound' }, { value: 'Referral', label: 'Referral' }, { value: 'Website', label: 'Website' }, { value: 'LinkedIn', label: 'LinkedIn' }]} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.04]">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-white/30 hover:text-white/60 transition-colors">Cancel</button>
            <button onClick={addLead} disabled={saving || !formCompany || !formContact} className="px-5 py-2 bg-white text-[#050505] font-semibold text-[12px] rounded-xl hover:bg-white/90 transition-all disabled:opacity-30">
              {saving ? 'Adding...' : 'Add Lead'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
