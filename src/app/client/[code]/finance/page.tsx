'use client'
import { motion } from 'framer-motion'
import { Wallet, ArrowUpRight } from 'lucide-react'
import { PageHeader, EmptyState, Loading, Badge } from '@/components/portal/PortalUI'
import { useClientPortalProject } from '@/hooks/useClientPortalProject'

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default function FinancePage() {
  const { project, loading } = useClientPortalProject()
  const payments: any[] = project?.payments ?? []
  const invoices = payments
  const totalPayments = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const totalValue = project?.contract_value || totalPayments
  const paidAmount = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0)

  if (loading) return <Loading />

  if (invoices.length === 0 && totalValue === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="No financial details yet"
        description="Your contract value, payments, and invoices will appear here once they're added."
      />
    )
  }

  const remaining = totalValue - paidAmount
  const progress = totalValue > 0 ? (paidAmount / totalValue) * 100 : 0
  const sortedInvoices = [...invoices].sort((a, b) => {
    const da = a.due_date ? new Date(a.due_date).getTime() : 0
    const db = b.due_date ? new Date(b.due_date).getTime() : 0
    return da - db
  })

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-5 border-b" style={{ borderColor: 'var(--cp-border-soft)' }}>
        <PageHeader
          title="Payments & Invoices"
          description="Track your contract value, completed payments, and outstanding invoices."
          action={
            <div className="text-[12px]" style={{ color: 'var(--cp-text-faint)' }}>
              As of {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          }
        />
      </motion.div>

      {/* Summary Details Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-b" style={{ borderColor: 'var(--cp-border-soft)' }}>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--cp-text-muted)' }}>Total Contract</span>
          <span className="text-[22px] font-bold mt-1 block" style={{ color: 'var(--cp-text)' }}>{fmt(totalValue)}</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--cp-text-muted)' }}>Amount Paid</span>
          <span className="text-[22px] font-bold mt-1 block" style={{ color: 'var(--cp-emerald)' }}>{fmt(paidAmount)}</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--cp-text-muted)' }}>Outstanding</span>
          <span className="text-[22px] font-bold mt-1 block" style={{ color: 'var(--cp-cyan)' }}>{fmt(remaining)}</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--cp-text-muted)' }}>Status</span>
          <span className="text-[22px] font-bold mt-1 block" style={{ color: remaining === 0 ? 'var(--cp-emerald)' : 'var(--cp-cyan)' }}>
            {remaining === 0 ? 'Fully Paid' : `${Math.round(progress)}% Completed`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 rounded-full overflow-hidden -mt-4" style={{ background: 'var(--cp-surface-strong)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--cp-cyan), var(--cp-emerald))' }}
        />
      </div>

      {/* Invoices List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col gap-4 mt-2"
      >
        <h2 className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--cp-text)' }}>
          Ledger
        </h2>

        <div className="cp-card cp-list overflow-hidden">
          {sortedInvoices.map((inv) => {
            const isPaid = inv.status === 'paid'
            const date = inv.due_date ? new Date(inv.due_date) : null
            return (
              <div
                key={inv.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 transition-colors hover:bg-(--cp-bg-soft)"
              >
                {/* Description & Date */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: isPaid ? 'var(--cp-emerald)' : 'var(--cp-cyan)' }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[13.5px] font-semibold truncate" style={{ color: 'var(--cp-text)' }}>
                      {inv.description || inv.for || 'Project Payment'}
                    </h3>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--cp-text-faint)' }}>
                      Due: {date ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      {inv.invoice_number && ` · REF: ${inv.invoice_number}`}
                    </p>
                  </div>
                </div>

                {/* Amount & Status Badge */}
                <div className="flex justify-between sm:justify-end items-center gap-5 mt-1 sm:mt-0">
                  <span className="text-[15px] font-bold tabular-nums" style={{ color: 'var(--cp-text)' }}>
                    {fmt(inv.amount || 0)}
                  </span>
                  <Badge tone={isPaid ? 'emerald' : 'cyan'}>{isPaid ? 'Paid' : 'Pending'}</Badge>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Footer Support */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 text-[12px] border-t mt-4"
        style={{ color: 'var(--cp-text-faint)', borderColor: 'var(--cp-border-soft)' }}
      >
        <span>Invoice questions? Contact your project manager.</span>
        <a
          href="mailto:billing@lyptron.com"
          className="flex items-center gap-1 transition-colors text-(--cp-text-muted) hover:text-(--cp-cyan)"
        >
          billing@lyptron.com
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </motion.div>
    </div>
  )
}
