'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Users, TrendingUp, BarChart3 } from 'lucide-react'
import { fetchProjects, fetchClients, fetchLeads, fetchTeamMembers } from '@/lib/db'

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ projects: 0, activeProjects: 0, clients: 0, leads: 0, pipelineValue: 0, teamSize: 0 })
  const [projectsByStatus, setProjectsByStatus] = useState<Record<string, number>>({})
  const [leadsByStage, setLeadsByStage] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [projRes, clientRes, leadRes, teamRes] = await Promise.all([
        fetchProjects(), fetchClients(), fetchLeads(), fetchTeamMembers(),
      ])

      const projects = projRes.data || []
      const clients = clientRes.data || []
      const leads = leadRes.data || []
      const team = teamRes.data || []

      setStats({
        projects: projects.length,
        activeProjects: projects.filter((p: any) => p.status === 'in-progress').length,
        clients: clients.length,
        leads: leads.length,
        pipelineValue: leads.reduce((acc: number, l: any) => acc + (l.value || 0), 0),
        teamSize: team.length,
      })

      // Group projects by status
      const pByStatus: Record<string, number> = {}
      projects.forEach((p: any) => { pByStatus[p.status || 'unknown'] = (pByStatus[p.status || 'unknown'] || 0) + 1 })
      setProjectsByStatus(pByStatus)

      // Group leads by stage
      const lByStage: Record<string, number> = {}
      leads.forEach((l: any) => { lByStage[l.stage || 'unknown'] = (lByStage[l.stage || 'unknown'] || 0) + 1 })
      setLeadsByStage(lByStage)

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-5 h-5 border-2 border-(--cp-border) border-t-(--cp-text-muted) rounded-full animate-spin" />
      </div>
    )
  }

  const maxProjectCount = Math.max(...Object.values(projectsByStatus), 1)
  const maxLeadCount = Math.max(...Object.values(leadsByStage), 1)

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-(--cp-text)">Analytics</h1>
        <p className="text-(--cp-text-faint) text-[13px] mt-0.5">Agency performance at a glance.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total Projects', value: stats.projects, icon: BarChart3 },
          { label: 'Active', value: stats.activeProjects, icon: Activity },
          { label: 'Clients', value: stats.clients, icon: Users },
          { label: 'Leads', value: stats.leads, icon: TrendingUp },
          { label: 'Pipeline', value: `₹${(stats.pipelineValue / 1000).toFixed(0)}k`, icon: TrendingUp },
          { label: 'Team Size', value: stats.teamSize, icon: Users },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-4 rounded-2xl"
            style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <kpi.icon className="w-3 h-3 text-(--cp-text-faint)" />
              <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-(--cp-text-faint)">{kpi.label}</p>
            </div>
            <p className="text-[24px] font-display font-bold tracking-tight text-(--cp-text)">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Projects by Status */}
        <div className="p-5 rounded-2xl" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
          <h3 className="text-[13px] font-bold text-(--cp-text-secondary) mb-5">Projects by Status</h3>
          {Object.keys(projectsByStatus).length === 0 ? (
            <div className="py-10 text-center">
              <BarChart3 className="w-8 h-8 text-(--cp-text-faint) mx-auto mb-2" />
              <p className="text-[12px] text-(--cp-text-faint)">No project data.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(projectsByStatus).map(([status, count], i) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-[11px] text-(--cp-text-muted) w-24 shrink-0 capitalize">{status.replace('-', ' ')}</span>
                  <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: 'var(--cp-surface)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxProjectCount) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-lg flex items-center justify-end pr-2"
                      style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--cp-text) 8%, transparent), color-mix(in srgb, var(--cp-text) 20%, transparent))' }}
                    >
                      <span className="text-[10px] font-mono font-bold text-(--cp-text-secondary)">{count}</span>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leads by Stage */}
        <div className="p-5 rounded-2xl" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border-soft)' }}>
          <h3 className="text-[13px] font-bold text-(--cp-text-secondary) mb-5">Leads by Stage</h3>
          {Object.keys(leadsByStage).length === 0 ? (
            <div className="py-10 text-center">
              <TrendingUp className="w-8 h-8 text-(--cp-text-faint) mx-auto mb-2" />
              <p className="text-[12px] text-(--cp-text-faint)">No lead data.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(leadsByStage).map(([stage, count], i) => (
                <div key={stage} className="flex items-center gap-3">
                  <span className="text-[11px] text-(--cp-text-muted) w-28 shrink-0 truncate">{stage}</span>
                  <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: 'var(--cp-surface)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxLeadCount) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-lg flex items-center justify-end pr-2"
                      style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--cp-text) 8%, transparent), color-mix(in srgb, var(--cp-text) 20%, transparent))' }}
                    >
                      <span className="text-[10px] font-mono font-bold text-(--cp-text-secondary)">{count}</span>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
