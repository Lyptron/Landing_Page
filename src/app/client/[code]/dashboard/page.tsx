'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Clock,
  Activity,
  ArrowRight,
  GitCommit,
  CheckSquare,
  Zap,
  TrendingUp,
  Calendar,
  CreditCard,
  Inbox,
} from 'lucide-react'
import Link from 'next/link'
import { fetchProjectByAccessCode } from '@/lib/db'

const ACTIVITY_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  commit: { icon: GitCommit, color: 'text-blue-400', bg: 'bg-blue-500/[0.08]' },
  milestone: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/[0.08]' },
  deployment: { icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/[0.08]' },
  approval: { icon: CheckSquare, color: 'text-orange-400', bg: 'bg-orange-500/[0.08]' },
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hours ago`
  return `${Math.floor(hrs / 24)} days ago`
}

export default function ClientDashboardPage() {
  const params = useParams()
  const code = params.code as string
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await fetchProjectByAccessCode(code)
      if (!error && data) setProject(data)
      setLoading(false)
    }
    load()
  }, [code])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Inbox className="w-12 h-12 text-white/[0.06] mb-4" />
        <h3 className="text-lg font-semibold text-white/40 mb-2">Project not found</h3>
        <p className="text-[13px] text-white/20">This access code may be invalid or expired.</p>
      </div>
    )
  }

  const progress = project.progress || 0
  const daysRemaining = project.due_date
    ? Math.max(0, Math.ceil((new Date(project.due_date).getTime() - Date.now()) / 86400000))
    : null
  const health = project.health || 'on-track'
  const pendingApprovals = (project.approvals || []).filter((a: any) => a.status === 'pending')
  const nextMilestone = (project.milestones || []).find(
    (m: any) => m.status === 'in-progress' || m.status === 'upcoming'
  )
  const recentActivity = (project.activities || []).slice(0, 5).map((a: any) => {
    const meta = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.commit
    return { ...a, text: a.action_text, time: timeAgo(a.created_at), icon: meta.icon, color: meta.color, bg: meta.bg }
  })
  const totalPaid = (project.payments || [])
    .filter((p: any) => p.status === 'paid')
    .reduce((s: number, p: any) => s + (p.amount || 0), 0)
  const totalValue = project.contract_value || (project.payments || []).reduce((s: number, p: any) => s + (p.amount || 0), 0)

  const getHealthStyle = (h: string) => {
    if (h === 'on-track') return { text: 'text-emerald-400', bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/15', label: 'On Track' }
    if (h === 'at-risk') return { text: 'text-orange-400', bg: 'bg-orange-500/[0.06]', border: 'border-orange-500/15', label: 'At Risk' }
    return { text: 'text-red-400', bg: 'bg-red-500/[0.06]', border: 'border-red-500/15', label: 'Delayed' }
  }
  const hs = getHealthStyle(health)

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
        <h1 className="font-display text-[clamp(24px,4vw,36px)] font-bold tracking-[-0.02em] text-white/90">
          {project.name}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[13px] text-white/30">
            Phase: <span className="text-white/60 font-medium">{project.status || 'Not started'}</span>
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-[0.15em] border ${hs.bg} ${hs.text} ${hs.border}`}>
            {hs.label}
          </span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 rounded-2xl relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <TrendingUp className="w-4 h-4 text-blue-400/60 mb-3" />
          <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20 mb-1">Progress</div>
          <div className="text-[28px] font-display font-bold text-white/90 tracking-tight leading-none">{progress}%</div>
          <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden mt-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.6), rgba(255,255,255,0.5))' }}
            />
          </div>
        </motion.div>

        {/* Days Remaining */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <Calendar className="w-4 h-4 text-purple-400/60 mb-3" />
          <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20 mb-1">Days Left</div>
          <div className="text-[28px] font-display font-bold text-white/90 tracking-tight leading-none">
            {daysRemaining !== null ? daysRemaining : '—'}
          </div>
        </motion.div>

        {/* Approvals Pending */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl"
          style={{
            background: pendingApprovals.length > 0 ? 'rgba(249,115,22,0.03)' : 'rgba(255,255,255,0.02)',
            border: pendingApprovals.length > 0 ? '1px solid rgba(249,115,22,0.1)' : '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <CheckSquare className={`w-4 h-4 mb-3 ${pendingApprovals.length > 0 ? 'text-orange-400/60' : 'text-white/20'}`} />
          <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20 mb-1">Needs Review</div>
          <div className="text-[28px] font-display font-bold text-white/90 tracking-tight leading-none">
            {pendingApprovals.length}
          </div>
        </motion.div>

        {/* Paid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <CreditCard className="w-4 h-4 text-emerald-400/60 mb-3" />
          <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20 mb-1">Paid</div>
          <div className="text-[22px] font-display font-bold text-emerald-400/80 tracking-tight leading-none">
            {totalPaid > 0 ? `₹${totalPaid.toLocaleString('en-IN')}` : '—'}
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left Column - Actions + Milestone */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Pending Approvals */}
          {pendingApprovals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-5 rounded-2xl relative overflow-hidden"
              style={{ background: 'rgba(249,115,22,0.03)', border: '1px solid rgba(249,115,22,0.1)' }}
            >
              <div className="absolute top-0 left-[15%] right-[15%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.2), transparent)' }} />
              <div className="flex items-center gap-2.5 mb-4">
                <CheckSquare className="w-4 h-4 text-orange-400" />
                <h3 className="text-[14px] font-bold text-white/80">Action Required</h3>
              </div>
              <div className="flex flex-col gap-2.5">
                {pendingApprovals.slice(0, 3).map((a: any) => (
                  <Link key={a.id} href={`/client/${code}/approvals`}>
                    <div className="p-3.5 rounded-xl border border-white/[0.05] hover:border-orange-400/20 transition-all cursor-pointer group" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] uppercase tracking-[0.15em] text-orange-400/70 font-bold font-mono">{a.type || 'Review'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                      </div>
                      <h4 className="text-[13px] font-medium text-white/70 group-hover:text-white/90 transition-colors">{a.title}</h4>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href={`/client/${code}/approvals`} className="flex items-center gap-1 mt-3 text-[11px] font-medium text-orange-400/60 hover:text-orange-400 transition-colors">
                Review all <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          )}

          {/* Next Milestone */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-2xl flex flex-col"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <Clock className="w-5 h-5 text-blue-400/50 mb-3" />
            <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20 mb-2">Next Milestone</div>
            {nextMilestone ? (
              <>
                <h3 className="text-[16px] font-bold text-white/80 mb-1">{nextMilestone.name || nextMilestone.title}</h3>
                <p className="text-[12px] text-white/30 mb-4">{nextMilestone.date_range || 'Date TBD'}</p>
              </>
            ) : (
              <p className="text-[13px] text-white/25 mb-4">No upcoming milestones</p>
            )}
            <Link
              href={`/client/${code}/timeline`}
              className="text-[11px] font-medium text-blue-400/50 hover:text-blue-400 transition-colors mt-auto"
            >
              View full timeline &rarr;
            </Link>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-2 gap-2.5"
          >
            {[
              { label: 'Gallery', href: `/client/${code}/gallery`, icon: '🖼' },
              { label: 'Documents', href: `/client/${code}/documents`, icon: '📄' },
              { label: 'Meetings', href: `/client/${code}/meetings`, icon: '📹' },
              { label: 'Feedback', href: `/client/${code}/feedback`, icon: '💬' },
            ].map((link) => (
              <Link key={link.label} href={link.href}>
                <div
                  className="p-3.5 rounded-xl text-center hover:bg-white/[0.03] transition-all cursor-pointer group"
                  style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <span className="text-lg mb-1 block">{link.icon}</span>
                  <span className="text-[11px] font-medium text-white/30 group-hover:text-white/60 transition-colors">{link.label}</span>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Right Column - Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-white/30" />
              <h3 className="text-[14px] font-bold text-white/80">Recent Activity</h3>
            </div>
            <Link href={`/client/${code}/development`} className="text-[11px] text-white/25 hover:text-white/50 transition-colors">
              View all &rarr;
            </Link>
          </div>

          {recentActivity.length > 0 ? (
            <div className="relative pl-5 border-l border-white/[0.04] flex flex-col gap-5">
              {recentActivity.map((activity: any, i: number) => (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  key={i}
                  className="relative"
                >
                  <div className={`absolute -left-[29px] top-1 w-5 h-5 rounded-full flex items-center justify-center ${activity.bg} border border-white/[0.04]`}>
                    <activity.icon className={`w-2.5 h-2.5 ${activity.color}`} />
                  </div>
                  <div className="p-3.5 rounded-xl border border-white/[0.03] hover:border-white/[0.06] transition-colors" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <p className="text-[13px] text-white/65 font-medium mb-1">{activity.text}</p>
                    <span className="text-[9px] text-white/20 uppercase tracking-[0.15em] font-mono">{activity.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="w-10 h-10 text-white/[0.05] mb-3" />
              <p className="text-[13px] text-white/25">No activity yet</p>
              <p className="text-[11px] text-white/15 mt-1">Updates will appear here as your project progresses.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
