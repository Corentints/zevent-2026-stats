import { useLayoutEffect, useMemo, useRef } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, ExternalLink, Gamepad2, Heart, Target, Users } from 'lucide-react'
import { StreamerDonationChart } from '@/components/streamer-donation-chart'
import { StreamerViewersChart } from '@/components/streamer-viewers-chart'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDonationGoals } from '@/hooks/use-donation-goals'
import { useStreamerHistory } from '@/hooks/use-streamer-history'
import { useZeventData } from '@/hooks/use-zevent-data'
import { HISTORY_API_URL } from '@/lib/history-api'
import { formatEuros, formatNumber } from '@/lib/format'

export function StreamerPage() {
  const { twitchId } = useParams({ from: '/streamer/$twitchId' })
  const { data, isPending } = useZeventData()
  const history = useStreamerHistory(twitchId)
  const goals = useDonationGoals()

  const streamer = data?.live.find((s) => s.twitch_id === twitchId)

  const sortedGoals = useMemo(() => {
    const list = goals.data?.[twitchId] ?? []
    return [...list].sort((a, b) => a.amountRequired - b.amountRequired)
  }, [goals.data, twitchId])

  const goalsScrollRef = useRef<HTMLDivElement>(null)
  const nextGoalRef = useRef<HTMLDivElement>(null)
  const hasScrolledToGoalRef = useRef(false)

  const currentAmountForScroll = streamer?.donationAmount.number
  const nextGoalForScroll = sortedGoals.find(
    (g) => currentAmountForScroll !== undefined && g.amountRequired > currentAmountForScroll,
  )

  useLayoutEffect(() => {
    if (hasScrolledToGoalRef.current || !nextGoalForScroll) return
    const container = goalsScrollRef.current
    const target = nextGoalRef.current
    if (!container || !target) return

    hasScrolledToGoalRef.current = true
    const offset = target.offsetTop - container.clientHeight / 2 + target.clientHeight / 2
    container.scrollTop = Math.max(0, offset)
  }, [nextGoalForScroll])

  if (isPending) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-[140px]" />
        <Skeleton className="h-[280px]" />
      </div>
    )
  }

  if (!streamer) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <Link
          to="/classement"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Retour au classement
        </Link>
        <p className="text-muted-foreground">Streamer introuvable.</p>
      </div>
    )
  }

  const currentAmount = streamer.donationAmount.number
  const nextGoal = sortedGoals.find((g) => g.amountRequired > currentAmount)
  const progressToNext = nextGoal ? Math.min(100, (currentAmount / nextGoal.amountRequired) * 100) : 100

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="card-glow">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <Avatar
            className={
              streamer.online
                ? 'size-16 shrink-0 ring-2 ring-primary ring-offset-2 ring-offset-background'
                : 'size-16 shrink-0'
            }
          >
            <AvatarImage src={streamer.profileUrl} alt={streamer.display} />
            <AvatarFallback className="text-lg">
              {streamer.display.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display truncate text-2xl font-bold">{streamer.display}</h1>
              <Badge variant={streamer.online ? 'default' : 'secondary'} className="gap-1.5">
                <span
                  className={
                    streamer.online
                      ? 'size-1.5 shrink-0 animate-pulse rounded-full bg-primary-foreground'
                      : 'size-1.5 shrink-0 rounded-full bg-muted-foreground'
                  }
                />
                {streamer.online ? 'En ligne' : 'Hors ligne'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <a
                href={`https://twitch.tv/${streamer.twitch}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary hover:underline"
              >
                twitch.tv/{streamer.twitch}
                <ExternalLink className="size-3.5" />
              </a>
              {streamer.game && (
                <span className="inline-flex items-center gap-1">
                  <Gamepad2 className="size-3.5" />
                  {streamer.game}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" />
                {formatNumber(streamer.viewersAmount.number)} spectateurs
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <p className="font-display text-3xl font-bold tabular-nums text-primary">
              {formatEuros(currentAmount)}
            </p>
            <Button
              asChild
              size="sm"
              className="bg-gold text-gold-foreground hover:bg-gold/90"
            >
              <a href={streamer.donationUrl} target="_blank" rel="noreferrer">
                <Heart className="size-3.5" />
                Faire un don
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <StreamerDonationChart
            history={history.data ?? []}
            isConfigured={Boolean(HISTORY_API_URL)}
          />
          <StreamerViewersChart
            history={history.data ?? []}
            isConfigured={Boolean(HISTORY_API_URL)}
          />
        </div>

        <div className="lg:col-span-1">
          {sortedGoals.length > 0 && (
            <Card className="card-glow lg:sticky lg:top-20">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 text-lg uppercase tracking-wide">
                  <Target className="size-5 text-primary" />
                  Objectifs de dons
                </CardTitle>
              </CardHeader>
              <CardContent ref={goalsScrollRef} className="max-h-[70vh] space-y-1 overflow-y-auto">
                {sortedGoals.map((goal) => {
                  const reached = currentAmount >= goal.amountRequired
                  const isNext = goal === nextGoal
                  return (
                    <div
                      key={goal.title}
                      ref={isNext ? nextGoalRef : undefined}
                      className={
                        isNext
                          ? 'space-y-2 rounded-sm border border-primary/40 bg-primary/5 px-3 py-2.5'
                          : 'flex items-center gap-3 rounded-sm px-3 py-2.5'
                      }
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2
                          className={
                            reached
                              ? 'size-4 shrink-0 text-primary'
                              : 'size-4 shrink-0 text-muted-foreground/40'
                          }
                        />
                        <span
                          className={
                            reached
                              ? 'min-w-0 flex-1 text-sm font-medium'
                              : 'min-w-0 flex-1 text-sm text-muted-foreground'
                          }
                        >
                          {goal.title}
                        </span>
                        <span
                          className={
                            reached
                              ? 'font-display shrink-0 text-sm font-bold tabular-nums text-primary'
                              : 'font-display shrink-0 text-sm font-bold tabular-nums text-muted-foreground'
                          }
                        >
                          {formatEuros(goal.amountRequired)}
                        </span>
                      </div>
                      {isNext && (
                        <div className="space-y-1">
                          <div className="h-1.5 w-full overflow-hidden rounded-sm bg-secondary">
                            <div
                              className="h-full rounded-sm bg-primary transition-all"
                              style={{ width: `${progressToNext}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatEuros(goal.amountRequired - currentAmount)} avant ce palier
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
