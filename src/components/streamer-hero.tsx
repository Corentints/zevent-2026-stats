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
    <header className="overflow-hidden rounded-lg bg-[#141614] px-5 py-5 ring-1 ring-white/[0.06] sm:px-6 sm:py-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative shrink-0">
            <Avatar className="size-16 ring-2 ring-white/10 sm:size-20">
              <AvatarImage src={streamer.profileUrl} alt={streamer.display} />
              <AvatarFallback className="text-lg">{streamer.display.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span
              aria-hidden
              className={
                streamer.online
                  ? 'absolute right-0.5 bottom-0.5 size-3.5 rounded-full border-[3px] border-[#141614] bg-[#eb4045] sm:size-4'
                  : 'absolute right-0.5 bottom-0.5 size-3.5 rounded-full border-[3px] border-[#141614] bg-white/30 sm:size-4'
              }
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="truncate text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                {streamer.display}
              </h1>
              <span className="inline-flex items-center gap-1.5 text-xs text-white/55">
                <span
                  className={
                    streamer.online
                      ? 'size-1.5 rounded-full bg-[#eb4045]'
                      : 'size-1.5 rounded-full bg-white/30'
                  }
                />
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
              {streamer.game && <span className="font-medium text-white/75">{streamer.game}</span>}
              <span className="text-white/55">
                {formatNumber(streamer.viewersAmount.number)} spectateurs
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-5 sm:justify-end">
          <div className="sm:text-right">
            <p className="text-2xl font-semibold tabular-nums text-white">
              {formatEuros(streamer.donationAmount.number)}
            </p>
            <p className="text-xs text-white/50">collectés</p>
          </div>
          <Button asChild size="sm">
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
