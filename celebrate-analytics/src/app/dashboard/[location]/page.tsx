import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getLocation } from '@/config/locations'
import { getLocationMetrics, getSpendTrend, getTopCampaigns } from '@/lib/queries'
import { getDefaultRange, formatDateRange, getPreviousPeriod, formatDateRangeShort } from '@/lib/dateUtils'
import { fmtCurrency, fmtNumber, fmtPercent } from '@/lib/formatters'
import { getSessionUser, getUserAccess, canAccessLocation } from '@/lib/auth'
import KPICard from '@/components/KPICard'
import DateRangePicker from '@/components/DateRangePicker'
import SpendTrendChart from '@/components/SpendTrendChart'
import PlatformCards from '@/components/PlatformCards'
import PlatformComparisonChart from '@/components/PlatformComparisonChart'
import TopCampaignsTable from '@/components/TopCampaignsTable'
import type { DateRange } from '@/types'

export default async function LocationPage({
  params,
  searchParams,
}: {
  params: Promise<{ location: string }>
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const { location: locationId } = await params
  const location = getLocation(locationId)
  if (!location) notFound()

  const user = await getSessionUser()
  if (!user) redirect('/login')

  const access = await getUserAccess(user.id)
  if (!access) redirect('/pending')
  if (!canAccessLocation(access, locationId)) notFound()

  const { from, to } = await searchParams
  const defaultRange = getDefaultRange()
  const range: DateRange = { from: from ?? defaultRange.from, to: to ?? defaultRange.to }

  const priorRange = getPreviousPeriod(range)
  const priorPeriodLabel = formatDateRangeShort(priorRange)

  const [metrics, { points: trendPoints, isWeekly }, topCampaigns] = await Promise.all([
    getLocationMetrics(location, range),
    getSpendTrend(location, range),
    getTopCampaigns(location, range),
  ])

  const colCount = metrics.byPlatform.length === 1 ? 1
    : metrics.byPlatform.length === 2 ? 2 : 3

  return (
    <div className="space-y-10">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold text-ink-3 uppercase tracking-widest mb-1">
            Location Dashboard
          </p>
          <h1 className="text-2xl font-bold text-ink tracking-tight">{location.name}</h1>
          <p className="text-sm text-ink-3 mt-1">{formatDateRange(range)}</p>
        </div>
        <Suspense fallback={null}>
          <DateRangePicker current={range} />
        </Suspense>
      </div>

      {/* ── KPI band ───────────────────────────────────────── */}
      <div className="bg-surface border border-edge rounded-2xl px-6 py-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-edge-soft">
          <div className="pr-6">
            <KPICard
              title="Total Spend"
              value={fmtCurrency(metrics.totalSpend)}
              current={metrics.totalSpend}
              prev={metrics.prevTotalSpend}
              priorPeriod={priorPeriodLabel}
            />
          </div>
          <div className="px-6">
            <KPICard
              title="Total Leads"
              value={fmtNumber(metrics.totalLeads)}
              current={metrics.totalLeads}
              prev={metrics.prevTotalLeads}
              priorPeriod={priorPeriodLabel}
            />
          </div>
          <div className="px-6">
            <KPICard
              title="Blended CPL"
              value={fmtCurrency(metrics.cpl)}
              current={metrics.cpl}
              prev={metrics.prevCpl}
              lowerIsBetter
              priorPeriod={priorPeriodLabel}
            />
          </div>
          <div className="pl-6">
            <KPICard
              title="Blended CTR"
              value={fmtPercent(metrics.ctr)}
              current={metrics.ctr}
              prev={null}
            />
          </div>
        </div>
      </div>

      {/* ── Platform breakdown ─────────────────────────────── */}
      <div>
        <SectionLabel>Platform Breakdown</SectionLabel>
        <div className={`grid gap-4 ${
          colCount === 1 ? 'grid-cols-1 max-w-sm' :
          colCount === 2 ? 'grid-cols-1 sm:grid-cols-2' :
          'grid-cols-1 md:grid-cols-3'
        }`}>
          <PlatformCards
            platforms={metrics.byPlatform}
            totalSpend={metrics.totalSpend}
          />
        </div>
      </div>

      {/* ── Spend trend ────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>{isWeekly ? 'Weekly' : 'Daily'} Spend Trend</SectionLabel>
          <span className="text-[11px] text-ink-3">{formatDateRange(range)}</span>
        </div>
        <div className="bg-surface border border-edge rounded-2xl px-5 pt-5 pb-3 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.45)]">
          <SpendTrendChart data={trendPoints} isWeekly={isWeekly} />
        </div>
      </div>

      {/* ── Platform comparison ────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Conversions by Platform</SectionLabel>
          <span className="text-[11px] text-ink-3">{isWeekly ? 'Weekly' : 'Daily'} · Google vs Meta vs TikTok</span>
        </div>
        <div className="bg-surface border border-edge rounded-2xl px-5 pt-5 pb-3 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.45)]">
          <PlatformComparisonChart data={trendPoints} isWeekly={isWeekly} />
        </div>
      </div>

      {/* ── Top campaigns ──────────────────────────────────── */}
      <div>
        <SectionLabel>Top Campaign per Platform</SectionLabel>
        <div className="bg-surface border border-edge rounded-2xl p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.45)]">
          <TopCampaignsTable campaigns={topCampaigns} />
        </div>
      </div>

    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-ink-3 uppercase tracking-widest mb-4">
      {children}
    </p>
  )
}
