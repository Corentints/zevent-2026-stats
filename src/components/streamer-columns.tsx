import { Link } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { ArrowUpRight, ExternalLink } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { zeventTableFeatures } from '@/lib/table-features'
import { formatEuros, formatNumber } from '@/lib/format'
import type { Streamer } from '@/types/zevent'

const columnHelper = createColumnHelper<typeof zeventTableFeatures, Streamer>()

export const streamerColumns = columnHelper.columns([
  columnHelper.display({
    id: 'rank',
    header: '#',
    cell: (info) => {
      const displayIndex = info.row.getDisplayIndex()
      return (
        <span className="tabular-nums text-muted-foreground">
          {displayIndex === -1 ? '—' : displayIndex + 1}
        </span>
      )
    },
  }),
  columnHelper.accessor('display', {
    id: 'display',
    header: 'Streamer',
    cell: (info) => {
      const streamer = info.row.original
      return (
        <Link
          to="/streamer/$twitchId"
          params={{ twitchId: streamer.twitch_id }}
          className="flex items-center gap-2 font-medium hover:text-primary hover:underline"
        >
          <span className="relative shrink-0">
            <Avatar className={streamer.online ? 'size-8' : 'size-8 opacity-65'}>
              <AvatarImage src={streamer.profileUrl} alt={streamer.display} />
              <AvatarFallback>{streamer.display.slice(0, 2)}</AvatarFallback>
            </Avatar>
            {streamer.online && (
              <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-background bg-primary" />
            )}
          </span>
          <span className="truncate">{streamer.display}</span>
        </Link>
      )
    },
  }),
  columnHelper.accessor('online', {
    id: 'online',
    header: 'Statut',
    enableGlobalFilter: false,
    cell: (info) => (
      <Badge variant={info.getValue() ? 'default' : 'secondary'} className="gap-1.5">
        <span
          className={
            info.getValue()
              ? 'size-1.5 shrink-0 animate-pulse rounded-full bg-primary-foreground'
              : 'size-1.5 shrink-0 rounded-full bg-muted-foreground'
          }
        />
        {info.getValue() ? 'En ligne' : 'Hors ligne'}
      </Badge>
    ),
    sortFn: (a, b) => Number(a.original.online) - Number(b.original.online),
  }),
  columnHelper.accessor('game', {
    id: 'game',
    header: 'Jeu',
    enableGlobalFilter: false,
    cell: (info) => (
      <span className="truncate text-muted-foreground">{info.getValue() || '—'}</span>
    ),
  }),
  columnHelper.accessor((row) => row.viewersAmount.number, {
    id: 'viewers',
    header: 'Spectateurs',
    enableGlobalFilter: false,
    cell: (info) => (
      <span className="tabular-nums">{formatNumber(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor((row) => row.donationAmount.number, {
    id: 'donationAmount',
    header: 'Dons',
    enableGlobalFilter: false,
    cell: (info) => (
      <span className="font-semibold tabular-nums text-foreground">
        {formatEuros(info.getValue())}
      </span>
    ),
  }),
  columnHelper.display({
    id: 'donate',
    header: '',
    cell: (info) => (
      <Button asChild size="sm" className="bg-gold text-gold-foreground hover:bg-gold/90">
        <a href={info.row.original.donationUrl} target="_blank" rel="noreferrer">
          Donner <ArrowUpRight className="size-3.5" />
        </a>
      </Button>
    ),
  }),
  columnHelper.display({
    id: 'twitch',
    header: '',
    cell: (info) => (
      <Button asChild variant="ghost" size="icon-sm" title="Voir sur Twitch">
        <a href={`https://twitch.tv/${info.row.original.twitch}`} target="_blank" rel="noreferrer">
          <ExternalLink className="size-3.5" />
        </a>
      </Button>
    ),
  }),
])
