'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CreditCard, DollarSign, ArrowUpRight, Receipt, CheckCircle2, Wallet } from 'lucide-react'
import { fetchProjectByAccessCode } from '@/lib/db'

export default function FinancePage() {
  const params = useParams()
  const code = params.code as string
  const [invoices, setInvoices] = useState<any[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [paidAmount, setPaidAmount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: project } = await fetchProjectByAccessCode(code)
      if (project && project.payments && project.payments.length > 0) {
        const payments = project.payments
        setInvoices(payments)
        const total = payments.reduce((s: number, p: any) => s + (p.amount || 0), 0)
        const paid = payments.filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + (p.amount || 0), 0)
        setTotalValue(project.contract_value || total)
        setPaidAmount(paid)
      }
      setLoading(false)
    }
    load()
  }, [code])

  const progress = totalValue > 0 ? (paidAmount / totalValue) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white/90 mb-1">Finance</h1>
        <p className="text-white/25 text-[13px]">Track payments, invoices, and your project investment.</p>
      </div>

      {invoices.length === 0 && totalValue === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Wallet className="w-12 h-12 text-white/[0.05] mb-4" />
          <h3 className="text-base font-semibold text-white/30 mb-1">No financial data yet</h3>
          <p className="text-[13px] text-white/15">Payment details and invoices will appear here once added.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <DollarSign className="w-4 h-4 text-white/25 mb-2" />
              <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20 mb-1">Total Value</div>
              <div className="text-[24px] font-display font-bold text-white/85 tracking-tight">
                ₹{totalValue.toLocaleString('en-IN')}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="p-5 rounded-2xl"
              style={{ background: 'rgba(16,185,129,0.025)', border: '1px solid rgba(16,185,129,0.1)' }}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400/50 mb-2" />
              <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-emerald-400/40 mb-1">Amount Paid</div>
              <div className="text-[24px] font-display font-bold text-emerald-400 tracking-tight">
                ₹{paidAmount.toLocaleString('en-IN')}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <CreditCard className="w-4 h-4 text-white/25 mb-2" />
              <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20 mb-1">Remaining</div>
              <div className="text-[24px] font-display font-bold text-white/85 tracking-tight">
                ₹{(totalValue - paidAmount).toLocaleString('en-IN')}
              </div>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[12px] font-medium text-white/50">Payment Progress</span>
              <span className="text-[12px] font-mono text-emerald-400/70">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.5), rgba(255,255,255,0.5))' }}
              />
            </div>
          </motion.div>

          {/* Invoices */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/15">Invoices</h2>
            {invoices.map((inv, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.06 }}
                key={inv.id}
                className="p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <Receipt className="w-4 h-4 text-white/30" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-medium text-white/70">{inv.description || inv.for || 'Payment'}</h4>
                    <span className="text-[9px] font-mono text-white/15 uppercase tracking-[0.15em]">
                      {inv.invoice_number || inv.id} &bull;{' '}
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-[20px] font-display font-bold text-white/80 tracking-tight">
                    ₹{(inv.amount || 0).toLocaleString('en-IN')}
                  </span>
                  {inv.status === 'paid' ? (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/10 text-emerald-400 text-[9px] font-bold font-mono uppercase tracking-[0.15em]">
                      <CheckCircle2 className="w-3 h-3" /> Paid
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-lg bg-orange-500/[0.06] border border-orange-500/10 text-orange-400 text-[9px] font-bold font-mono uppercase tracking-[0.15em]">
                      Pending
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
