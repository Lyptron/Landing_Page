'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts'
import { useChartTheme, tooltipContentStyle } from '@/lib/theme/chartTheme'

interface SourcePoint {
  source: string
  count: number
}

export function SourceBarChart({ data }: { data: SourcePoint[] }) {
  const chartTheme = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
        <XAxis dataKey="source" tick={{ fill: chartTheme.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: chartTheme.axis, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipContentStyle(chartTheme)} cursor={{ fill: chartTheme.cursorFill }} />
        <Bar dataKey="count" fill={chartTheme.series[0]} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface FunnelPoint {
  name: string
  value: number
  fill?: string
}

export function LeadFunnelChart({ data }: { data: FunnelPoint[] }) {
  const chartTheme = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <FunnelChart>
        <Tooltip contentStyle={tooltipContentStyle(chartTheme)} />
        <Funnel dataKey="value" data={data} isAnimationActive>
          <LabelList position="right" fill={chartTheme.tooltipItem} stroke="none" dataKey="name" fontSize={11} />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  )
}
