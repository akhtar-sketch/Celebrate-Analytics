import { Suspense } from 'react'
import { redirect, notFound } from 'next/navigation'
import { getExecutiveSummary } from '@/lib/queries'
import { getDefaultRange, formatDateRange } from '@/lib/dateUtils'
import { fmtCurrency, fmtNumber } from '@/lib/formatters'
import { getSessionUser, getUserAccess, canAccessExecutive } from '@/lib/auth'
import DateRangePicker from '@/components/DateRangePicker'
import type { DateRange } from '@/types'

export default async function ExecutivePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const access = await getUserAccess(user.id)
  if (!access) redirect('/pending')

  if (!canAccessExecutive(access)) {
    if (access.allowedLocations.length > 0) {
      redirect(`/dashboard/${access.allowedLocations[0]}`)
    }
    notFound()
  }

  const { from, to } = await searchParams
  const defaultRange = getDefaultRange()
  const range: DateRange = { from: from ?? defaultRange.from, to: to ?? defaultRange.to }

  const summaries = await getExecutiveSummary(range)
  const active = summaries.filter((s) => s.hasData)
  const totalSpend  = active.reduce((sum, s) => sum + s.totalSpend,  0)
  const totalLeads  = active.reduce((sum, s) => sum + s.totalLeads,  0)
  const blendedCPL  = totalLeads > 0 ? totalSpend / totalLeads : null

  const sorted = [...summaries].sort((a, b) => b.totalSpend - a.totalSpend)

  return (
    <div className="space-y-10">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold text-ink-3 uppercase tracking-widest mb-1">
            Executive Dashboard
          </p>
          <h1 className="text-2xl font-bold text-ink tracking-tight">All Locations</h1>
          <p className="text-sm text-ink-3 mt-1">
            {formatDateRange(range)}
            <span className="mx-2 text-edge">·</span>
            {active.length} active location{active.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Suspense fallback={null}>
          <DateRangePicker current={range} />
        </Suspense>
      </div>

      {/* ── Hero KPIs ──────────────────────────────────────── */}
      <div className="flex items-start gap-10 pb-8 border-b border-edge-soft">
        <HeroMetric label="Total Spend"  value={fmtCurrency(totalSpend)} />
        <div className="w-px self-stretch bg-edge-soft" />
        <HeroMetric label="Total Leads"  value={fmtNumber(totalLeads)} />
        <div className="w-px self-stretch bg-edge-soft" />
        <HeroMetric label="Blended CPL"  value={fmtCurrency(blendedCPL)} />
      </div>

      {/* ── Location breakdown ─────────────────────────────── */}
      <div>
        <p className="text-[11px] font-semibold text-ink-3 uppercase tracking-widest mb-4">
          Location Breakdown — {formatDateRange(range)}
        </p>
        <div className="bg-surface border border-edge rounded-2xl overflow-hidden transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.45)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-ink-3 uppercase tracking-widest">
                  Location
                </th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-ink-3 uppercase tracking-widest">
                  Spend
                </th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-ink-3 uppercase tracking-widest">
                  Leads
                </th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-ink-3 uppercase tracking-widest">
                  CPL
                </th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-ink-3 uppercase tracking-widest w-32">
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(({ location, totalSpend: spend, totalLeads: leads, cpl, hasData }) => {
                const sharePct = (hasData && totalSpend > 0) ? (spend / totalSpend) * 100 : 0
                return (
                  <tr
                    key={location.id}
                    className="border-b border-edge-soft/60 hover:bg-wash/50 transition-colors duration-200"
                  >
                    <td className="px-5 py-3">
                      <a
                        href={`/dashboard/${location.id}?from=${range.from}&to=${range.to}`}
                        className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                      >
                        {location.name}
                      </a>
                    </td>
                    <td className="text-right px-5 py-3 text-ink font-medium tabular-nums">
                      {hasData ? fmtCurrency(spend) : <span className="text-ink-3">No data</span>}
                    </td>
                    <td className="text-right px-5 py-3 text-ink-2 tabular-nums">
                      {hasData ? fmtNumber(leads)    : <span className="text-ink-3">—</span>}
                    </td>
                    <td className="text-right px-5 py-3 text-ink-2 tabular-nums">
                      {hasData ? fmtCurrency(cpl)    : <span className="text-ink-3">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      {hasData && totalSpend > 0 ? (
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-ink-3 tabular-nums text-xs w-10 text-right">
                            {sharePct.toFixed(1)}%
                          </span>
                          <div className="w-16 h-1.5 bg-edge-soft rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${sharePct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-ink-3 text-xs text-right block">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {active.length > 0 && (
              <tfoot>
                <tr className="border-t border-edge bg-wash/30">
                  <td className="px-5 py-3 font-semibold text-ink">Total</td>
                  <td className="text-right px-5 py-3 font-bold text-ink tabular-nums">{fmtCurrency(totalSpend)}</td>
                  <td className="text-right px-5 py-3 font-semibold text-ink-2 tabular-nums">{fmtNumber(totalLeads)}</td>
                  <td className="text-right px-5 py-3 font-semibold text-ink-2 tabular-nums">{fmtCurrency(blendedCPL)}</td>
                  <td className="px-5 py-3 text-right text-ink-3 text-xs">100%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

    </div>
  )
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-ink-3 uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-4xl font-bold text-ink tabular-nums tracking-tight">{value}</p>
    </div>
  )
}
