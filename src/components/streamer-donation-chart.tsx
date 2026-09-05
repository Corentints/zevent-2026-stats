import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatDateTime, formatEuros, formatNumber } from '@/lib/format'
import type { StreamerHistoryPoint } from '@/types/zevent'

const chartConfig = {
  amount: {
    label: 'Dons reçus',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

interface StreamerDonationChartProps {
  history: StreamerHistoryPoint[]
  isConfigured: boolean
}

export function StreamerDonationChart({ history, isConfigured }: StreamerDonationChartProps) {
  const hasEnoughData = history.length >= 2

  return (
    <section className="border-t border-border pt-5">
      <header className="space-y-1">
        <h2 className="text-base font-semibold">Dons reçus</h2>
        <p className="text-sm text-muted-foreground">
          {!isConfigured
            ? "Historique indisponible : l'API d'historique partagé n'est pas configurée."
            : hasEnoughData
              ? `Évolution des dons reçus par ce streamer (${history.length} points relevés)`
              : "Les points s'accumulent au fil des rafraîchissements de l'API — revenez dans quelques minutes pour voir la courbe se dessiner."}
        </p>
      </header>
      <div className="mt-6">
        {hasEnoughData ? (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart data={history} margin={{ left: 8, right: 12, top: 8 }}>
              <defs>
                <linearGradient id="fillStreamerAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={40}
                tickFormatter={(value: number) => formatDateTime(value)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={(value: number) => formatNumber(value)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_value, payload) => {
                      const time = payload?.[0]?.payload?.time
                      return typeof time === 'number' ? formatDateTime(time) : ''
                    }}
                    formatter={(value) => [formatEuros(Number(value)), ' Dons']}
                  />
                }
              />
              <Area
                dataKey="amount"
                type="monotone"
                fill="url(#fillStreamerAmount)"
                stroke="var(--chart-1)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            En attente de données historiques…
          </div>
        )}
      </div>
    </section>
  )
}
