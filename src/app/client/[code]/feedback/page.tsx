'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Send, MessagesSquare } from 'lucide-react'
import { submitClientFeedback } from '@/lib/db'
import { PageHeader, EmptyState, Loading, Badge } from '@/components/portal/PortalUI'
import { useClientPortalProject } from '@/hooks/useClientPortalProject'

export default function FeedbackPage() {
  const { project, loading, code } = useClientPortalProject()
  const resource = project?.feedback
  const [feedbackList, setFeedbackList] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit')
  const [feedbackType, setFeedbackType] = useState('Feature Request')
  const [subject, setSubject] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Hydrate local feedback list once the hook returns the fetched data,
  // so subsequent submissions can prepend to it without re-fetching.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (resource) setFeedbackList(resource)
  }, [resource])

  const handleSubmit = async () => {
    if (!subject) return
    setSubmitting(true)
    setSubmitError(null)
    const { data, error } = await submitClientFeedback({
      code,
      type: feedbackType,
      title: subject,
      description: details || undefined,
    })
    if (error) {
      setSubmitError('Could not send feedback. Please try again.')
      setSubmitting(false)
      return
    }
    if (data) setFeedbackList([data, ...feedbackList])
    setSubject('')
    setDetails('')
    setSubmitting(false)
    setActiveTab('history')
  }

  if (loading) return <Loading />

  return (
    <div className="flex flex-col gap-8 w-full">
      <PageHeader title="Feedback" description="Share ideas, report issues, or send a quick note to your project team." />

      {/* Tabs — simplified text tabs */}
      <div className="flex gap-8 border-b" style={{ borderColor: 'var(--cp-border-soft)' }}>
        {(['submit', 'history'] as const).map((tab) => {
          const active = activeTab === tab
          const labelText = tab === 'submit' ? 'Submit Feedback' : `Feedback History${feedbackList.length > 0 ? ` (${feedbackList.length})` : ''}`
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative pb-3 text-[13px] font-semibold transition-colors"
              style={{ color: active ? 'var(--cp-text)' : 'var(--cp-text-muted)' }}
            >
              {labelText}
              {active && (
                <motion.span
                  layoutId="feedback-tab-active"
                  className="absolute left-0 right-0 -bottom-px h-0.38"
                  style={{ background: 'var(--cp-cyan)' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {activeTab === 'submit' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6"
        >
          {/* Type Selector */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>Category</label>
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'Feature Request', label: 'Feature Request' },
                { type: 'Bug Report', label: 'Bug Report' },
                { type: 'General Comment', label: 'General Message' },
              ].map(({ type, label }) => {
                const isSelected = feedbackType === type
                return (
                  <button
                    key={type}
                    onClick={() => setFeedbackType(type)}
                    className="px-4 py-2 rounded-full text-[12.5px] font-medium transition-colors border"
                    style={
                      isSelected
                        ? { background: 'var(--cp-cyan-soft)', color: 'var(--cp-cyan)', borderColor: 'var(--cp-cyan-border)' }
                        : { background: 'transparent', color: 'var(--cp-text-muted)', borderColor: 'var(--cp-border)' }
                    }
                    onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.color = 'var(--cp-text-secondary)'; e.currentTarget.style.borderColor = 'var(--cp-border-strong)' } }}
                    onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.color = 'var(--cp-text-muted)'; e.currentTarget.style.borderColor = 'var(--cp-border)' } }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>Subject</label>
            <input
              type="text"
              placeholder="What is this regarding?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-[13.5px] outline-none transition-colors"
              style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)', color: 'var(--cp-text)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cp-cyan)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--cp-border-soft)' }}
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>Details</label>
            <textarea
              rows={5}
              placeholder="Please provide details..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-[13.5px] outline-none transition-colors resize-none"
              style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)', color: 'var(--cp-text)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cp-cyan)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--cp-border-soft)' }}
            />
          </div>

          {submitError && (
            <p className="text-[12px] text-(--cp-red)" role="alert">{submitError}</p>
          )}
          <div className="pt-4 flex justify-end border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
            <button
              onClick={handleSubmit}
              disabled={submitting || !subject}
              className="cp-btn-primary px-5 py-2.5 text-[12.5px] flex items-center gap-1.5 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Sending…' : 'Submit Feedback'}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col"
        >
          {feedbackList.length === 0 ? (
            <EmptyState
              icon={MessagesSquare}
              title="No feedback history"
              description="Any issues or ideas you submit will show up here along with their action status."
            />
          ) : (
            <div className="cp-card cp-list overflow-hidden">
              {feedbackList.map((item) => {
                const isResolved = item.status === 'Implemented' || item.status === 'Resolved'
                const isUnderReview = item.status === 'Under Review' || item.status === 'Planned' || item.status === 'In Review'
                const date = item.submitted_at ? new Date(item.submitted_at) : null
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 transition-colors hover:bg-(--cp-bg-soft)"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cp-text-faint)' }}>
                        {item.type}
                      </span>
                      <h4 className="text-[13.5px] font-semibold truncate" style={{ color: 'var(--cp-text)' }}>
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-[12px] leading-relaxed mt-0.5 max-w-2xl line-clamp-2" style={{ color: 'var(--cp-text-muted)' }}>
                          {item.description}
                        </p>
                      )}
                      {date && (
                        <span className="text-[10.5px] mt-1" style={{ color: 'var(--cp-text-faint)' }}>
                          Submitted on {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center justify-between sm:justify-end mt-2 sm:mt-0">
                      <Badge tone={isResolved ? 'emerald' : isUnderReview ? 'cyan' : 'amber'}>
                        {item.status || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
