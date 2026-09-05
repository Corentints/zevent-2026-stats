import { formatEuros, formatNumber, formatTime } from '@/lib/format'
import type { ZeventResponse } from '@/types/zevent'

interface StatsHeaderProps {
  data: ZeventResponse
  lastUpdated: number
  onlineCount: number
}

export function StatsHeader({ data, lastUpdated, onlineCount }: StatsHeaderProps) {
  const stats = [
    { label: 'Total des dons', value: formatEuros(data.donationAmount.number), accent: true },
    { label: 'Spectateurs', value: formatNumber(data.viewersCount.number) },
    {
      label: 'En ligne',
      value: `${formatNumber(onlineCount)} sur ${formatNumber(data.live.length)}`,
    },
    { label: 'Actualisé à', value: formatTime(lastUpdated) },
  ]

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt className="text-xs text-muted-foreground">{stat.label}</dt>
          <dd
            className={
              stat.accent
                ? 'mt-1 text-xl font-semibold tabular-nums text-primary'
                : 'mt-1 text-xl font-semibold tabular-nums text-foreground'
            }
          >
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
