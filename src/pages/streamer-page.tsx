import { useLayoutEffect, useMemo, useRef } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, ExternalLink, Gamepad2, Heart, Users } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/page-layout'
import { StreamerDonationChart } from '@/components/streamer-donation-chart'
import { StreamerViewersChart } from '@/components/streamer-viewers-chart'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  const goalsScrollRef = useRef<HTMLDivElement>(null)
  const activeGoalRef = useRef<HTMLDivElement>(null)

  const streamer = data?.live.find((item) => item.twitch_id === twitchId)

  const sortedGoals = useMemo(() => {
    const list = goals.data?.[twitchId] ?? []
    return [...list].sort((a, b) => a.amountRequired - b.amountRequired)
  }, [goals.data, twitchId])

  const nextGoal = streamer
    ? sortedGoals.find((goal) => goal.amountRequired > streamer.donationAmount.number)
    : undefined
  const activeGoal = nextGoal ?? sortedGoals.at(-1)

  useLayoutEffect(() => {
    const container = goalsScrollRef.current
    const target = activeGoalRef.current
    if (!container || !target) return

    const targetTop =
      target.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop

    container.scrollTop = Math.max(0, targetTop - 24)
  }, [twitchId, activeGoal?.amountRequired, sortedGoals.length])

  if (isPending) {
    return (
      <PageContainer>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[280px] w-full" />
        <Skeleton className="h-[280px] w-full" />
      </PageContainer>
    )
  }

  if (!streamer) {
    return (
      <PageContainer>
        <PageHeader
          title="Streamer introuvable"
          description="Ce streamer ne figure pas dans les données actuelles du ZEvent."
        />
        <Button asChild variant="outline" size="sm">
          <Link to="/classement">
            <ArrowLeft className="size-4" />
            Retour au classement
          </Link>
        </Button>
      </PageContainer>
    )
  }

  const currentAmount = streamer.donationAmount.number
  const progressToNext = nextGoal
    ? Math.min(100, (currentAmount / nextGoal.amountRequired) * 100)
    : 100

  return (
    <PageContainer>
      <PageHeader
        leading={
          <Avatar
            className={streamer.online ? 'size-14 shrink-0' : 'size-14 shrink-0 opacity-70'}
          >
            <AvatarImage src={streamer.profileUrl} alt={streamer.display} />
            <AvatarFallback>{streamer.display.slice(0, 2)}</AvatarFallback>
          </Avatar>
        }
        title={streamer.display}
        description={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <span
                className={
                  streamer.online
                    ? 'size-2 rounded-full bg-primary'
                    : 'size-2 rounded-full bg-muted-foreground/50'
                }
              />
              {streamer.online ? 'En ligne' : 'Hors ligne'}
            </span>
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
        }
        actions={
          <div className="flex items-center gap-4 sm:justify-end">
            <div className="text-left sm:text-right">
              <p className="text-2xl font-semibold tabular-nums text-primary">
                {formatEuros(currentAmount)}
              </p>
              <p className="text-xs text-muted-foreground">collectés</p>
            </div>
            <Button asChild size="sm" className="bg-gold text-gold-foreground hover:bg-gold/90">
              <a href={streamer.donationUrl} target="_blank" rel="noreferrer">
                <Heart className="size-3.5" />
                Faire un don
              </a>
            </Button>
          </div>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <StreamerDonationChart
            history={history.data ?? []}
            isConfigured={Boolean(HISTORY_API_URL)}
          />
          <StreamerViewersChart
            history={history.data ?? []}
            isConfigured={Boolean(HISTORY_API_URL)}
          />
        </div>

        <Card className="gap-0 rounded-none border-0 border-t border-border bg-transparent py-0 shadow-none xl:sticky xl:top-20">
          <CardHeader className="px-0 py-5">
            <CardTitle className="text-lg">Objectifs de dons</CardTitle>
            <CardDescription>
              {sortedGoals.length > 0
                ? `${sortedGoals.length} palier${sortedGoals.length > 1 ? 's' : ''} annoncé${sortedGoals.length > 1 ? 's' : ''}`
                : 'Aucun objectif renseigné pour le moment.'}
            </CardDescription>
          </CardHeader>

          {sortedGoals.length > 0 && (
            <CardContent
              key={twitchId}
              ref={goalsScrollRef}
              className="max-h-[70vh] overflow-y-auto px-0"
            >
              {sortedGoals.map((goal) => {
                const reached = currentAmount >= goal.amountRequired
                const isNext = goal === nextGoal
                const isActive = goal === activeGoal

                return (
                  <div
                    key={`${goal.amountRequired}-${goal.title}`}
                    ref={isActive ? activeGoalRef : undefined}
                    className={
                      isActive
                        ? 'space-y-2 border-l-2 border-primary bg-primary/5 px-3 py-3'
                        : 'space-y-2 border-l-2 border-transparent px-3 py-3'
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className={
                          reached
                            ? 'size-2 shrink-0 rounded-full bg-primary'
                            : 'size-2 shrink-0 rounded-full border border-muted-foreground/50'
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
                            ? 'shrink-0 text-sm font-semibold tabular-nums text-primary'
                            : 'shrink-0 text-sm font-semibold tabular-nums text-muted-foreground'
                        }
                      >
                        {formatEuros(goal.amountRequired)}
                      </span>
                    </div>

                    {isNext && (
                      <div className="space-y-1 pl-5">
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
          )}
        </Card>
      </div>
    </PageContainer>
  )
}
