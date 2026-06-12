import { getSupabaseClient } from './supabase'
import { getAllLocationIds, LOCATIONS } from '@/config/locations'
import { getPreviousPeriod, daysBetween, toMondayISO } from './dateUtils'
import type {
  LocationConfig,
  LocationMetrics,
  PlatformMetrics,
  Platform,
  DailyMetricRow,
  DailyCampaignRow,
  TrendPoint,
  CampaignSummary,
  ExecutiveLocationSummary,
  DateRange,
} from '@/types'

export async function getLocationMetrics(
  location: LocationConfig,
  range: DateRange,
  subLocationId?: string
): Promise<LocationMetrics> {
  const db = getSupabaseClient()
  const ids = subLocationId ? [subLocationId] : getAllLocationIds(location)
  if (ids.length === 0) return emptyMetrics()

  const prevRange = getPreviousPeriod(range)

  const [{ data: curr }, { data: prev }] = await Promise.all([
    db
      .from('daily_metrics')
      .select('platform,spend,impressions,clicks,conversions')
      .in('location_id', ids)
      .gte('date', range.from)
      .lte('date', range.to),
    db
      .from('daily_metrics')
      .select('platform,spend,impressions,clicks,conversions')
      .in('location_id', ids)
      .gte('date', prevRange.from)
      .lte('date', prevRange.to),
  ])

  return buildLocationMetrics(
    (curr || []) as PartialMetricRow[],
    (prev || []) as PartialMetricRow[]
  )
}

export async function getSpendTrend(
  location: LocationConfig,
  range: DateRange,
  subLocationId?: string
): Promise<{ points: TrendPoint[]; isWeekly: boolean }> {
  const db = getSupabaseClient()
  const ids = subLocationId ? [subLocationId] : getAllLocationIds(location)
  if (ids.length === 0) return { points: [], isWeekly: false }

  const { data, error } = await db
    .from('daily_metrics')
    .select('date, platform, spend, conversions')
    .in('location_id', ids)
    .gte('date', range.from)
    .lte('date', range.to)
    .order('date')

  if (error || !data) return { points: [], isWeekly: false }

  const rows = data as Pick<DailyMetricRow, 'date' | 'platform' | 'spend' | 'conversions'>[]
  const rollup = daysBetween(range) > 90

  return {
    points: rollup ? buildWeeklyTrend(rows) : buildDailyTrend(rows, range),
    isWeekly: rollup,
  }
}

export async function getTopCampaigns(
  location: LocationConfig,
  range: DateRange,
  subLocationId?: string
): Promise<CampaignSummary[]> {
  const db = getSupabaseClient()
  const ids = subLocationId ? [subLocationId] : getAllLocationIds(location)
  if (ids.length === 0) return []

  const { data, error } = await db
    .from('daily_campaigns')
    .select('*')
    .in('location_id', ids)
    .gte('date', range.from)
    .lte('date', range.to)

  if (error || !data) return []

  const map = new Map<string, CampaignSummary>()
  for (const row of data as DailyCampaignRow[]) {
    const key = `${row.campaign_id}::${row.platform}`
    if (!map.has(key)) {
      map.set(key, {
        location_id: row.location_id,
        location_name: row.location_name,
        platform: row.platform,
        campaign_id: row.campaign_id,
        campaign_name: row.campaign_name,
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cpl: null,
        ctr: null,
      })
    }
    const c = map.get(key)!
    c.spend += Number(row.spend)
    c.impressions += Number(row.impressions)
    c.clicks += Number(row.clicks)
    c.conversions += Number(row.conversions)
  }

  const campaigns = Array.from(map.values()).map((c) => ({
    ...c,
    spend: r2(c.spend),
    cpl: c.conversions > 0 ? r2(c.spend / c.conversions) : null,
    ctr: c.impressions > 0 ? r4((c.clicks / c.impressions) * 100) : null,
  }))

  // Pick top 1 per platform: best conversions, tiebreak by lowest CPL, then highest spend
  const platforms: Platform[] = ['google', 'meta', 'tiktok']
  const result: CampaignSummary[] = []
  for (const platform of platforms) {
    const forPlatform = campaigns.filter((c) => c.platform === platform)
    if (forPlatform.length === 0) continue
    forPlatform.sort((a, b) => {
      if (b.conversions !== a.conversions) return b.conversions - a.conversions
      if (a.cpl !== null && b.cpl !== null) return a.cpl - b.cpl
      return b.spend - a.spend
    })
    result.push(forPlatform[0])
  }
  return result
}

export async function getExecutiveSummary(
  range: DateRange
): Promise<ExecutiveLocationSummary[]> {
  const db = getSupabaseClient()

  const { data, error } = await db
    .from('daily_metrics')
    .select('location_id, spend, conversions')
    .gte('date', range.from)
    .lte('date', range.to)

  if (error || !data) {
    return LOCATIONS.map((location) => ({
      location,
      totalSpend: 0,
      totalLeads: 0,
      cpl: null,
      hasData: false,
    }))
  }

  const rows = data as Pick<DailyMetricRow, 'location_id' | 'spend' | 'conversions'>[]

  return LOCATIONS.map((location) => {
    const ids = getAllLocationIds(location)
    const locationRows = rows.filter((r) => ids.includes(r.location_id))

    if (locationRows.length === 0) {
      return { location, totalSpend: 0, totalLeads: 0, cpl: null, hasData: false }
    }

    const totalSpend = locationRows.reduce((sum, r) => sum + Number(r.spend), 0)
    const totalLeads = locationRows.reduce((sum, r) => sum + Number(r.conversions), 0)

    return {
      location,
      totalSpend: r2(totalSpend),
      totalLeads: r2(totalLeads),
      cpl: totalLeads > 0 ? r2(totalSpend / totalLeads) : null,
      hasData: true,
    }
  })
}

// ── helpers ──────────────────────────────────────────────────────

type PartialMetricRow = Pick<
  DailyMetricRow,
  'platform' | 'spend' | 'impressions' | 'clicks' | 'conversions'
>

function emptyMetrics(): LocationMetrics {
  return {
    totalSpend: 0,
    totalLeads: 0,
    totalImpressions: 0,
    totalClicks: 0,
    cpl: null,
    ctr: 0,
    prevTotalSpend: null,
    prevTotalLeads: null,
    prevCpl: null,
    byPlatform: [],
  }
}

function buildLocationMetrics(
  curr: PartialMetricRow[],
  prev: PartialMetricRow[]
): LocationMetrics {
  const sumRows = (rows: PartialMetricRow[]) => {
    const totals = { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
    const pm = new Map<Platform, typeof totals>()
    for (const r of rows) {
      totals.spend += Number(r.spend)
      totals.impressions += Number(r.impressions)
      totals.clicks += Number(r.clicks)
      totals.conversions += Number(r.conversions)
      if (!pm.has(r.platform)) pm.set(r.platform, { spend: 0, impressions: 0, clicks: 0, conversions: 0 })
      const p = pm.get(r.platform)!
      p.spend += Number(r.spend)
      p.impressions += Number(r.impressions)
      p.clicks += Number(r.clicks)
      p.conversions += Number(r.conversions)
    }
    return { totals, pm }
  }

  const { totals: ct, pm: cp } = sumRows(curr)
  const { totals: pt } = sumRows(prev)
  const hasPrev = prev.length > 0

  const byPlatform: PlatformMetrics[] = Array.from(cp.entries()).map(
    ([platform, pm]) => {
      const prevRows = prev.filter((r) => r.platform === platform)
      const prevSpend = prevRows.reduce((s, r) => s + Number(r.spend), 0)
      const prevLeads = prevRows.reduce((s, r) => s + Number(r.conversions), 0)
      return {
        platform,
        spend: pm.spend,
        leads: pm.conversions,
        impressions: pm.impressions,
        clicks: pm.clicks,
        cpl: pm.conversions > 0 ? r2(pm.spend / pm.conversions) : null,
        ctr: pm.impressions > 0 ? r4((pm.clicks / pm.impressions) * 100) : 0,
        prevSpend: hasPrev ? prevSpend : null,
        prevLeads: hasPrev ? prevLeads : null,
        prevCpl: hasPrev && prevLeads > 0 ? r2(prevSpend / prevLeads) : null,
      }
    }
  )

  return {
    totalSpend: ct.spend,
    totalLeads: ct.conversions,
    totalImpressions: ct.impressions,
    totalClicks: ct.clicks,
    cpl: ct.conversions > 0 ? r2(ct.spend / ct.conversions) : null,
    ctr: ct.impressions > 0 ? r4((ct.clicks / ct.impressions) * 100) : 0,
    prevTotalSpend: hasPrev ? pt.spend : null,
    prevTotalLeads: hasPrev ? pt.conversions : null,
    prevCpl: hasPrev && pt.conversions > 0 ? r2(pt.spend / pt.conversions) : null,
    byPlatform,
  }
}

type TrendRow = Pick<DailyMetricRow, 'date' | 'platform' | 'spend' | 'conversions'>

type TrendBucket = { google: number; meta: number; tiktok: number; googleConv: number; metaConv: number; tiktokConv: number }

function emptyBucket(): TrendBucket {
  return { google: 0, meta: 0, tiktok: 0, googleConv: 0, metaConv: 0, tiktokConv: 0 }
}

function accumulateBucket(bucket: TrendBucket, row: TrendRow) {
  if (row.platform === 'google') {
    bucket.google += Number(row.spend)
    bucket.googleConv += Number(row.conversions)
  } else if (row.platform === 'meta') {
    bucket.meta += Number(row.spend)
    bucket.metaConv += Number(row.conversions)
  } else if (row.platform === 'tiktok') {
    bucket.tiktok += Number(row.spend)
    bucket.tiktokConv += Number(row.conversions)
  }
}

function bucketToPoint(date: string, b: TrendBucket): TrendPoint {
  return {
    date,
    google: r2(b.google),
    meta: r2(b.meta),
    tiktok: r2(b.tiktok),
    total: r2(b.google + b.meta + b.tiktok),
    googleConv: r2(b.googleConv),
    metaConv: r2(b.metaConv),
    tiktokConv: r2(b.tiktokConv),
    totalConv: r2(b.googleConv + b.metaConv + b.tiktokConv),
  }
}

// Daily trend: fill every calendar day in range (ensures shared x-axis across platforms)
function buildDailyTrend(rows: TrendRow[], range: DateRange): TrendPoint[] {
  const map = new Map<string, TrendBucket>()
  for (const row of rows) {
    if (!map.has(row.date)) map.set(row.date, emptyBucket())
    accumulateBucket(map.get(row.date)!, row)
  }

  const result: TrendPoint[] = []
  const cur = new Date(range.from + 'T00:00:00Z')
  const end = new Date(range.to + 'T00:00:00Z')
  while (cur <= end) {
    const key = cur.toISOString().split('T')[0]
    result.push(bucketToPoint(key, map.get(key) ?? emptyBucket()))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return result
}

// Weekly rollup for ranges > 90 days
function buildWeeklyTrend(rows: TrendRow[]): TrendPoint[] {
  const map = new Map<string, TrendBucket>()
  for (const row of rows) {
    const key = toMondayISO(row.date)
    if (!map.has(key)) map.set(key, emptyBucket())
    accumulateBucket(map.get(key)!, row)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, bucket]) => bucketToPoint(date, bucket))
}

function r2(n: number) { return Math.round(n * 100) / 100 }
function r4(n: number) { return Math.round(n * 10000) / 10000 }
