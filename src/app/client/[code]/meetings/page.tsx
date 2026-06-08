'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Video, Clock, ExternalLink, PlayCircle, CalendarOff } from 'lucide-react'
import { fetchMeetings, fetchProjectByAccessCode } from '@/lib/db'

export default function MeetingsPage() {
  const params = useParams()
  const code = params.code as string
  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: project } = await fetchProjectByAccessCode(code)
      if (project) {
        const { data } = await fetchMeetings(project.id)
        if (data && data.length > 0) setMeetings(data)
      }
      setLoading(false)
    }
    load()
  }, [code])

  const upcoming = meetings.filter((m) => m.type === 'upcoming')
  const past = meetings.filter((m) => m.type === 'past')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white/90 mb-1">Meetings</h1>
        <p className="text-white/25 text-[13px]">Join calls, view recordings, and review meeting notes.</p>
      </div>

      {meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CalendarOff className="w-12 h-12 text-white/[0.05] mb-4" />
          <h3 className="text-base font-semibold text-white/30 mb-1">No meetings scheduled</h3>
          <p className="text-[13px] text-white/15">Upcoming calls and past recordings will appear here.</p>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[9px] font-mono uppercase tracking-[0.2em] text-blue-400/40">Upcoming</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {upcoming.map((meet, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    key={meet.id}
                    className="p-5 rounded-2xl relative overflow-hidden"
                    style={{ background: 'rgba(59,130,246,0.025)', border: '1px solid rgba(59,130,246,0.1)' }}
                  >
                    <div className="absolute top-0 left-[15%] right-[15%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent)' }} />
                    <div className="flex justify-between items-start mb-4">
                      <Video className="w-5 h-5 text-blue-400/50" />
                      <div className="text-right">
                        <span className="text-[9px] font-mono text-white/15 uppercase tracking-[0.15em] block">
                          {meet.meeting_date ? new Date(meet.meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                        </span>
                        <span className="text-[12px] font-medium text-white/60 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-400/40" /> {meet.meeting_time || meet.time}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-[16px] font-bold text-white/80 mb-4">{meet.title}</h3>
                    <a
                      href={meet.link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-[#050505] font-semibold text-[11px] rounded-xl transition-all hover:bg-white/90"
                      style={{ boxShadow: '0 0 12px rgba(255,255,255,0.05)' }}
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
            <div className="flex flex-col gap-3">
              <h2 className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/15">Past Recordings</h2>
              {past.map((meet, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  key={meet.id}
                  className="p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div>
                    <h4 className="text-[13px] font-medium text-white/70">{meet.title}</h4>
                    {meet.notes && <p className="text-[11px] text-white/25 mt-0.5">{meet.notes}</p>}
                    <span className="text-[9px] font-mono text-white/10 uppercase tracking-[0.15em]">
                      {meet.meeting_date ? new Date(meet.meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                  {(meet.recording_url || meet.recording) && (
                    <a
                      href={meet.recording_url || meet.recording}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-medium text-white/40 hover:text-white/70 transition-colors shrink-0"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <PlayCircle className="w-3.5 h-3.5" /> Watch
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
