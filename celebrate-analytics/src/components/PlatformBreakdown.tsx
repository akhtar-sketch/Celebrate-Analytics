import type { PlatformMetrics } from '@/types'
import { fmtCurrency, fmtNumber, fmtPercent, fmtDelta } from '@/lib/formatters'
import clsx from 'clsx'

const PLATFORM_LABELS: Record<string, string> = {
  google: 'Google Ads',
  meta: 'Meta Ads',
  tiktok: 'TikTok Ads',
}

const PLATFORM_COLORS: Record<string, string> = {
  google: 'text-blue-400',
  meta: 'text-orange-400',
  tiktok: 'text-pink-400',
}

export default function PlatformBreakdown({ platforms }: { platforms: PlatformMetrics[] }) {
  if (platforms.length === 0) {
    return <p className="text-zinc-600 text-sm py-6 text-center">No platform data for this quarter</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
            <th className="text-left py-3 pr-4">Platform</th>
            <th className="text-right py-3 pr-4">Spend</th>
            <th className="text-right py-3 pr-4">Leads</th>
            <th className="text-right py-3 pr-4">CPL</th>
            <th className="text-right py-3">CTR</th>
          </tr>
        </thead>
        <tbody>
          {platforms.map((p) => {
            const spendDelta = fmtDelta(p.spend, p.prevSpend)
            return (
              <tr key={p.platform} className="border-b border-zinc-800/50">
                <td className={clsx('py-3 pr-4 font-medium', PLATFORM_COLORS[p.platform] || 'text-zinc-300')}>
                  {PLATFORM_LABELS[p.platform] || p.platform}
                </td>
                <td className="text-right py-3 pr-4 text-zinc-200">
                  {fmtCurrency(p.spend)}
                  {spendDelta.value != null && (
                    <span
                      className={clsx(
                        'ml-2 text-xs',
                        spendDelta.direction === 'up' ? 'text-emerald-400' : 'text-red-400'
                      )}
                    >
                      {spendDelta.label}
                    </span>
                  )}
                </td>
                <td className="text-right py-3 pr-4 text-zinc-200">{fmtNumber(p.leads)}</td>
                <td className="text-right py-3 pr-4 text-zinc-200">{fmtCurrency(p.cpl)}</td>
                <td className="text-right py-3 text-zinc-200">{fmtPercent(p.ctr)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
