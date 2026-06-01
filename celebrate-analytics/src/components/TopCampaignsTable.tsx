import type { CampaignSummary } from '@/types'
import { fmtCurrency, fmtNumber, fmtPercent } from '@/lib/formatters'
import { PlatformIcon } from './PlatformIcon'

export default function TopCampaignsTable({ campaigns }: { campaigns: CampaignSummary[] }) {
  if (campaigns.length === 0) {
    return (
      <div className="text-ink-3 text-sm py-8 text-center">
        No campaign data for this period
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[600px]">
        <thead>
          <tr className="border-b border-edge-soft">
            <th className="text-left pb-3 pr-4 text-[10px] font-semibold text-ink-3 uppercase tracking-widest">
              Campaign
            </th>
            <th className="text-right pb-3 pr-4 text-[10px] font-semibold text-ink-3 uppercase tracking-widest">
              Spend
            </th>
            <th className="text-right pb-3 pr-4 text-[10px] font-semibold text-ink-3 uppercase tracking-widest">
              Leads
            </th>
            <th className="text-right pb-3 pr-4 text-[10px] font-semibold text-ink-3 uppercase tracking-widest">
              CPL
            </th>
            <th className="text-right pb-3 text-[10px] font-semibold text-ink-3 uppercase tracking-widest">
              CTR
            </th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr
              key={`${c.campaign_id}-${c.platform}`}
              className="border-b border-edge-soft/50 hover:bg-wash/50 transition-colors duration-200 group"
            >
              <td className="py-2.5 pr-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-wash border border-edge-soft flex items-center justify-center shrink-0">
                    <PlatformIcon platform={c.platform} size={11} />
                  </div>
                  <span className="text-ink font-medium truncate max-w-[220px]" title={c.campaign_name}>
                    {c.campaign_name}
                  </span>
                </div>
              </td>
              <td className="text-right py-2.5 pr-4 text-ink tabular-nums font-medium">
                {fmtCurrency(c.spend)}
              </td>
              <td className="text-right py-2.5 pr-4 text-ink-2 tabular-nums">
                {fmtNumber(c.conversions)}
              </td>
              <td className="text-right py-2.5 pr-4 text-ink-2 tabular-nums">
                {fmtCurrency(c.cpl)}
              </td>
              <td className="text-right py-2.5 text-ink-2 tabular-nums">
                {fmtPercent(c.ctr)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
