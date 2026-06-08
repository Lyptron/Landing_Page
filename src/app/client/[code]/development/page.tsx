'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { GitCommit, GitBranch, TerminalSquare, Zap, Activity, CheckCircle2, ExternalLink, Code2 } from 'lucide-react'
import { fetchActivities, fetchDeployments, fetchProjectByAccessCode } from '@/lib/db'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function ClientDevelopmentPage() {
  const params = useParams()
  const code = params.code as string
  const [commits, setCommits] = useState<any[]>([])
  const [deployments, setDeployments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: project } = await fetchProjectByAccessCode(code)
      if (project) {
        const [actRes, depRes] = await Promise.all([fetchActivities(project.id, 10), fetchDeployments(project.id)])
        if (!actRes.error && actRes.data?.length) {
          setCommits(
            actRes.data
              .filter((a: any) => a.type === 'commit')
              .map((a: any) => ({
                id: a.id,
                hash: (a.metadata as any)?.commit_hash || 'abc1234',
                msg: a.action_text,
                dev: a.actor_name,
                time: timeAgo(a.created_at),
              }))
          )
        }
        if (!depRes.error && depRes.data?.length) setDeployments(depRes.data)
      }
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

  const hasData = commits.length > 0 || deployments.length > 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white/90 mb-1">Development</h1>
        <p className="text-white/25 text-[13px]">Engineering progress, commits, and live deployments.</p>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Code2 className="w-12 h-12 text-white/[0.05] mb-4" />
          <h3 className="text-base font-semibold text-white/30 mb-1">No development activity yet</h3>
          <p className="text-[13px] text-white/15">Commits, deployments, and build activity will show up here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Commits */}
          <div className="p-5 rounded-2xl flex flex-col" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2.5 mb-4">
              <GitCommit className="w-4 h-4 text-white/30" />
              <h3 className="text-[14px] font-bold text-white/80">Latest Commits</h3>
            </div>

            {commits.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {commits.map((commit, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    key={commit.id}
                    className="p-3.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[13px] text-white/70 font-medium">{commit.msg}</p>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded text-white/20 shrink-0 ml-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        {commit.hash?.slice(0, 7)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-white/20">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-blue-500/60 to-purple-600/60 flex items-center justify-center text-[7px] font-bold text-white">
                          {commit.dev?.charAt(0)}
                        </div>
                        <span>{commit.dev}</span>
                      </div>
                      <span>{commit.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-white/20 py-6 text-center">No commits yet.</p>
            )}
          </div>

          {/* Deployments */}
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2.5 mb-4">
                <Zap className="w-4 h-4 text-white/30" />
                <h3 className="text-[14px] font-bold text-white/80">Environments</h3>
              </div>

              {deployments.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {deployments.map((dep, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      key={dep.id}
                      className="p-4 rounded-xl border border-white/[0.03] relative overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.01)' }}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${dep.status === 'success' ? 'bg-emerald-500/50' : 'bg-blue-500/50 animate-pulse'}`} />
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${(dep.environment || dep.env) === 'Production' ? 'bg-purple-500/[0.06] text-purple-400' : 'bg-blue-500/[0.06] text-blue-400'}`}>
                            {(dep.environment || dep.env) === 'Production' ? <TerminalSquare className="w-3.5 h-3.5" /> : <GitBranch className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <h4 className="text-[13px] font-bold text-white/80">{dep.environment || dep.env}</h4>
                            <span className="text-[9px] font-mono text-white/20">{dep.version} &bull; {dep.deployed_at ? timeAgo(dep.deployed_at) : ''}</span>
                          </div>
                        </div>
                        {dep.status === 'success' && (
                          <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.15em] text-emerald-400 font-bold font-mono">
                            <CheckCircle2 className="w-3 h-3" /> Live
                          </span>
                        )}
                        {dep.status === 'building' && (
                          <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.15em] text-blue-400 font-bold font-mono">
                            <Activity className="w-3 h-3 animate-pulse" /> Building
                          </span>
                        )}
                      </div>
                      {dep.url && (
                        <a
                          href={dep.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors group"
                          style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)' }}
                        >
                          <span className="text-[11px] text-blue-400/60 group-hover:text-blue-400 truncate">{dep.url}</span>
                          <ExternalLink className="w-3 h-3 text-white/15 shrink-0 ml-2" />
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-white/20 py-6 text-center">No deployments yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
