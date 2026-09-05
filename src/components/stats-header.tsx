import { Users, Wifi, Coins, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatEuros, formatNumber, formatTime } from '@/lib/format'
import type { ZeventResponse } from '@/types/zevent'

interface StatsHeaderProps {
  data: ZeventResponse
  lastUpdated: number
  onlineCount: number
}

export function StatsHeader({ data, lastUpdated, onlineCount }: StatsHeaderProps) {
  const stats = [
    {
      label: 'Total des dons',
      value: formatEuros(data.donationAmount.number),
      icon: Coins,
      tone: 'gold' as const,
    },
    {
      label: 'Spectateurs cumulés',
      value: formatNumber(data.viewersCount.number),
      icon: Users,
      tone: 'primary' as const,
    },
    {
      label: 'Streamers en ligne',
      value: `${formatNumber(onlineCount)} / ${formatNumber(data.live.length)}`,
      icon: Wifi,
      tone: 'primary' as const,
    },
    {
      label: 'Dernière mise à jour',
      value: formatTime(lastUpdated),
      icon: Clock,
      tone: 'muted' as const,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="gap-0 border border-border py-0 shadow-none">
          <CardContent className="flex items-center gap-3 px-4 py-4">
            <div
              className={
                stat.tone === 'gold'
                  ? 'flex size-9 shrink-0 items-center justify-center rounded-sm bg-gold/10 text-gold'
                  : stat.tone === 'primary'
                    ? 'flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary'
                    : 'flex size-9 shrink-0 items-center justify-center rounded-sm bg-secondary text-muted-foreground'
              }
            >
              <stat.icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                {stat.label}
              </p>
              <p className="truncate text-lg font-semibold tabular-nums">
                {stat.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
