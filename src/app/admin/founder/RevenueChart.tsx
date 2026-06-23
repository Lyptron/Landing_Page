'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useChartTheme, tooltipContentStyle, tooltipLabelStyle, tooltipItemStyle } from '@/lib/theme/chartTheme'

interface RevenuePoint {
  name: string
  revenue: number
}

export default function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const chartTheme = useChartTheme()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartTheme.series[0]} stopOpacity={0.25} />
            <stop offset="95%" stopColor={chartTheme.series[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
        <XAxis dataKey="name" stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} />
        <YAxis stroke={chartTheme.axis} fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} width={35} />
        <Tooltip
          contentStyle={tooltipContentStyle(chartTheme)}
          labelStyle={tooltipLabelStyle(chartTheme)}
          itemStyle={tooltipItemStyle(chartTheme)}
          formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
        />
        <Area type="monotone" dataKey="revenue" stroke={chartTheme.series[0]} strokeWidth={1.5} fillOpacity={1} fill="url(#colorRevenue)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
