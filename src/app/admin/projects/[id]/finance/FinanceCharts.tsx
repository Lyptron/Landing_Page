'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useChartTheme, tooltipContentStyle, tooltipLabelStyle, tooltipItemStyle } from '@/lib/theme/chartTheme'

type Slice = { name: string; value: number; color: string }

export default function FinanceCharts({ data, emptyLabel }: { data: Slice[]; emptyLabel: string }) {
  const theme = useChartTheme()
  if (data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-[11px] text-(--cp-text-faint) italic">
        {emptyLabel}
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipContentStyle(theme)}
          labelStyle={tooltipLabelStyle(theme)}
          itemStyle={tooltipItemStyle(theme)}
          formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`}
        />
        <Legend
          verticalAlign="bottom"
          height={24}
          iconSize={8}
          formatter={(v: string) => <span style={{ color: theme.axis, fontSize: 10 }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
