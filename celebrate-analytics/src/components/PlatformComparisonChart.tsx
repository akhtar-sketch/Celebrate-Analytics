'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { TrendPoint } from '@/types'
import { useTheme } from './ThemeProvider'
import { PLATFORM_CHART_COLORS } from './PlatformIcon'

function shortDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const DARK  = { grid: '#1a2c4e', axis: '#708cb6', tipBg: '#0b1426', tipBorder: '#1a2c4e', tipText: '#dce6f8', tipLabel: '#708cb6', cursor: '#1a2c4e' }
const LIGHT = { grid: '#c4d6ec', axis: '#415a7a', tipBg: '#ffffff',  tipBorder: '#c4d6ec', tipText: '#0b162a', tipLabel: '#415a7a', cursor: '#e6f0fc' }

export default function PlatformComparisonChart({
  data,
}: {
  data: TrendPoint[]
  isWeekly?: boolean
}) {
  const { theme } = useTheme()
  const C = theme === 'dark' ? DARK : LIGHT

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-ink-3 text-sm">
        No conversion data for this period
      </div>
    )
  }

  const hasTikTok = data.some((d) => d.tiktokConv > 0)
  const interval =
    data.length > 60 ? Math.floor(data.length / 12)
    : data.length > 14 ? Math.floor(data.length / 7)
    : 0

  const chartData = data.map((d) => ({
    date: shortDate(d.date),
    Google: d.googleConv,
    Meta:   d.metaConv,
    ...(hasTikTok ? { TikTok: d.tiktokConv } : {}),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={1} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="0" stroke={C.grid} vertical={false} />
        <XAxis
          dataKey="date"
          interval={interval}
          tick={{ fill: C.axis, fontSize: 11, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tick={{ fill: C.axis, fontSize: 11, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          width={36}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: C.tipBg,
            border: `1px solid ${C.tipBorder}`,
            borderRadius: 10,
            fontSize: 12,
            padding: '10px 14px',
            color: C.tipText,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
          labelStyle={{ color: C.tipLabel, fontWeight: 600, marginBottom: 6 }}
          formatter={(v: number, n: string) => [v.toLocaleString(), n]}
          cursor={{ fill: C.cursor, radius: 4 }}
        />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 12, color: C.axis, paddingTop: 12 }} />
        <Bar dataKey="Google" fill={PLATFORM_CHART_COLORS.google} radius={[3, 3, 0, 0]} maxBarSize={20} />
        <Bar dataKey="Meta"   fill={PLATFORM_CHART_COLORS.meta}   radius={[3, 3, 0, 0]} maxBarSize={20} />
        {hasTikTok && (
          <Bar dataKey="TikTok" fill={PLATFORM_CHART_COLORS.tiktok} radius={[3, 3, 0, 0]} maxBarSize={20} />
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}
