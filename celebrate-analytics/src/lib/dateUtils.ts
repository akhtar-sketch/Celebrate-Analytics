import type { DateRange } from '@/types'

export const PRESETS: { label: string; key: string; getRange: () => DateRange }[] = [
  { label: 'Last 7 days',   key: 'last7',       getRange: () => lastNDays(7) },
  { label: 'Last 14 days',  key: 'last14',      getRange: () => lastNDays(14) },
  { label: 'Last 30 days',  key: 'last30',      getRange: () => lastNDays(30) },
  { label: 'Last 90 days',  key: 'last90',      getRange: () => lastNDays(90) },
  { label: 'Last 365 days', key: 'last365',     getRange: () => lastNDays(365) },
  { label: 'This month',    key: 'thisMonth',   getRange: () => thisMonth() },
  { label: 'Last month',    key: 'lastMonth',   getRange: () => lastMonth() },
  { label: 'This quarter',  key: 'thisQuarter', getRange: () => thisQuarter() },
  { label: 'Last quarter',  key: 'lastQuarter', getRange: () => lastQuarter() },
]

function iso(d: Date): string {
  return d.toISOString().split('T')[0]
}

export function lastNDays(n: number): DateRange {
  const to = new Date()
  to.setDate(to.getDate() - 1) // yesterday — most recent complete day
  const from = new Date(to)
  from.setDate(from.getDate() - (n - 1))
  return { from: iso(from), to: iso(to) }
}

export function thisMonth(): DateRange {
  const now = new Date()
  return {
    from: iso(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: iso(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  }
}

export function lastMonth(): DateRange {
  const now = new Date()
  return {
    from: iso(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
    to: iso(new Date(now.getFullYear(), now.getMonth(), 0)),
  }
}

export function thisQuarter(): DateRange {
  const now = new Date()
  const q = Math.floor(now.getMonth() / 3)
  const starts = [0, 3, 6, 9]
  const ends = [2, 5, 8, 11]
  const lastDays = [31, 30, 30, 31]
  return {
    from: iso(new Date(now.getFullYear(), starts[q], 1)),
    to: iso(new Date(now.getFullYear(), ends[q], lastDays[q])),
  }
}

export function lastQuarter(): DateRange {
  const now = new Date()
  const q = Math.floor(now.getMonth() / 3)
  const pq = q === 0 ? 3 : q - 1
  const py = q === 0 ? now.getFullYear() - 1 : now.getFullYear()
  const starts = [0, 3, 6, 9]
  const ends = [2, 5, 8, 11]
  const lastDays = [31, 30, 30, 31]
  return {
    from: iso(new Date(py, starts[pq], 1)),
    to: iso(new Date(py, ends[pq], lastDays[pq])),
  }
}

export function getDefaultRange(): DateRange {
  return lastNDays(30)
}

// Previous period = same duration, immediately preceding the current range
export function getPreviousPeriod(range: DateRange): DateRange {
  const days = daysBetween(range)
  const prevTo = new Date(range.from + 'T00:00:00Z')
  prevTo.setUTCDate(prevTo.getUTCDate() - 1)
  const prevFrom = new Date(prevTo)
  prevFrom.setUTCDate(prevFrom.getUTCDate() - (days - 1))
  return { from: iso(prevFrom), to: iso(prevTo) }
}

export function daysBetween(range: DateRange): number {
  return (
    Math.round(
      (new Date(range.to + 'T00:00:00Z').getTime() -
        new Date(range.from + 'T00:00:00Z').getTime()) /
        86400000
    ) + 1
  )
}

export function formatDateRange(range: DateRange): string {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  return `${fmt(range.from)} – ${fmt(range.to)}`
}

// Compact format without year, e.g. "Apr 22 – May 21"
export function formatDateRangeShort(range: DateRange): string {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(range.from)} – ${fmt(range.to)}`
}

// Normalise any date string to its ISO Monday (UTC) for weekly rollup grouping
export function toMondayISO(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  const day = d.getUTCDay() // 0=Sun 1=Mon … 6=Sat
  const diff = day === 0 ? -6 : 1 - day
  d.setUTCDate(d.getUTCDate() + diff)
  return d.toISOString().split('T')[0]
}
