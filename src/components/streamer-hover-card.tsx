import { useState, type ReactNode } from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { useStreamerHistory } from '@/hooks/use-streamer-history'
import { formatEuros } from '@/lib/format'
import type { Streamer } from '@/types/zevent'

interface StreamerHoverCardProps {
  streamer: Streamer
  rank: number
  totalStreamers: number
  children: ReactNode
}

export function StreamerHoverCard({
  streamer,
  rank,
  totalStreamers,
  children,
}: StreamerHoverCardProps) {
  const [open, setOpen] = useState(false)
  const history = useStreamerHistory(streamer.twitch_id, open)
  const points = history.data ?? []
  const gradientId = `hovercard-fill-${streamer.twitch_id}`

  return (
    <HoverCard open={open} onOpenChange={setOpen} openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="w-64">
        <div className="flex items-center gap-2.5">
          <Avatar className={streamer.online ? 'size-9 shrink-0' : 'size-9 shrink-0 opacity-65'}>
            <AvatarImage src={streamer.profileUrl} alt={streamer.display} />
            <AvatarFallback className="text-xs">
              {streamer.display.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{streamer.display}</p>
            <p className="text-xs text-muted-foreground">
              #{rank} sur {totalStreamers}
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
            {formatEuros(streamer.donationAmount.number)}
          </p>
        </div>

        <div className="mt-3 h-14 w-full">
          {points.length >= 2 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="amount"
                  type="bumpX"
                  stroke="var(--chart-1)"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill={`url(#${gradientId})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground">
              {open && history.isLoading ? 'Chargement…' : 'Pas encore de courbe'}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
