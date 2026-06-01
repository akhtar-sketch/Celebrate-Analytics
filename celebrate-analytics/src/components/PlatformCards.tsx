import type { PlatformMetrics } from '@/types'
import { fmtCurrency, fmtNumber, fmtPercent, fmtDelta } from '@/lib/formatters'
import { PlatformIcon, PLATFORM_LABELS } from './PlatformIcon'
import clsx from 'clsx'

const PLATFORM_ACCENT: Record<string, { bar: string; badge: string }> = {
  google: { bar: 'bg-blue-500',   badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  meta:   { bar: 'bg-amber-500',  badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  tiktok: { bar: 'bg-pink-500',   badge: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' },
}

interface Props {
  platforms: PlatformMetrics[]
  totalSpend: number
}

export default function PlatformCards({ platforms, totalSpend }: Props) {
  if (platforms.length === 0) {
    return (
      <div className="col-span-3 text-center py-12 text-ink-3 text-sm">
        No platform data for this period
      </div>
    )
  }

  return (
    <>
      {platforms.map((p) => {
        const cfg = PLATFORM_ACCENT[p.platform] ?? {
          bar: 'bg-ink-3',
          badge: 'bg-ink-3/10 text-ink-2',
        }
        const pct = totalSpend > 0 ? Math.round((p.spend / totalSpend) * 100) : 0
        const spendDelta = fmtDelta(p.spend, p.prevSpend)
        const label = PLATFORM_LABELS[p.platform] ?? p.platform

        return (
          <div
            key={p.platform}
            className="bg-surface border border-edge rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-wash border border-edge-soft flex items-center justify-center shrink-0">
                <PlatformIcon platform={p.platform} size={15} />
              </div>
              <h3 className="text-sm font-semibold text-ink">{label}</h3>
              <span className="ml-auto text-[11px] font-medium text-ink-3 tabular-nums">
                {pct}%
              </span>
            </div>

            {/* Spend */}
            <div>
              <div className="flex items-baseline gap-2 mb-1.5">
                <p className="text-2xl font-bold text-ink tabular-nums leading-none">
                  {fmtCurrency(p.spend)}
                </p>
                {spendDelta.value != null && (
                  <span
                    className={clsx(
                      'text-[11px] font-semibold px-1.5 py-0.5 rounded-md',
                      spendDelta.direction === 'up'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    )}
                  >
                    {spendDelta.label}
                  </span>
                )}
              </div>
              {/* Spend share bar */}
              <div className="h-1 bg-edge-soft rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all duration-500', cfg.bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-1 border-t border-edge-soft">
              <Metric label="Leads"  value={fmtNumber(p.leads)} />
              <Metric label="CPL"    value={fmtCurrency(p.cpl)} />
              <Metric label="Clicks" value={fmtNumber(p.clicks)} />
              <Metric label="CTR"    value={fmtPercent(p.ctr)} />
            </div>
          </div>
        )
      })}
    </>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-ink tabular-nums">{value}</p>
    </div>
  )
}
