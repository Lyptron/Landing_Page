'use client'
import { motion } from 'framer-motion'
import { Video, Clock, ExternalLink, PlayCircle, CalendarOff } from 'lucide-react'
import { fetchMeetings } from '@/lib/db'
import { PageHeader, EmptyState, Loading, SectionLabel } from '@/components/portal/PortalUI'
import { useClientPortalProject } from '@/hooks/useClientPortalProject'

async function loadMeetings(projectId: string) {
  const { data } = await fetchMeetings(projectId)
  return { data: data ?? [] }
}

export default function MeetingsPage() {
  const { resource, loading } = useClientPortalProject(loadMeetings)
  const meetings = resource ?? []
  const upcoming = meetings.filter((m: any) => m.type === 'upcoming')
  const past = meetings.filter((m: any) => m.type === 'past')

  if (loading) return <Loading />

  return (
    <div className="flex flex-col gap-12 max-w-4xl">
      <PageHeader title="Meetings" description="Join upcoming calls, and revisit notes and recordings from past meetings." />

      {meetings.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="No meetings scheduled"
          description="Upcoming calls and past recordings will appear here once your team schedules a meeting."
        />
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="flex flex-col gap-5">
              <SectionLabel tone="cyan">Upcoming</SectionLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {upcoming.map((meet, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    key={meet.id}
                    className="cp-card cp-card-accent pl-5 py-1 flex flex-col gap-5"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Video className="w-4 h-4 shrink-0" style={{ color: 'var(--cp-cyan)' }} />
                        <SectionLabel tone="cyan">Meeting</SectionLabel>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[12px] font-medium block" style={{ color: 'var(--cp-text-muted)' }}>
                          {meet.meeting_date ? new Date(meet.meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                        </span>
                        <span className="text-[12.5px] font-semibold flex items-center justify-end gap-1 mt-0.5 tabular-nums" style={{ color: 'var(--cp-text)' }}>
                          <Clock className="w-3 h-3" style={{ color: 'var(--cp-cyan)' }} /> {meet.meeting_time || meet.time}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-[17px] font-bold leading-snug" style={{ color: 'var(--cp-text)' }}>{meet.title}</h3>
                    <a
                      href={meet.link}
                      target="_blank"
                      rel="noreferrer"
                      className="cp-btn-primary flex items-center justify-center gap-2 w-full py-2.5 text-[12.5px]"
                    >
                      Join Meeting <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div className="flex flex-col gap-4">
              <SectionLabel>Past Meetings</SectionLabel>
              <div className="flex flex-col">
                {past.map((meet, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    key={meet.id}
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 ${idx < past.length - 1 ? 'border-b' : ''}`}
                    style={{ borderColor: 'var(--cp-border-soft)' }}
                  >
                    <div>
                      <h4 className="text-[13.5px] font-medium" style={{ color: 'var(--cp-text-secondary)' }}>{meet.title}</h4>
                      {meet.notes && <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--cp-text-muted)' }}>{meet.notes}</p>}
                      <span className="text-[12px]" style={{ color: 'var(--cp-text-faint)' }}>
                        {meet.meeting_date ? new Date(meet.meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                    {(meet.recording_url || meet.recording) && (
                      <a
                        href={meet.recording_url || meet.recording}
                        target="_blank"
                        rel="noreferrer"
                        className="cp-btn-secondary flex items-center gap-1.5 px-4 py-2 text-[12px] shrink-0"
                      >
                        <PlayCircle className="w-3.5 h-3.5" /> Watch
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
