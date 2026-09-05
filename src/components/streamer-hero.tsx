import { ExternalLink, Heart } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatEuros, formatNumber } from '@/lib/format'
import type { Streamer } from '@/types/zevent'

interface StreamerHeroProps {
  streamer: Streamer
}

export function StreamerHero({ streamer }: StreamerHeroProps) {
  return (
    <header className="relative isolate overflow-hidden bg-[#181a18] px-5 py-5 sm:px-6 sm:py-6">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_20%,rgba(98,217,107,0.16),transparent_40%)]"
      />
      <span
        aria-hidden
        className="absolute -right-3 top-1/2 -z-10 hidden -translate-y-1/2 select-none text-[7rem] font-bold tracking-[-0.08em] text-white/[0.035] lg:block"
      >
        {streamer.display}
      </span>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={
              streamer.online
                ? 'shrink-0 rounded-full bg-[#eb4045] p-[3px]'
                : 'shrink-0 rounded-full bg-white/15 p-[3px]'
            }
          >
            <Avatar className="size-16 border-[3px] border-[#181a18] sm:size-20">
              <AvatarImage src={streamer.profileUrl} alt={streamer.display} />
              <AvatarFallback className="text-lg">{streamer.display.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="truncate text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                {streamer.display}
              </h1>
              <span
                className={
                  streamer.online
                    ? 'rounded-sm bg-[#eb4045] px-2 py-0.5 text-xs font-semibold text-white'
                    : 'rounded-sm bg-white/10 px-2 py-0.5 text-xs text-white/60'
                }
              >
                {streamer.online ? 'en direct' : 'hors ligne'}
              </span>
            </div>

            <a
              href={`https://twitch.tv/${streamer.twitch}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm text-white/55 hover:text-white"
            >
              twitch.tv/{streamer.twitch}
              <ExternalLink className="size-3.5" />
            </a>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {streamer.game && <span className="font-medium text-primary">{streamer.game}</span>}
              <span className={streamer.online ? 'text-[#ff6b6f]' : 'text-white/55'}>
                {formatNumber(streamer.viewersAmount.number)} spectateurs
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-5 sm:justify-end">
          <div className="sm:text-right">
            <p className="text-2xl font-semibold tabular-nums text-primary">
              {formatEuros(streamer.donationAmount.number)}
            </p>
            <p className="text-xs text-white/50">collectés</p>
          </div>
          <Button asChild size="sm" className="bg-gold text-gold-foreground hover:bg-gold/90">
            <a href={streamer.donationUrl} target="_blank" rel="noreferrer">
              <Heart className="size-3.5" />
              Faire un don
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
