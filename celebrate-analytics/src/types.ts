export type Platform = 'google' | 'meta' | 'tiktok'

export interface DateRange {
  from: string // ISO date YYYY-MM-DD
  to: string   // ISO date YYYY-MM-DD
}

export interface DailyMetricRow {
  id: string
  location_id: string
  location_name: string
  platform: Platform
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  cpl: number | null
  ctr: number
}

export interface DailyCampaignRow {
  id: string
  location_id: string
  location_name: string
  platform: Platform
  date: string
  campaign_id: string
  campaign_name: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  cpl: number | null
  ctr: number | null
}

export interface LocationConfig {
  id: string
  name: string
  googleLocationId: string | null
  metaLocationIds: string[]
}

export interface PlatformMetrics {
  platform: Platform
  spend: number
  leads: number
  impressions: number
  clicks: number
  cpl: number | null
  ctr: number
  prevSpend: number | null
  prevLeads: number | null
  prevCpl: number | null
}

export interface LocationMetrics {
  totalSpend: number
  totalLeads: number
  totalImpressions: number
  totalClicks: number
  cpl: number | null
  ctr: number
  prevTotalSpend: number | null
  prevTotalLeads: number | null
  prevCpl: number | null
  byPlatform: PlatformMetrics[]
}

export interface TrendPoint {
  date: string  // ISO date — daily or Monday of week when rolled up
  google: number
  meta: number
  tiktok: number
  total: number
  googleConv: number
  metaConv: number
  tiktokConv: number
  totalConv: number
}

export interface CampaignSummary {
  location_id: string
  location_name: string
  platform: Platform
  campaign_id: string
  campaign_name: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  cpl: number | null
  ctr: number | null
}

export interface ExecutiveLocationSummary {
  location: LocationConfig
  totalSpend: number
  totalLeads: number
  cpl: number | null
  hasData: boolean
}

// ── Auth ─────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'viewer'

export interface UserAccess {
  userId: string
  role: UserRole
  // admin: empty (unrestricted). viewer: list of allowed location_id slugs.
  allowedLocations: string[]
}
