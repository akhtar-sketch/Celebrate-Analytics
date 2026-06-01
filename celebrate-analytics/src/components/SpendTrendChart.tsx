'use client'

import {
  AreaChart,
  Area,
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

function kDollar(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`
  return `$${v.toFixed(0)}`
}

const DARK = {
  grid: '#1a2c4e',
  axis: '#708cb6',
  tipBg: '#0b1426',
  tipBorder: '#1a2c4e',
  tipText: '#dce6f8',
  tipLabel: '#708cb6',
}

const LIGHT = {
  grid: '#c4d6ec',
  axis: '#415a7a',
  tipBg: '#ffffff',
  tipBorder: '#c4d6ec',
  tipText: '#0b162a',
  tipLabel: '#415a7a',
}

export default function SpendTrendChart({
  data,
  isWeekly = false,
}: {
  data: TrendPoint[]
  isWeekly?: boolean
}) {
  const { theme } = useTheme()
  const C = theme === 'dark' ? DARK : LIGHT

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-ink-3 text-sm">
        No spend data for this period
      </div>
    )
  }

  const hasTikTok = data.some((d) => d.tiktok > 0)

  const chartData = data.map((d) => ({
    date: shortDate(d.date),
    Google: d.google,
    Meta:   d.meta,
    ...(hasTikTok ? { TikTok: d.tiktok } : {}),
  }))

  const interval =
    data.length > 60 ? Math.floor(data.length / 12)
    : data.length > 14 ? Math.floor(data.length / 7)
    : 0

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradGoogle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={PLATFORM_CHART_COLORS.google} stopOpacity={0.2} />
            <stop offset="100%" stopColor={PLATFORM_CHART_COLORS.google} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradMeta" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={PLATFORM_CHART_COLORS.meta} stopOpacity={0.2} />
            <stop offset="100%" stopColor={PLATFORM_CHART_COLORS.meta} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradTikTok" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={PLATFORM_CHART_COLORS.tiktok} stopOpacity={0.2} />
            <stop offset="100%" stopColor={PLATFORM_CHART_COLORS.tiktok} stopOpacity={0} />
          </linearGradient>
        </defs>

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
          tickFormatter={kDollar}
          tick={{ fill: C.axis, fontSize: 11, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          width={50}
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
          formatter={(value: number, name: string) => [
            `$${value.toLocaleString('en-US')}`,
            name,
          ]}
          cursor={{ stroke: C.grid, strokeWidth: 1 }}
        />

        <Legend
          iconType="circle"
          iconSize={7}
          wrapperStyle={{ fontSize: 12, color: C.axis, paddingTop: 12 }}
        />

        <Area type="monotone" dataKey="Google" stroke={PLATFORM_CHART_COLORS.google}
          fill="url(#gradGoogle)" strokeWidth={1.5} dot={false} />
        <Area type="monotone" dataKey="Meta"   stroke={PLATFORM_CHART_COLORS.meta}
          fill="url(#gradMeta)"   strokeWidth={1.5} dot={false} />
        {hasTikTok && (
          <Area type="monotone" dataKey="TikTok" stroke={PLATFORM_CHART_COLORS.tiktok}
            fill="url(#gradTikTok)" strokeWidth={1.5} dot={false} />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}
