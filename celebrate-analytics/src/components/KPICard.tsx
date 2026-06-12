import { fmtDelta } from '@/lib/formatters'
import clsx from 'clsx'

interface KPICardProps {
  title: string
  value: string
  current: number | null
  prev: number | null
  lowerIsBetter?: boolean
  priorPeriod?: string
  icon: React.ReactNode
}

export default function KPICard({
  title,
  value,
  current,
  prev,
  lowerIsBetter = false,
  priorPeriod,
  icon,
}: KPICardProps) {
  const delta = fmtDelta(current, prev)

  const effectiveDir =
    lowerIsBetter && delta.direction !== 'neutral'
      ? delta.direction === 'up' ? 'down' : 'up'
      : delta.direction

  const isUp = effectiveDir === 'up'
  const isDown = effectiveDir === 'down'

  const deltaColor = delta.value == null
    ? ''
    : isUp
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400'

  const deltaArrow = delta.value == null ? null : isUp ? '↑' : '↓'

  return (
    <div className="flex flex-col gap-3">
      {/* Label + icon row */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-ink-3 uppercase tracking-widest leading-none">
          {title}
        </p>
        <div className="w-7 h-7 rounded-lg bg-brand-soft flex items-center justify-center text-brand shrink-0">
          {icon}
        </div>
      </div>

      {/* Value */}
      <p className="text-[2rem] font-bold text-ink tabular-nums leading-none tracking-tight">
        {value}
      </p>

      {/* Delta */}
      {delta.value != null ? (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={clsx(
            'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md',
            isUp
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          )}>
            {deltaArrow} {delta.label}
          </span>
          {priorPeriod && (
            <span className="text-[11px] text-ink-3">vs {priorPeriod}</span>
          )}
        </div>
      ) : (
        <span className="text-[11px] text-ink-3">No prior period data</span>
      )}
    </div>
  )
}
