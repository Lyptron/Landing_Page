// Shared style helpers for non-monetary operational signals
// (Lead Priority, Quality Score, Follow-up Urgency, SLA Risk, Client Tier, Project Health)
// used across CRM, Marketing, Leads, Tasks, and Clients pages.

export type BadgeStyle = { label: string; color: string; bg: string; border: string }

const NEUTRAL: BadgeStyle = { label: '', color: 'var(--cp-text-faint)', bg: 'var(--cp-bg-soft)', border: 'var(--cp-border)' }

export function priorityStyle(priority: string | null | undefined): BadgeStyle {
  switch (priority) {
    case 'critical': return { label: 'Critical', color: 'var(--cp-red)', bg: 'var(--cp-red-soft)', border: 'var(--cp-red-border)' }
    case 'high': return { label: 'High', color: 'var(--cp-amber)', bg: 'var(--cp-amber-soft)', border: 'var(--cp-amber-border)' }
    case 'low': return { ...NEUTRAL, label: 'Low' }
    default: return { label: 'Medium', color: 'var(--cp-cyan)', bg: 'var(--cp-cyan-soft)', border: 'var(--cp-cyan-border)' }
  }
}

export function followupUrgency(dateStr: string | null | undefined): BadgeStyle | null {
  if (!dateStr) return null
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
  if (days < 0) return { label: 'Urgent', color: 'var(--cp-red)', bg: 'var(--cp-red-soft)', border: 'var(--cp-red-border)' }
  if (days === 0) return { label: 'High', color: 'var(--cp-amber)', bg: 'var(--cp-amber-soft)', border: 'var(--cp-amber-border)' }
  if (days <= 3) return { label: 'Medium', color: 'var(--cp-cyan)', bg: 'var(--cp-cyan-soft)', border: 'var(--cp-cyan-border)' }
  return { label: 'Low', color: 'var(--cp-emerald)', bg: 'var(--cp-emerald-soft)', border: 'var(--cp-emerald-border)' }
}

export function qualityColor(score: number | null | undefined): string {
  const s = score ?? 50
  if (s >= 75) return 'var(--cp-emerald)'
  if (s >= 50) return 'var(--cp-cyan)'
  if (s >= 25) return 'var(--cp-amber)'
  return 'var(--cp-red)'
}

/** SLA Risk badge derived from a due date + completion status. */
export function slaRiskStyle(dueDate: string | null | undefined, isDone = false): BadgeStyle {
  if (!dueDate) return { ...NEUTRAL, label: 'No SLA' }
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000)
  if (days < 0 && !isDone) return { label: 'Breached', color: 'var(--cp-red)', bg: 'var(--cp-red-soft)', border: 'var(--cp-red-border)' }
  if (days <= 1 && !isDone) return { label: 'At Risk', color: 'var(--cp-amber)', bg: 'var(--cp-amber-soft)', border: 'var(--cp-amber-border)' }
  return { label: 'On Time', color: 'var(--cp-emerald)', bg: 'var(--cp-emerald-soft)', border: 'var(--cp-emerald-border)' }
}

export function clientTierStyle(tier: string | null | undefined): BadgeStyle {
  switch (tier) {
    case 'enterprise': return { label: 'Enterprise', color: 'var(--cp-violet)', bg: 'var(--cp-violet-soft)', border: 'var(--cp-violet-border)' }
    case 'growth': return { label: 'Growth', color: 'var(--cp-cyan)', bg: 'var(--cp-cyan-soft)', border: 'var(--cp-cyan-border)' }
    default: return { ...NEUTRAL, label: 'Starter' }
  }
}

export function projectHealthStyle(health: string | null | undefined): BadgeStyle {
  switch (health) {
    case 'at-risk': return { label: 'At Risk', color: 'var(--cp-amber)', bg: 'var(--cp-amber-soft)', border: 'var(--cp-amber-border)' }
    case 'delayed': return { label: 'Delayed', color: 'var(--cp-red)', bg: 'var(--cp-red-soft)', border: 'var(--cp-red-border)' }
    default: return { label: 'On Track', color: 'var(--cp-emerald)', bg: 'var(--cp-emerald-soft)', border: 'var(--cp-emerald-border)' }
  }
}
