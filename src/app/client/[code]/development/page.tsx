'use client'
import { motion } from 'framer-motion'
import { Hammer, Globe, FlaskConical, Activity, ExternalLink } from 'lucide-react'
import { PageHeader, EmptyState, Loading, SectionLabel, Badge } from '@/components/portal/PortalUI'
import { useClientPortalProject } from '@/hooks/useClientPortalProject'
import { safeHttpUrl } from '@/lib/safeUrl'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function ClientDevelopmentPage() {
  const { project, loading } = useClientPortalProject()
  const updates = (project?.activities ?? [])
    .filter((a: any) => a.type === 'commit')
    .slice(0, 10)
    .map((a: any) => ({ id: a.id, msg: a.action_text, dev: a.actor_name, time: timeAgo(a.created_at) }))
  const deployments = project?.deployments ?? []

  if (loading) return <Loading />

  const hasData = updates.length > 0 || deployments.length > 0

  return (
    <div className="flex flex-col gap-10">
      <PageHeader title="Development Updates" description="A look at the work your team has been doing, and where you can see it live." />

      {!hasData ? (
        <EmptyState
          icon={Hammer}
          title="No development updates yet"
          description="As your team makes progress, recent work and live versions of your project will show up here."
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Recent work */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <Hammer className="w-4 h-4" style={{ color: 'var(--cp-cyan)' }} />
              <h3 className="text-[15px] font-bold" style={{ color: 'var(--cp-text)' }}>Recent Work</h3>
            </div>

            {updates.length > 0 ? (
              <div className="flex flex-col">
                {updates.map((update, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    key={update.id}
                    className={`py-4 ${idx < updates.length - 1 ? 'border-b' : ''}`}
                    style={{ borderColor: 'var(--cp-border-soft)' }}
                  >
                    <p className="text-[13.5px] font-medium mb-2" style={{ color: 'var(--cp-text-secondary)' }}>{update.msg}</p>
                    <div className="flex justify-between items-center text-[11px]" style={{ color: 'var(--cp-text-faint)' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--cp-cyan)' }}>
                          {update.dev?.charAt(0)}
                        </span>
                        <span>{update.dev}</span>
                      </div>
                      <span className="tabular-nums">{update.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] py-6" style={{ color: 'var(--cp-text-muted)' }}>No work logged yet.</p>
            )}
          </div>

          {/* Live versions */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4" style={{ color: 'var(--cp-emerald)' }} />
              <h3 className="text-[15px] font-bold" style={{ color: 'var(--cp-text)' }}>Where to See It</h3>
            </div>

            {deployments.length > 0 ? (
              <div className="flex flex-col gap-6">
                {deployments.map((dep, idx) => {
                  const isProd = (dep.environment || dep.env) === 'Production'
                  const EnvIcon = isProd ? Globe : FlaskConical
                  const envColor = isProd ? 'var(--cp-emerald)' : 'var(--cp-cyan)'
                  const deploymentUrl = safeHttpUrl(dep.url)
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      key={dep.id}
                      className="cp-card cp-card-accent pl-5 py-1 flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-2.5">
                          <EnvIcon className="w-4 h-4" style={{ color: envColor }} />
                          <div>
                            <h4 className="text-[13.5px] font-bold" style={{ color: 'var(--cp-text)' }}>{dep.environment || dep.env}</h4>
                            <span className="text-[11px]" style={{ color: 'var(--cp-text-faint)' }}>
                              {dep.version} {dep.deployed_at ? `· ${timeAgo(dep.deployed_at)}` : ''}
                            </span>
                          </div>
                        </div>
                        {dep.status === 'success' && (
                          <Badge tone="emerald">Live</Badge>
                        )}
                        {dep.status === 'building' && (
                          <Badge tone="cyan" icon={Activity}>In Progress</Badge>
                        )}
                      </div>
                      {deploymentUrl && (
                        <a
                          href={deploymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between gap-2 mt-1"
                        >
                          <span className="text-[12px] truncate transition-colors group-hover:underline" style={{ color: 'var(--cp-cyan)' }}>{deploymentUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cp-text-faint)' }} />
                        </a>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <p className="text-[13px] py-6" style={{ color: 'var(--cp-text-muted)' }}>Nothing live yet.</p>
            )}
          </div>
        </div>
      )}

      {!hasData && <SectionLabel>Updates appear here automatically as your team works</SectionLabel>}
    </div>
  )
}
