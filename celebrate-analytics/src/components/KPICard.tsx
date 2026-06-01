import { fmtDelta } from '@/lib/formatters'
import clsx from 'clsx'

interface KPICardProps {
  title: string
  value: string
  current: number | null
  prev: number | null
  lowerIsBetter?: boolean
  priorPeriod?: string
}

export default function KPICard({
  title,
  value,
  current,
  prev,
  lowerIsBetter = false,
  priorPeriod,
}: KPICardProps) {
  const delta = fmtDelta(current, prev)

  const effectiveDir =
    lowerIsBetter && delta.direction !== 'neutral'
      ? delta.direction === 'up' ? 'down' : 'up'
      : delta.direction

  const deltaColor =
    delta.value == null
      ? ''
      : effectiveDir === 'up'
        ? 'text-emerald-500 dark:text-emerald-400'
        : 'text-red-500 dark:text-red-400'

  return (
    <div className="flex flex-col justify-between">
      <p className="text-[11px] font-semibold text-ink-3 uppercase tracking-widest mb-3">
        {title}
      </p>
      <div>
        <p className="text-3xl font-bold text-ink tabular-nums leading-none mb-2.5">
          {value}
        </p>
        {delta.value != null ? (
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className={clsx('text-xs font-semibold', deltaColor)}>
              {delta.label}
            </span>
            {priorPeriod && (
              <span className="text-[11px] text-ink-3">vs {priorPeriod}</span>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-ink-3">No prior period data</span>
        )}
      </div>
    </div>
  )
}
