'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { insertPayment, updatePayment, deletePayment } from '@/lib/db'
import Modal from '@/components/ui/Modal'
import SalaryStepper from '@/components/ui/SalaryStepper'
import { useProject } from '@/lib/AdminProjectContext'

export default function ProjectFinancePage() {
  const { projectId, payments, setPayments } = useProject()
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formAmount, setFormAmount] = useState('')

  async function handleAdd() {
    if (!formAmount) return
    setSaving(true)
    const { data } = await insertPayment({ amount: Number(formAmount), status: 'pending', project_id: projectId })
    if (data) setPayments(prev => [...prev, data])
    setFormAmount('')
    setSaving(false)
    setModalOpen(false)
  }

  async function toggleStatus(p: any) {
    const ns = p.status === 'paid' ? 'pending' : 'paid'
    setPayments(payments.map(x => x.id === p.id ? { ...x, status: ns } : x))
    await updatePayment(p.id, { status: ns })
  }

  return (
    <div className="cp-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold text-(--cp-text-secondary)">Payment Milestones</h3>
        <span className="text-[10px] font-mono text-(--cp-text-faint)">{payments.length} total</span>
      </div>
      <div className="flex flex-col gap-2">
        {payments.map(p => (
          <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-(--cp-bg-soft) border border-(--cp-border-soft)">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleStatus(p)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-colors cursor-pointer ${
                  p.status === 'paid'
                    ? 'bg-(--cp-emerald-soft) border-(--cp-emerald-border) text-(--cp-emerald)'
                    : 'bg-(--cp-amber-soft) border-(--cp-amber-border) text-(--cp-amber)'
                }`}
              >
                {p.status}
              </button>
              <span className="text-[14px] font-mono font-semibold text-(--cp-text)">₹{(p.amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <button onClick={async () => { await deletePayment(p.id); setPayments(payments.filter(x => x.id !== p.id)) }} className="p-1.5 text-(--cp-text-faint) hover:text-(--cp-red) transition-colors cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 p-3 rounded-xl text-[11px] text-(--cp-text-faint) hover:text-(--cp-text-muted) hover:bg-(--cp-bg-soft) transition-colors border border-dashed border-(--cp-border) cursor-pointer justify-center">
          <Plus className="w-3.5 h-3.5" /> Add Payment Milestone
        </button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Payment">
        <div className="flex flex-col gap-4">
          <SalaryStepper label="Amount (₹)" value={formAmount} onChange={setFormAmount} placeholder="50000" required />
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-(--cp-text-muted) hover:text-(--cp-text)">Cancel</button>
            <button onClick={handleAdd} disabled={saving || !formAmount} className="cp-btn-primary px-5 py-2 text-[12px] cursor-pointer">
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
