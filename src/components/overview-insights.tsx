import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatEuros, formatNumber, formatTime } from '@/lib/format'
import type { DonationSnapshot, Streamer } from '@/types/zevent'

interface OverviewInsightsProps {
  history: DonationSnapshot[]
  streamers: Streamer[]
}

const percentFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1,
})

function StreamerList({
  streamers,
  value,
}: {
  streamers: Streamer[]
  value: (streamer: Streamer) => string
}) {
  return (
    <ol className="divide-y divide-border border-y border-border">
      {streamers.map((streamer, index) => (
        <li key={streamer.twitch_id}>
          <Link
            to="/streamer/$twitchId"
            params={{ twitchId: streamer.twitch_id }}
            className="group flex items-center gap-3 py-3 transition-colors hover:text-primary"
          >
            <span className="w-4 shrink-0 text-xs tabular-nums text-muted-foreground">
              {index + 1}
            </span>
            <Avatar className={streamer.online ? 'size-7' : 'size-7 opacity-65'}>
              <AvatarImage src={streamer.profileUrl} alt={streamer.display} />
              <AvatarFallback className="text-[10px]">
                {streamer.display.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {streamer.display}
            </span>
            <span className="shrink-0 text-sm font-medium tabular-nums text-foreground group-hover:text-primary">
              {value(streamer)}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}

export function OverviewInsights({ history, streamers }: OverviewInsightsProps) {
  const byDonations = [...streamers].sort(
    (a, b) => b.donationAmount.number - a.donationAmount.number,
  )
  const byAudience = streamers
    .filter((streamer) => streamer.online)
    .sort((a, b) => b.viewersAmount.number - a.viewersAmount.number)

  const individualTotal = streamers.reduce(
    (total, streamer) => total + streamer.donationAmount.number,
    0,
  )
  const topFiveTotal = byDonations
    .slice(0, 5)
    .reduce((total, streamer) => total + streamer.donationAmount.number, 0)
  const topFiveShare = individualTotal > 0 ? (topFiveTotal / individualTotal) * 100 : 0
  const averageCollection = streamers.length > 0 ? individualTotal / streamers.length : 0

  const orderedHistory = [...history].sort((a, b) => a.time - b.time)
  const latest = orderedHistory.at(-1)
  const hourAgo = latest ? latest.time - 60 * 60 * 1000 : 0
  const reference = latest
    ? [...orderedHistory].reverse().find((point) => point.time <= hourAgo) ?? orderedHistory[0]
    : undefined
  const elapsedHours = latest && reference ? (latest.time - reference.time) / (60 * 60 * 1000) : 0
  const hourlyPace =
    latest && reference && elapsedHours > 0
      ? Math.max(0, latest.total - reference.total) / elapsedHours
      : undefined
  const peakAudience = orderedHistory.reduce(
    (peak, point) => Math.max(peak, point.viewers),
    0,
  )

  const insights = [
    {
      label: elapsedHours >= 0.9 ? 'Rythme sur une heure' : 'Rythme depuis le premier relevé',
      value: hourlyPace === undefined ? '—' : `${formatEuros(hourlyPace)} / h`,
      note: reference ? `base à ${formatTime(reference.time)}` : 'historique insuffisant',
    },
    {
      label: 'Part du top 5',
      value: `${percentFormatter.format(topFiveShare)} %`,
      note: 'des collectes individuelles',
    },
    {
      label: 'Collecte moyenne',
      value: formatEuros(averageCollection),
      note: 'par streamer',
    },
    {
      label: "Pic d'audience observé",
      value: peakAudience > 0 ? formatNumber(peakAudience) : '—',
      note: 'sur la période enregistrée',
    },
  ]

  return (
    <section className="space-y-8 border-t border-border pt-5">
      <div>
        <h2 className="text-base font-semibold">Quelques repères</h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
          {insights.map((insight) => (
            <div key={insight.label}>
              <dt className="text-xs text-muted-foreground">{insight.label}</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">{insight.value}</dd>
              <p className="mt-0.5 text-xs text-muted-foreground">{insight.note}</p>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 className="text-base font-semibold">Collectes en tête</h2>
            <Link to="/classement" className="text-xs text-muted-foreground hover:text-foreground">
              Voir le classement
            </Link>
          </div>
          <StreamerList
            streamers={byDonations.slice(0, 5)}
            value={(streamer) => formatEuros(streamer.donationAmount.number)}
          />
        </div>

        <div>
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 className="text-base font-semibold">Audience en direct</h2>
            <span className="text-xs tabular-nums text-muted-foreground">
              {byAudience.length} en ligne
            </span>
          </div>
          {byAudience.length > 0 ? (
            <StreamerList
              streamers={byAudience.slice(0, 5)}
              value={(streamer) => formatNumber(streamer.viewersAmount.number)}
            />
          ) : (
            <p className="border-y border-border py-6 text-sm text-muted-foreground">
              Aucune chaîne en direct pour le moment.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
