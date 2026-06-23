'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useChartTheme, tooltipContentStyle, tooltipLabelStyle, tooltipItemStyle } from '@/lib/theme/chartTheme'

interface MrrPoint {
  name: string
  mrr: number
  expenses: number
}

export default function MrrChart({ data }: { data: MrrPoint[] }) {
  const chartTheme = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartTheme.series[0]} stopOpacity={0.25} />
            <stop offset="95%" stopColor={chartTheme.series[0]} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartTheme.series[2]} stopOpacity={0.2} />
            <stop offset="95%" stopColor={chartTheme.series[2]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
        <XAxis dataKey="name" stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} />
        <YAxis stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} width={40} />
        <Tooltip
          contentStyle={tooltipContentStyle(chartTheme)}
          labelStyle={tooltipLabelStyle(chartTheme)}
          itemStyle={tooltipItemStyle(chartTheme)}
          formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN')}`, name === 'mrr' ? 'Revenue' : 'Expenses']}
        />
        <Area type="monotone" dataKey="mrr" stroke={chartTheme.series[0]} strokeWidth={1.5} fillOpacity={1} fill="url(#colorMrr)" dot={false} />
        <Area type="monotone" dataKey="expenses" stroke={chartTheme.series[2]} strokeWidth={1} fillOpacity={1} fill="url(#colorExp)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
