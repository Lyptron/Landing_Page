'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Activity,
  ArrowRight,
  Hammer,
  ClipboardCheck,
  Rocket,
  CalendarClock,
  Calendar,
  Inbox,
  Sparkles,
  Users,
  Map,
  Megaphone,
  AlertTriangle,
  OctagonAlert,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useClientPortalProject } from '@/hooks/useClientPortalProject'
import {
  EmptyState,
  Loading,
  SectionLabel,
  getHealthInfo,
  TONE_TEXT,
  type PortalTone,
} from '@/components/portal/PortalUI'

const ACTIVITY_META: Record<string, { icon: LucideIcon; tone: PortalTone; label: string }> = {
  commit: { icon: Hammer, tone: 'cyan', label: 'Development' },
  milestone: { icon: CheckCircle2, tone: 'emerald', label: 'Milestone' },
  deployment: { icon: Rocket, tone: 'cyan', label: 'Release' },
  approval: { icon: ClipboardCheck, tone: 'amber', label: 'Approval' },
}

const ANNOUNCEMENT_META: Record<string, { icon: LucideIcon; tone: PortalTone }> = {
  info: { icon: Megaphone, tone: 'cyan' },
  success: { icon: CheckCircle2, tone: 'emerald' },
  warning: { icon: AlertTriangle, tone: 'amber' },
  alert: { icon: OctagonAlert, tone: 'red' },
}

const STAGES = ['Backlog', 'Design', 'Development', 'Review', 'Completed']
const STAGE_DESCRIPTIONS: Record<string, string> = {
  Backlog: 'Scoping the work and lining up priorities.',
  Design: 'Shaping the look, feel and user experience.',
  Development: 'Building out the core functionality.',
  Review: 'Final testing and polish before launch.',
  Completed: 'Delivered and live.',
}

/** Strong ease-out (matches the global --ease-out token) for entrance and hover motion. */
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) === 1 ? '' : 's'} ago`
}

function formatDate(date?: string) {
  if (!date) return 'TBD'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** A milestone needs a real, descriptive title to be worth surfacing to the client. */
function hasMeaningfulTitle(m: any) {
  return ((m?.name || m?.title || '') as string).trim().length >= 3
}

const DIVIDER = { borderColor: 'var(--cp-border-soft)' }

export default function ClientDashboardPage() {
  const { project, loading, code } = useClientPortalProject()
  const team = project?.project_team ?? []
  const announcements = project?.announcements ?? []
  // Date.now() is impure for render, so we resolve the countdown after mount.
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
  useEffect(() => {
    if (!project?.due_date) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDaysRemaining(Math.max(0, Math.ceil((new Date(project.due_date as string).getTime() - Date.now()) / 86400000)))
  }, [project?.due_date])

  if (loading) return <Loading />

  if (!project) {
    return (
      <EmptyState
        icon={Inbox}
        title="We couldn't find this project"
        description="Your access link may be out of date. Please double-check the link, or reach out to your project manager for a new one."
      />
    )
  }

  const progress = project.progress || 0
  const health = getHealthInfo(project.health)
  const isMusicClient = (project.clients?.industry || '').toLowerCase().includes('music')
  const pendingApprovals = (project.approvals || []).filter((a: any) => a.status === 'pending')
  const inReviewFeedback = (project.feedback || []).filter((f: any) => f.status === 'In Review')
  const upcomingMilestones = (project.milestones || [])
    .filter((m: any) => m.status !== 'completed' && hasMeaningfulTitle(m))
    .slice(0, 3)
  const recentActivity = (project.activities || []).slice(0, 5).map((a: any) => {
    const meta = ACTIVITY_META[a.type] || ACTIVITY_META.commit
    return { ...a, time: timeAgo(a.created_at), ...meta }
  })

  const actionsTone: PortalTone = pendingApprovals.length > 0 ? 'amber' : 'emerald'
  const currentStageIndex = Math.max(0, STAGES.indexOf(project.stage || 'Backlog'))

  return (
    <div className="flex flex-col gap-8 sm:gap-12 lg:gap-14">
      {/* Project Health */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: EASE_OUT }}
        className="relative overflow-hidden rounded-[20px] flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 p-5 sm:p-7 lg:p-9"
        style={{
          background: 'var(--cp-surface)',
          border: '1px solid var(--cp-border-soft)',
        }}
      >
        {/* Ambient tint matching project health, anchored top-right */}
        <div
          className="absolute -top-24 -right-24 w-55 h-55 sm:w-75 sm:h-75 lg:w-85 lg:h-85 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, color-mix(in srgb, ${TONE_TEXT[health.tone]} 14%, transparent) 0%, transparent 70%)`,
          }}
        />

        <div className="relative min-w-0 flex-1">
          <SectionLabel tone="cyan">{project.status || 'In Progress'}</SectionLabel>
          <h1
            className="font-display text-[26px] sm:text-[34px] md:text-[38px] lg:text-[44px] font-bold tracking-[-0.03em] mt-2 leading-[1.05] sm:leading-[1.02] text-balance"
            style={{ color: 'var(--cp-text)' }}
          >
            {project.name}
          </h1>
          <p className="text-[13.5px] sm:text-[14.5px] lg:text-[15px] mt-3 lg:mt-3.5 max-w-xl leading-relaxed text-balance" style={{ color: 'var(--cp-text-secondary)' }}>
            {health.description}
          </p>
        </div>

        <div className="relative flex flex-col items-start md:items-end gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: TONE_TEXT[health.tone] }} />
            <span className="text-[13px] font-medium" style={{ color: TONE_TEXT[health.tone] }}>{health.label}</span>
          </div>
          {recentActivity[0] && (
            <span className="text-[11.5px]" style={{ color: 'var(--cp-text-faint)' }}>
              Updated {recentActivity[0].time}
            </span>
          )}
          <Link
            href={`/client/${code}/timeline`}
            className="cp-btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[13px]"
          >
            <Map className="w-4 h-4" />
            View Timeline
          </Link>
        </div>
      </motion.div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03, ease: EASE_OUT }}
          className="pb-10 sm:pb-14 border-b"
          style={DIVIDER}
        >
          <SectionLabel>Announcements</SectionLabel>
          <div className="cp-card cp-list overflow-hidden mt-4">
            {announcements.map((a: any) => {
              const meta = ANNOUNCEMENT_META[a.tone] || ANNOUNCEMENT_META.info
              return (
                <div key={a.id} className="flex items-start gap-3 p-4 sm:p-5">
                  <meta.icon className="w-4.5 h-4.5 shrink-0 mt-0.5" style={{ color: TONE_TEXT[meta.tone] }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold" style={{ color: 'var(--cp-text)' }}>{a.title}</p>
                    {a.body && (
                      <p className="text-[12.5px] mt-0.5 leading-relaxed text-balance" style={{ color: 'var(--cp-text-secondary)' }}>
                        {a.body}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] shrink-0 tabular-nums" style={{ color: 'var(--cp-text-faint)' }}>
                    {timeAgo(a.created_at)}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Progress % + Current Phase — unified into a single card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, ease: EASE_OUT }}
        className="pb-10 sm:pb-14 border-b"
        style={DIVIDER}
      >
        <div className={`cp-card ${isMusicClient ? 'cp-card-accent-violet' : 'cp-card-accent'} pl-5 sm:pl-6 lg:pl-7 p-5 sm:p-6 lg:p-7 flex flex-col gap-7 sm:gap-8`}>

          {/* Top row: big % + days remaining */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 sm:gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[13px]" style={{ color: 'var(--cp-text-muted)' }}>Progress</span>
              <div className="flex items-baseline gap-2">
                <span
                  className="font-display font-bold tabular-nums leading-none text-[56px] sm:text-[68px] lg:text-[80px] tracking-[-0.03em]"
                  style={{ color: 'var(--cp-text)' }}
                >
                  {progress}
                </span>
                <span className="font-display font-bold leading-none text-[22px] sm:text-[28px] lg:text-[32px]" style={{ color: 'var(--cp-text-muted)' }}>
                  %
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1 sm:items-end">
              <p className="text-[12.5px] sm:text-right" style={{ color: 'var(--cp-text-muted)' }}>
                {daysRemaining !== null ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining` : 'Timeline to be confirmed'}
              </p>
              <div className="flex items-center gap-4 text-[11.5px]" style={{ color: 'var(--cp-text-faint)' }}>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(project.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5" />
                  {formatDate(project.due_date)}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full h-1.25 rounded-full overflow-hidden" style={{ background: 'var(--cp-surface-strong)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.4, ease: EASE_OUT }}
              className="h-full rounded-full"
              style={{
                background: isMusicClient ? 'var(--cp-violet)' : 'var(--cp-cyan)',
                boxShadow: `0 0 12px color-mix(in srgb, ${isMusicClient ? 'var(--cp-violet)' : 'var(--cp-cyan)'} 55%, transparent)`,
              }}
            />
          </div>

          {/* Horizontal stage tracker — scrolls on phones so 5 stages don't crush */}
          <div>
            <span className="text-[13px] block mb-5" style={{ color: 'var(--cp-text-muted)' }}>Phase</span>
            <div className="flex items-start overflow-x-auto sm:overflow-visible -mx-1 px-1 pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
              {STAGES.map((stage, i) => {
                const isDone = i < currentStageIndex
                const isCurrent = i === currentStageIndex
                const isLast = i === STAGES.length - 1
                return (
                  <div key={stage} className={`flex flex-col ${isLast ? 'shrink-0 sm:shrink' : 'flex-1'} min-w-24 sm:min-w-0`}>
                    <div className="flex items-center w-full">
                      <div
                        className="w-2.75 h-2.75 rounded-full shrink-0"
                        style={
                          isDone
                            ? { background: 'var(--cp-cyan)' }
                            : isCurrent
                            ? { background: 'var(--cp-cyan)', boxShadow: '0 0 0 4px color-mix(in srgb, var(--cp-cyan) 22%, transparent)' }
                            : { background: 'var(--cp-surface)', border: '2px solid var(--cp-border)' }
                        }
                      />
                      {!isLast && (
                        <div className="h-px flex-1" style={{ background: isDone ? 'var(--cp-cyan)' : 'var(--cp-border-soft)' }} />
                      )}
                    </div>
                    <div className="mt-2.5 pr-3 sm:pr-2">
                      <span className="text-[12px] sm:text-[12.5px] font-semibold block truncate" style={{ color: isCurrent || isDone ? 'var(--cp-text)' : 'var(--cp-text-faint)' }}>
                        {stage}
                      </span>
                      {isCurrent && (
                        <span className="text-[11px] sm:text-[11.5px] block mt-0.5 leading-relaxed" style={{ color: 'var(--cp-text-muted)' }}>
                          {STAGE_DESCRIPTIONS[stage]}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pending Client Actions + Upcoming Milestones + Team Members */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, ease: EASE_OUT }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 lg:gap-10 pb-10 sm:pb-14 border-b"
        style={DIVIDER}
      >
        {/* Pending client actions */}
        <div className="cp-card p-5 sm:p-6 flex flex-col gap-3.5 h-full">
          <SectionLabel tone={actionsTone}>Pending Client Actions</SectionLabel>
          <div className="font-display font-bold tabular-nums leading-none text-[44px]" style={{ color: 'var(--cp-text)' }}>
            {pendingApprovals.length}
          </div>
          {pendingApprovals.length > 0 ? (
            <div className="flex flex-col gap-1">
              {pendingApprovals.slice(0, 2).map((a: any) => (
                <p key={a.id} className="text-[12px] truncate" style={{ color: 'var(--cp-text-muted)' }}>
                  {a.title}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[12.5px]" style={{ color: 'var(--cp-text-muted)' }}>
              You&apos;re all caught up — nothing pending.
            </p>
          )}
          {inReviewFeedback.length > 0 && (
            <p className="text-[11.5px]" style={{ color: 'var(--cp-text-faint)' }}>
              {inReviewFeedback.length} feedback item{inReviewFeedback.length === 1 ? '' : 's'} awaiting a response
            </p>
          )}
          <Link
            href={pendingApprovals.length > 0 ? `/client/${code}/approvals` : `/client/${code}/feedback`}
            className="group inline-flex items-center gap-1.5 text-[12.5px] font-semibold mt-auto pt-2"
            style={{ color: pendingApprovals.length > 0 ? 'var(--cp-amber)' : 'var(--cp-cyan)' }}
          >
            {pendingApprovals.length > 0 ? 'Review now' : 'Go to feedback'}
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Upcoming milestones */}
        <div className="cp-card p-5 sm:p-6 flex flex-col gap-3.5 h-full">
          <div className="flex items-center gap-2.5">
            <CalendarClock className="w-4.5 h-4.5" style={{ color: 'var(--cp-cyan)' }} />
            <SectionLabel>Upcoming Milestones</SectionLabel>
          </div>
          {upcomingMilestones.length > 0 ? (
            <div className="flex flex-col gap-3">
              {upcomingMilestones.map((m: any) => (
                <div key={m.id} className="flex items-start gap-2.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                    style={{ background: m.status === 'in-progress' ? 'var(--cp-cyan)' : 'var(--cp-border-strong)' }}
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--cp-text)' }}>
                      {m.name || m.title}
                    </p>
                    <p className="text-[11.5px]" style={{ color: 'var(--cp-text-muted)' }}>
                      {m.date_range || 'Date to be confirmed'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--cp-text-faint)' }} />
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--cp-text-muted)' }}>
                Your next milestones will appear here once they&apos;re scheduled.
              </p>
            </div>
          )}
          <Link
            href={`/client/${code}/timeline`}
            className="group inline-flex items-center gap-1.5 text-[12.5px] font-semibold mt-auto pt-2"
            style={{ color: 'var(--cp-cyan)' }}
          >
            View full timeline
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Team members */}
        <div className="cp-card p-5 sm:p-6 flex flex-col gap-3.5 h-full md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <Users className="w-4.5 h-4.5" style={{ color: 'var(--cp-cyan)' }} />
            <SectionLabel>Team Members</SectionLabel>
          </div>
          {team.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {team.slice(0, 4).map((t: any) => {
                const tm = t.team_members || {}
                return (
                  <div key={t.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10.5px] font-bold"
                      style={{ background: 'var(--cp-cyan-soft)', color: 'var(--cp-cyan)' }}
                    >
                      {tm.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--cp-text)' }}>{tm.name}</p>
                      <p className="text-[11.5px] truncate" style={{ color: 'var(--cp-text-muted)' }}>{t.role_on_project || tm.role}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--cp-text-muted)' }}>
              Your team will be introduced here soon.
            </p>
          )}
          <Link
            href={`/client/${code}/team`}
            className="group inline-flex items-center gap-1.5 text-[12.5px] font-semibold mt-auto pt-2"
            style={{ color: 'var(--cp-cyan)' }}
          >
            Meet the team
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, ease: EASE_OUT }}
        className="pb-10 sm:pb-14 border-b"
        style={DIVIDER}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4" style={{ color: 'var(--cp-cyan)' }} />
            <h3 className="text-[15px] font-bold" style={{ color: 'var(--cp-text)' }}>
              Recent Activity
            </h3>
          </div>
          <Link href={`/client/${code}/development`} className="text-[12.5px] font-medium transition-colors" style={{ color: 'var(--cp-text-muted)' }}>
            View all
          </Link>
        </div>

        {recentActivity.length > 0 ? (
          <div className="flex flex-col">
            {recentActivity.map((activity: any, i: number) => (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 + i * 0.06, ease: EASE_OUT }}
                key={activity.id ?? i}
                className={`flex items-center gap-3.5 py-3.5 ${i < recentActivity.length - 1 ? 'border-b' : ''}`}
                style={DIVIDER}
              >
                <activity.icon className="w-4 h-4 shrink-0" style={{ color: TONE_TEXT[activity.tone as PortalTone] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-medium truncate" style={{ color: 'var(--cp-text-secondary)' }}>
                    {activity.action_text}
                  </p>
                  <span className="text-[11.5px]" style={{ color: 'var(--cp-text-faint)' }}>
                    {activity.label}
                  </span>
                </div>
                <span className="text-[12px] shrink-0 tabular-nums" style={{ color: 'var(--cp-text-muted)' }}>
                  {activity.time}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 py-2">
            <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--cp-text-faint)' }} />
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--cp-text-muted)' }}>
              No updates yet — as your team makes progress, updates will show up here.
            </p>
          </div>
        )}
      </motion.div>

    </div>
  )
}
