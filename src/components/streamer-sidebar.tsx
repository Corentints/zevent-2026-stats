import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronDown, Search, X } from 'lucide-react'
import { MarqueeText } from '@/components/marquee-text'
import { StreamerHoverCard } from '@/components/streamer-hover-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useDonationGoals } from '@/hooks/use-donation-goals'
import { formatEuros } from '@/lib/format'
import { cn } from 'cn'
import type { DonationGoal, Streamer } from '@/types/zevent'

interface StreamerSidebarProps {
  streamers: Streamer[]
  isPending?: boolean
}

function getCurrentGoal(goals: DonationGoal[] | undefined, currentAmount: number) {
  if (!goals || goals.length === 0) return undefined
  return [...goals]
    .sort((a, b) => a.amountRequired - b.amountRequired)
    .find((goal) => goal.amountRequired > currentAmount)
}

function SidebarRowSkeleton({ withGoal }: { withGoal: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 px-2 py-2">
      <div className="flex items-center gap-2.5">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <Skeleton className="h-3.5 flex-1" />
        <Skeleton className="h-3.5 w-12 shrink-0" />
      </div>
      {withGoal && (
        <div className="space-y-1 pl-[2.625rem]">
          <Skeleton className="h-2.5 w-3/4" />
          <Skeleton className="h-1 w-full" />
        </div>
      )}
    </div>
  )
}

export function StreamerSidebar({ streamers, isPending }: StreamerSidebarProps) {
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const goals = useDonationGoals()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable

      if (event.key === '/' && !isTyping) {
        event.preventDefault()
        setMobileOpen(true)
        searchRef.current?.focus()
      }

      if (event.key === 'Escape' && document.activeElement === searchRef.current) {
        setSearch('')
        searchRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const sorted = useMemo(
    () => [...streamers].sort((a, b) => b.donationAmount.number - a.donationAmount.number),
    [streamers],
  )

  const ranks = useMemo(
    () => new Map(sorted.map((streamer, index) => [streamer.twitch_id, index + 1])),
    [sorted],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return sorted
    return sorted.filter((s) => s.display.toLowerCase().includes(query))
  }, [sorted, search])

  return (
    <aside className="w-full shrink-0 border-b border-border lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)] lg:w-72 lg:border-r lg:border-b-0">
      <button
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm lg:hidden"
        aria-expanded={mobileOpen}
        aria-controls="streamer-directory"
      >
        <span>{streamers.length} streamers</span>
        <ChevronDown
          className={cn('size-4 text-muted-foreground transition-transform', mobileOpen && 'rotate-180')}
        />
      </button>

      <div
        id="streamer-directory"
        className={cn(
          'max-h-96 flex-col lg:flex lg:h-full lg:max-h-none',
          mobileOpen ? 'flex' : 'hidden',
        )}
      >
        <div className="space-y-2 px-4 py-3">
          {isPending ? (
            <Skeleton className="h-3.5 w-24" />
          ) : (
            <p className="hidden text-xs font-medium text-muted-foreground lg:block">
              {streamers.length} streamers
            </p>
          )}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Rechercher un streamer"
              className="px-8 focus-visible:ring-primary/50"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Effacer la recherche"
              >
                <X className="size-3.5" />
              </button>
            )}
            {!search && (
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-sm bg-white/[0.06] px-1.5 py-0.5 font-sans text-[10px] text-muted-foreground lg:block">
                /
              </kbd>
            )}
          </div>
        </div>

        <nav className="scrollbar-modern flex-1 overflow-y-auto px-2 pb-3">
          {isPending ? (
            <div className="space-y-0.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <SidebarRowSkeleton key={i} withGoal={i % 3 !== 0} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">Aucun streamer trouvé.</p>
          ) : (
            <ul className="space-y-0.5">
              {filtered.map((streamer) => {
                const currentAmount = streamer.donationAmount.number
                const currentGoal = getCurrentGoal(goals.data?.[streamer.twitch_id], currentAmount)
                const progress = currentGoal
                  ? Math.min(100, (currentAmount / currentGoal.amountRequired) * 100)
                  : 0

                const rank = ranks.get(streamer.twitch_id) ?? 0

                return (
                  <li key={streamer.twitch_id}>
                    <StreamerHoverCard
                      streamer={streamer}
                      rank={rank}
                      totalStreamers={streamers.length}
                    >
                      <Link
                        to="/streamer/$twitchId"
                        params={{ twitchId: streamer.twitch_id }}
                        onClick={() => setMobileOpen(false)}
                        className="group flex flex-col gap-1.5 border-l-2 border-transparent px-2 py-2 text-sm transition-colors hover:bg-accent/60"
                        activeProps={{ className: 'border-primary bg-accent/70 hover:bg-accent/70' }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="relative shrink-0">
                            <Avatar className={streamer.online ? 'size-8' : 'size-8 opacity-65'}>
                              <AvatarImage src={streamer.profileUrl} alt={streamer.display} />
                              <AvatarFallback className="text-xs">
                                {streamer.display.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            {streamer.online && (
                              <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-background bg-primary" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium">
                            {streamer.display}
                          </span>
                          <span className="shrink-0 text-xs font-medium tabular-nums text-foreground">
                            {formatEuros(currentAmount)}
                          </span>
                        </div>

                        {currentGoal && (
                          <div className="space-y-1 pl-[2.625rem]">
                            <MarqueeText
                              text={currentGoal.title}
                              className="text-xs text-muted-foreground"
                            />
                            <div className="h-1 w-full overflow-hidden rounded-sm bg-secondary">
                              <div
                                className="h-full rounded-sm bg-primary/70"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </Link>
                    </StreamerHoverCard>
                  </li>
                )
              })}
            </ul>
          )}
        </nav>
      </div>
    </aside>
  )
}
