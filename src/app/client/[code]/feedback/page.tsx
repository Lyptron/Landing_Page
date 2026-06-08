'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { MessageSquare, Lightbulb, Bug, Send, CheckCircle2, MessagesSquare } from 'lucide-react'
import { fetchFeedback, insertFeedback, fetchProjectByAccessCode } from '@/lib/db'

const ICON_MAP: Record<string, any> = { 'Feature Request': Lightbulb, 'Bug Report': Bug, 'General Comment': MessageSquare }

export default function FeedbackPage() {
  const params = useParams()
  const code = params.code as string
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit')
  const [feedbackType, setFeedbackType] = useState('Feature Request')
  const [subject, setSubject] = useState('')
  const [details, setDetails] = useState('')
  const [feedbackList, setFeedbackList] = useState<any[]>([])
  const [projectId, setProjectId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: project } = await fetchProjectByAccessCode(code)
      if (project) {
        setProjectId(project.id)
        const { data } = await fetchFeedback(project.id)
        if (data && data.length > 0) setFeedbackList(data)
      }
    }
    load()
  }, [code])

  const handleSubmit = async () => {
    if (!subject || !projectId) return
    setSubmitting(true)
    const { data } = await insertFeedback({ project_id: projectId, type: feedbackType, title: subject, description: details })
    if (data) setFeedbackList([data, ...feedbackList])
    setSubject('')
    setDetails('')
    setSubmitting(false)
    setActiveTab('history')
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white/90 mb-1">Feedback</h1>
        <p className="text-white/25 text-[13px]">Submit requests, report issues, or share comments with the team.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-0.5 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <button
          onClick={() => setActiveTab('submit')}
          className={`px-5 py-1.5 rounded-lg text-[12px] font-medium transition-all ${activeTab === 'submit' ? 'bg-white/[0.06] text-white/80' : 'text-white/25 hover:text-white/50'}`}
        >
          Submit
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-1.5 rounded-lg text-[12px] font-medium transition-all ${activeTab === 'history' ? 'bg-white/[0.06] text-white/80' : 'text-white/25 hover:text-white/50'}`}
        >
          History {feedbackList.length > 0 && `(${feedbackList.length})`}
        </button>
      </div>

      {activeTab === 'submit' ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl flex flex-col gap-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Type Selector */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-2.5">Type</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { type: 'Feature Request', icon: Lightbulb },
                { type: 'Bug Report', icon: Bug },
                { type: 'General Comment', icon: MessageSquare },
              ].map(({ type, icon: Icon }) => {
                const isSelected = feedbackType === type
                return (
                  <button
                    key={type}
                    onClick={() => setFeedbackType(type)}
                    className={`p-3 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1.5 transition-all ${isSelected ? 'text-blue-400' : 'text-white/25 hover:text-white/50'}`}
                    style={{
                      background: isSelected ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.015)',
                      border: isSelected ? '1px solid rgba(59,130,246,0.15)' : '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {type.replace(' Request', '').replace(' Report', '').replace(' Comment', '')}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-1.5">Subject</label>
            <input
              type="text"
              placeholder="Brief description of your request"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-[13px] text-white/70 outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)' }}
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-1.5">Details</label>
            <textarea
              rows={4}
              placeholder="Describe in detail..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-[13px] text-white/70 outline-none transition-all resize-none"
              style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)' }}
            />
          </div>

          <div className="pt-3 border-t border-white/[0.04] flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting || !subject}
              className="px-6 py-2.5 bg-white text-[#050505] font-semibold text-[11px] rounded-xl flex items-center gap-1.5 hover:bg-white/90 transition-all disabled:opacity-30"
              style={{ boxShadow: '0 0 12px rgba(255,255,255,0.05)' }}
            >
              <Send className="w-3.5 h-3.5" /> {submitting ? 'Sending...' : 'Submit'}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2.5">
          {feedbackList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessagesSquare className="w-10 h-10 text-white/[0.05] mb-3" />
              <p className="text-[13px] text-white/25">No feedback submitted yet.</p>
            </div>
          ) : (
            feedbackList.map((item) => {
              const FBIcon = ICON_MAP[item.type] || MessageSquare
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl flex items-center justify-between gap-4"
                  style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <FBIcon className="w-4 h-4 text-white/25" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[13px] font-medium text-white/70 truncate">{item.title}</h4>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/15 uppercase tracking-[0.15em]">
                        <span>{item.type}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-white/10" />
                        <span>{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 px-3 py-1 rounded-lg text-[9px] font-mono uppercase tracking-[0.15em] font-bold ${
                      item.status === 'Implemented'
                        ? 'bg-emerald-500/[0.06] border border-emerald-500/10 text-emerald-400'
                        : 'bg-blue-500/[0.06] border border-blue-500/10 text-blue-400'
                    }`}
                  >
                    {item.status === 'Implemented' ? (
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Done</span>
                    ) : (
                      item.status || 'Pending'
                    )}
                  </span>
                </div>
              )
            })
          )}
        </motion.div>
      )}
    </div>
  )
}
