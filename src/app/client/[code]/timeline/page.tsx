'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock, FileText, Map } from 'lucide-react'
import { fetchProjectByAccessCode } from '@/lib/db'
import { PageHeader, EmptyState, Loading, SectionLabel, Badge } from '@/components/portal/PortalUI'

export default function ClientTimelinePage() {
  const params = useParams()
  const code = params.code as string
  const [milestones, setMilestones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await fetchProjectByAccessCode(code)
      if (!error && data?.milestones?.length > 0) setMilestones(data.milestones)
      setLoading(false)
    }
    load()
  }, [code])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle2, color: 'var(--cp-emerald)' }
      case 'in-progress':
        return { icon: Clock, color: 'var(--cp-cyan)' }
      default:
        return { icon: Circle, color: 'var(--cp-text-faint)' }
    }
  }

  if (loading) return <Loading />

  return (
    <div className="flex flex-col gap-10 max-w-3xl">
      <PageHeader title="Project Timeline" description="See where your project stands today and what's coming up next." />

      {milestones.length === 0 ? (
        <EmptyState
          icon={Map}
          title="Your timeline is being put together"
          description="Once your project plan is ready, every phase and milestone will appear here so you can follow along."
        />
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: 'var(--cp-border-soft)' }} />

          <div className="flex flex-col gap-8">
            {milestones.map((milestone, idx) => {
              const config = getStatusConfig(milestone.status)
              const isActive = milestone.status === 'in-progress'
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  key={milestone.id}
                  className="relative flex gap-6"
                >
                  {/* Dot */}
                  <div
                    className="relative z-10 w-4 h-4 mt-1 shrink-0"
                    style={{
                      background: isActive ? config.color : 'var(--cp-bg)',
                      border: `1px solid ${config.color}`,
                    }}
                  />

                  {/* Content */}
                  <div className={`flex-1 ${isActive ? 'cp-card cp-card-accent pl-5 py-1' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <div>
                        {milestone.phase && <SectionLabel>{milestone.phase} Phase</SectionLabel>}
                        <h3
                          className="text-[17px] font-bold mt-1 flex items-center gap-2.5"
                          style={{ color: milestone.status === 'upcoming' ? 'var(--cp-text-muted)' : 'var(--cp-text)' }}
                        >
                          <config.icon className="w-4 h-4" style={{ color: config.color }} />
                          {milestone.name || milestone.title}
                        </h3>
                      </div>
                      <span className="text-[12px] font-medium shrink-0 mt-1" style={{ color: 'var(--cp-text-muted)' }}>
                        {milestone.date_range || milestone.date || ''}
                      </span>
                    </div>

                    {milestone.description && (
                      <p className="text-[13.5px] leading-relaxed mb-4 pl-[26px]" style={{ color: 'var(--cp-text-secondary)' }}>
                        {milestone.description}
                      </p>
                    )}

                    {milestone.deliverables && milestone.deliverables.length > 0 && (
                      <div className="flex flex-wrap gap-x-5 gap-y-2 pl-[26px]">
                        {milestone.deliverables.map((item: string, i: number) => (
                          <Badge key={i} tone={milestone.status === 'completed' ? 'emerald' : 'neutral'} icon={milestone.status === 'completed' ? CheckCircle2 : FileText}>
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
