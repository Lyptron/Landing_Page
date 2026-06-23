'use client'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useChartTheme, tooltipContentStyle, tooltipLabelStyle, tooltipItemStyle } from '@/lib/theme/chartTheme'
import { priorityStyle } from '@/lib/badges'

type Money = number
interface NamedRow {
  name: string
  [key: string]: unknown
}

function useTipStyle() {
  const theme = useChartTheme()
  return {
    theme,
    tip: {
      contentStyle: tooltipContentStyle(theme),
      labelStyle: tooltipLabelStyle(theme),
      itemStyle: tooltipItemStyle(theme),
    },
  }
}

const fmtINR = (val: unknown) => `₹${Number(val).toLocaleString('en-IN')}`

export function RevenueExpensesChart({ data }: { data: NamedRow[] }) {
  const { theme, tip } = useTipStyle()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.series[0]} stopOpacity={0.25} />
            <stop offset="95%" stopColor={theme.series[0]} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.series[2]} stopOpacity={0.2} />
            <stop offset="95%" stopColor={theme.series[2]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
        <XAxis dataKey="name" stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} />
        <YAxis stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(Number(v) / 100000).toFixed(0)}L`} width={40} />
        <Tooltip {...tip} formatter={(value, name) => [fmtINR(value), name === 'mrr' ? 'Revenue' : 'Expenses']} />
        <Area type="monotone" dataKey="mrr" stroke={theme.series[0]} strokeWidth={1.5} fillOpacity={1} fill="url(#colorMrr)" dot={false} />
        <Area type="monotone" dataKey="expenses" stroke={theme.series[2]} strokeWidth={1} fillOpacity={1} fill="url(#colorExp)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function ProfitBarChart({ data }: { data: NamedRow[] }) {
  const { theme, tip } = useTipStyle()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
        <XAxis dataKey="name" stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} />
        <YAxis stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(Number(v) / 100000).toFixed(0)}L`} width={40} />
        <Tooltip {...tip} formatter={(value) => [fmtINR(value), 'Profit']} />
        <Bar dataKey="profit" fill={theme.series[1]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SubCategoryBarChart({ data }: { data: NamedRow[] }) {
  const { theme, tip } = useTipStyle()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
        <XAxis dataKey="name" stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} />
        <YAxis stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} width={50} />
        <Tooltip {...tip} formatter={(value) => [fmtINR(value), 'Monthly Cost']} />
        <Bar dataKey="total" fill={theme.series[2]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RevenueTrendChart({ data }: { data: NamedRow[] }) {
  const { theme, tip } = useTipStyle()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorMrr2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.series[0]} stopOpacity={0.25} />
            <stop offset="95%" stopColor={theme.series[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
        <XAxis dataKey="name" stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} />
        <YAxis stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(Number(v) / 100000).toFixed(0)}L`} width={40} />
        <Tooltip {...tip} formatter={(value) => [fmtINR(value), 'Revenue']} />
        <Area type="monotone" dataKey="mrr" stroke={theme.series[0]} strokeWidth={1.5} fillOpacity={1} fill="url(#colorMrr2)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function CampaignBarChart({ data }: { data: NamedRow[] }) {
  const { theme, tip } = useTipStyle()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
        <XAxis dataKey="name" stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
        <YAxis stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} width={30} />
        <Tooltip {...tip} formatter={(value) => [value, 'Leads Generated']} />
        <Bar dataKey="leads" fill={theme.series[0]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function LeadGenChart({ data }: { data: NamedRow[] }) {
  const { theme, tip } = useTipStyle()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.series[0]} stopOpacity={0.25} />
            <stop offset="95%" stopColor={theme.series[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
        <XAxis dataKey="name" stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} />
        <YAxis stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
        <Tooltip {...tip} formatter={(value) => [value, 'New Leads']} />
        <Area type="monotone" dataKey="count" stroke={theme.series[0]} strokeWidth={1.5} fillOpacity={1} fill="url(#colorLeads)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface FunnelStageRow {
  stage: string
  count: number
}

export function FunnelStageBarChart({ data }: { data: FunnelStageRow[] }) {
  const { theme, tip } = useTipStyle()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
        <XAxis dataKey="stage" stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
        <Tooltip {...tip} formatter={(value) => [value, 'Leads']} />
        <Bar dataKey="count" fill={theme.series[0]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

const PRIORITY_KEYS = ['critical', 'high', 'medium', 'low'] as const

interface PipelineRow {
  stage: string
  critical: number
  high: number
  medium: number
  low: number
}

export function PipelineStackedChart({ data }: { data: PipelineRow[] }) {
  const { theme, tip } = useTipStyle()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
        <XAxis dataKey="stage" stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
        <Tooltip {...tip} />
        {PRIORITY_KEYS.map((p) => (
          <Bar key={p} dataKey={p} stackId="priority" name={priorityStyle(p).label} fill={priorityStyle(p).color} radius={p === 'critical' ? [4, 4, 0, 0] : undefined} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

interface SlaRow {
  name: string
  Leads: number
  Tasks: number
}

export function SlaBarChart({ data }: { data: SlaRow[] }) {
  const { theme, tip } = useTipStyle()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
        <XAxis dataKey="name" stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} />
        <YAxis stroke={theme.axis} fontSize={9} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
        <Tooltip {...tip} />
        <Bar dataKey="Leads" fill={theme.series[0]} radius={[4, 4, 0, 0]} />
        <Bar dataKey="Tasks" fill={theme.series[3]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface CategoricalRow {
  name: string
  value: Money
  color: string
}

export function CategoricalDonut({ data }: { data: CategoricalRow[] }) {
  const { tip } = useTipStyle()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip {...tip} />
      </PieChart>
    </ResponsiveContainer>
  )
}
