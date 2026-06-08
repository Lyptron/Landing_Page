'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckSquare, XCircle, CheckCircle2, AlertCircle, ClipboardCheck } from 'lucide-react'
import { fetchApprovals, updateApproval, fetchProjectByAccessCode } from '@/lib/db'

export default function ApprovalsPage() {
  const params = useParams()
  const code = params.code as string
  const [approvals, setApprovals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: project } = await fetchProjectByAccessCode(code)
      if (project) {
        const { data } = await fetchApprovals(project.id)
        if (data) setApprovals(data)
      }
      setLoading(false)
    }
    load()
  }, [code])

  const handleApproval = async (id: string, status: string) => {
    setApprovals(approvals.map((a) => (a.id === id ? { ...a, status } : a)))
    await updateApproval(id, status)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/[0.06]', label: 'Needs Your Review' }
      case 'approved':
        return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/[0.06]', label: 'Approved' }
      case 'rejected':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/[0.06]', label: 'Changes Requested' }
      default:
        return { icon: CheckSquare, color: 'text-white/30', bg: 'bg-white/[0.03]', label: status }
    }
  }

  const pending = approvals.filter((a) => a.status === 'pending')
  const resolved = approvals.filter((a) => a.status !== 'pending')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white/90 mb-1">Approvals</h1>
        <p className="text-white/25 text-[13px]">Review and approve project milestones and deliverables.</p>
      </div>

      {approvals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ClipboardCheck className="w-12 h-12 text-white/[0.05] mb-4" />
          <h3 className="text-base font-semibold text-white/30 mb-1">Nothing to review</h3>
          <p className="text-[13px] text-white/15">When your agency submits items for approval, they will appear here.</p>
        </div>
      ) : (
        <>
          {/* Pending Section */}
          {pending.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[9px] font-mono uppercase tracking-[0.2em] text-orange-400/50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                Needs Your Review ({pending.length})
              </h2>
              {pending.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  key={item.id}
                  className="p-5 rounded-2xl relative overflow-hidden"
                  style={{ background: 'rgba(249,115,22,0.025)', border: '1px solid rgba(249,115,22,0.1)' }}
                >
                  <div className="absolute top-0 left-[15%] right-[15%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.15), transparent)' }} />
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.15em] text-orange-400/60 font-bold font-mono">{item.type || 'Review'}</span>
                      <h3 className="text-[16px] font-bold text-white/85 mt-1">{item.title}</h3>
                      {item.description && <p className="text-[13px] text-white/35 mt-1">{item.description || item.desc}</p>}
                      <span className="text-[9px] font-mono text-white/15 uppercase tracking-[0.15em] mt-2 block">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 pt-3 border-t border-white/[0.04]">
                      <button
                        onClick={() => handleApproval(item.id, 'rejected')}
                        className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white/40 hover:text-red-400 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleApproval(item.id, 'approved')}
                        className="flex-1 py-2.5 bg-white text-[#050505] font-semibold text-[12px] rounded-xl transition-all hover:bg-white/90"
                        style={{ boxShadow: '0 0 15px rgba(255,255,255,0.06)' }}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Resolved Section */}
          {resolved.length > 0 && (
            <div className="flex flex-col gap-3 mt-2">
              <h2 className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/15">Previously Reviewed ({resolved.length})</h2>
              {resolved.map((item, idx) => {
                const status = getStatusInfo(item.status)
                return (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    key={item.id}
                    className="p-4 rounded-xl flex items-center justify-between gap-4"
                    style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${status.bg}`}>
                        <status.icon className={`w-4 h-4 ${status.color}`} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[13px] font-medium text-white/60 truncate">{item.title}</h4>
                        <span className="text-[9px] font-mono text-white/15 uppercase tracking-[0.15em]">{item.type || 'Review'}</span>
                      </div>
                    </div>
                    <span className={`shrink-0 px-3 py-1 rounded-lg text-[9px] font-mono uppercase tracking-[0.15em] font-bold ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
