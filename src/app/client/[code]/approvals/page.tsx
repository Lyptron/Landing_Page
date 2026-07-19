'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, XCircle, CheckCircle2, AlertCircle, ClipboardCheck } from 'lucide-react'
import { updateClientApproval } from '@/lib/db'
import { PageHeader, EmptyState, Loading, SectionLabel, Badge, type PortalTone } from '@/components/portal/PortalUI'
import { useClientPortalProject } from '@/hooks/useClientPortalProject'

export default function ApprovalsPage() {
  const { project, loading, code } = useClientPortalProject()
  const resource = project?.approvals
  const [approvals, setApprovals] = useState<any[]>([])
  const [actionError, setActionError] = useState<string | null>(null)

  // Hydrate local list so optimistic updates from handleApproval persist.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (resource) setApprovals(resource)
  }, [resource])

  const handleApproval = async (id: string, status: 'approved' | 'rejected') => {
    setActionError(null)
    const prev = approvals
    // Optimistic update — reverted below if the RPC fails.
    setApprovals(approvals.map((a) => (a.id === id ? { ...a, status } : a)))
    const { error } = await updateClientApproval({ code, approvalId: id, status })
    if (error) {
      setApprovals(prev)
      setActionError('Could not save. Please try again.')
    }
  }

  const getStatusInfo = (status: string): { icon: typeof CheckSquare; tone: PortalTone; label: string } => {
    switch (status) {
      case 'pending':
        return { icon: AlertCircle, tone: 'amber', label: 'Needs Your Review' }
      case 'approved':
        return { icon: CheckCircle2, tone: 'emerald', label: 'Approved' }
      case 'rejected':
        return { icon: XCircle, tone: 'red', label: 'Changes Requested' }
      default:
        return { icon: CheckSquare, tone: 'neutral', label: status }
    }
  }

  const pending = approvals.filter((a) => a.status === 'pending')
  const resolved = approvals.filter((a) => a.status !== 'pending')

  if (loading) return <Loading />

  return (
    <div className="flex flex-col gap-10 max-w-3xl">
      <PageHeader title="Approvals" description="Review your project's milestones and deliverables, and let your team know if anything needs changes." />

      {approvals.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Nothing to review right now"
          description="When your team submits something for your review, it'll show up here."
        />
      ) : (
        <>
          {actionError && (
            <p className="text-[12px] text-(--cp-red)" role="alert">{actionError}</p>
          )}
          {/* Pending Section */}
          {pending.length > 0 && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--cp-amber)' }} />
                <SectionLabel tone="amber">Needs Your Review ({pending.length})</SectionLabel>
              </div>
              <div className="flex flex-col gap-5">
                {pending.map((item, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    key={item.id}
                    className="cp-card cp-card-accent pl-5 py-1 flex flex-col gap-4"
                  >
                    <div>
                      <SectionLabel tone="amber">{item.type || 'Review'}</SectionLabel>
                      <h3 className="text-[17px] font-bold mt-1" style={{ color: 'var(--cp-text)' }}>{item.title}</h3>
                      {item.description && (
                        <p className="text-[13.5px] mt-2 leading-relaxed" style={{ color: 'var(--cp-text-secondary)' }}>{item.description || item.desc}</p>
                      )}
                      <span className="text-[12px] mt-3 block" style={{ color: 'var(--cp-text-muted)' }}>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 pt-4 border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
                      <button
                        onClick={() => handleApproval(item.id, 'rejected')}
                        className="cp-btn-secondary flex-1 py-2.5 text-[12.5px]"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleApproval(item.id, 'approved')}
                        className="cp-btn-primary flex-1 py-2.5 text-[12.5px]"
                      >
                        Approve
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Resolved Section */}
          {resolved.length > 0 && (
            <div className="flex flex-col gap-4">
              <SectionLabel>Previously Reviewed ({resolved.length})</SectionLabel>
              <div className="flex flex-col">
                {resolved.map((item, idx) => {
                  const status = getStatusInfo(item.status)
                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                      key={item.id}
                      className={`flex items-center justify-between gap-4 py-4 ${idx < resolved.length - 1 ? 'border-b' : ''}`}
                      style={{ borderColor: 'var(--cp-border-soft)' }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <status.icon
                          className="w-4 h-4 shrink-0"
                          style={{ color: status.tone === 'emerald' ? 'var(--cp-emerald)' : status.tone === 'red' ? 'var(--cp-red)' : 'var(--cp-text-muted)' }}
                        />
                        <div className="min-w-0">
                          <h4 className="text-[13.5px] font-medium truncate" style={{ color: 'var(--cp-text-secondary)' }}>{item.title}</h4>
                          <span className="text-[12px]" style={{ color: 'var(--cp-text-faint)' }}>{item.type || 'Review'}</span>
                        </div>
                      </div>
                      <Badge tone={status.tone} className="shrink-0">{status.label}</Badge>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
