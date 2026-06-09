'use client'
import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, Receipt, Wallet } from 'lucide-react'
import { motion } from 'framer-motion'
import { fetchInvoices, fetchRevenueAnalytics, insertInvoice } from '@/lib/db'
import Modal, { ModalInput } from '@/components/ui/Modal'

export default function FinanceHubPage() {
  const [mrrData, setMrrData] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formNumber, setFormNumber] = useState('')
  const [formClient, setFormClient] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const [revRes, invRes] = await Promise.all([fetchRevenueAnalytics(), fetchInvoices()])
      if (!revRes.error && revRes.data && revRes.data.length > 0) {
        setMrrData(revRes.data.map((r: any) => ({
          name: new Date(r.month).toLocaleDateString('en-US', { month: 'short' }),
          mrr: r.mrr,
          expenses: r.expenses,
        })))
      }
      if (!invRes.error && invRes.data) setInvoices(invRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const addInvoice = async () => {
    if (!formNumber || !formClient || !formAmount) return
    setSaving(true)
    const { data } = await insertInvoice({ invoice_number: formNumber, client_name: formClient, amount: Number(formAmount), status: 'Pending' })
    if (data) setInvoices([data, ...invoices])
    setFormNumber(''); setFormClient(''); setFormAmount(''); setSaving(false); setModalOpen(false)
  }

  const latestMrr = mrrData[mrrData.length - 1]?.mrr || 0
  const latestExpenses = mrrData[mrrData.length - 1]?.expenses || 0
  const netMargin = latestMrr > 0 ? ((latestMrr - latestExpenses) / latestMrr * 100).toFixed(1) : '0'

  const statusStyle = (s: string) => {
    if (s === 'Paid') return 'bg-emerald-500/[0.06] text-emerald-400 border-emerald-500/15'
    if (s === 'Overdue') return 'bg-red-500/[0.06] text-red-400 border-red-500/15'
    return 'bg-orange-500/[0.06] text-orange-400 border-orange-500/15'
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white/90">Finances</h1>
          <p className="text-white/25 text-[13px] mt-0.5">Revenue, expenses, and invoices.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#050505] font-semibold text-[12px] rounded-xl hover:bg-white/90 transition-all" style={{ boxShadow: '0 0 12px rgba(255,255,255,0.06)' }}>
          <Plus className="w-3.5 h-3.5" /> New Invoice
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'MRR', value: `₹${latestMrr.toLocaleString('en-IN')}` },
          { label: 'ARR', value: `₹${(latestMrr * 12).toLocaleString('en-IN')}` },
          { label: 'Expenses', value: `₹${latestExpenses.toLocaleString('en-IN')}` },
          { label: 'Margin', value: `${netMargin}%` },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20 mb-1">{kpi.label}</p>
            <p className="text-[22px] font-display font-bold tracking-tight text-white/85">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart + Invoices */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[13px] font-bold text-white/70">Revenue & Expenses</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] text-white/30"><div className="w-1.5 h-1.5 rounded-full bg-white/40" /> Revenue</div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/30"><div className="w-1.5 h-1.5 rounded-full bg-white/15" /> Expenses</div>
            </div>
          </div>
          {loading || mrrData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
              ) : (
                <div className="text-center">
                  <Wallet className="w-8 h-8 text-white/[0.05] mx-auto mb-2" />
                  <p className="text-[12px] text-white/20">No revenue data yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mrrData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(255,255,255,0.06)" stopOpacity={1} />
                      <stop offset="95%" stopColor="rgba(255,255,255,0)" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(255,255,255,0.02)" stopOpacity={1} />
                      <stop offset="95%" stopColor="rgba(255,255,255,0)" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.1)" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.1)" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} width={40} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(10,10,12,0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 12px' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontFamily: 'monospace' }}
                    itemStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}
                    formatter={(value: any, name: any) => [`₹${Number(value).toLocaleString('en-IN')}`, name === 'mrr' ? 'Revenue' : 'Expenses']}
                  />
                  <Area type="monotone" dataKey="mrr" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} fillOpacity={1} fill="url(#colorMrr)" dot={false} />
                  <Area type="monotone" dataKey="expenses" stroke="rgba(255,255,255,0.12)" strokeWidth={1} fillOpacity={1} fill="url(#colorExp)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Invoices */}
        <div className="xl:col-span-1 flex flex-col rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex justify-between items-center px-5 py-4 border-b border-white/[0.03]">
            <h3 className="text-[13px] font-bold text-white/70">Invoices</h3>
            <span className="text-[9px] font-mono text-white/20">{invoices.length} total</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {invoices.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10">
                <Receipt className="w-8 h-8 text-white/[0.05] mb-2" />
                <p className="text-[12px] text-white/20">No invoices yet.</p>
              </div>
            ) : invoices.map((inv) => (
              <div key={inv.id} className="p-3 rounded-xl transition-colors hover:bg-white/[0.015]" style={{ border: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.1em]">{inv.invoice_number || inv.id?.slice(0, 8)}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-[0.1em] border ${statusStyle(inv.status)}`}>{inv.status}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-[12px] font-medium text-white/70">{inv.client_name}</h4>
                    <span className="text-[10px] text-white/20">{inv.issued_date || '-'}</span>
                  </div>
                  <span className="text-[14px] font-mono font-bold text-white/60">₹{(inv.amount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Invoice" subtitle="Create a new invoice.">
        <div className="flex flex-col gap-4">
          <ModalInput label="Invoice Number" value={formNumber} onChange={setFormNumber} placeholder="INV-001" required />
          <ModalInput label="Client Name" value={formClient} onChange={setFormClient} placeholder="Acme Corp" required />
          <ModalInput label="Amount (₹)" value={formAmount} onChange={setFormAmount} placeholder="50000" type="number" required />
          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.04]">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-white/30 hover:text-white/60 transition-colors">Cancel</button>
            <button onClick={addInvoice} disabled={saving || !formNumber || !formClient || !formAmount} className="px-5 py-2 bg-white text-[#050505] font-semibold text-[12px] rounded-xl hover:bg-white/90 transition-all disabled:opacity-30">
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
