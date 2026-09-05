import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatDateTime, formatNumber } from '@/lib/format'
import type { StreamerHistoryPoint } from '@/types/zevent'

const chartConfig = {
  viewers: {
    label: 'Spectateurs',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig

interface StreamerViewersChartProps {
  history: StreamerHistoryPoint[]
  isConfigured: boolean
}

export function StreamerViewersChart({ history, isConfigured }: StreamerViewersChartProps) {
  const hasEnoughData = history.length >= 2

  return (
    <section className="border-t border-border pt-5">
      <header className="space-y-1">
        <h2 className="text-base font-semibold">Audience</h2>
        <p className="text-sm text-muted-foreground">
          {!isConfigured
            ? "Historique indisponible : l'API d'historique partagé n'est pas configurée."
            : hasEnoughData
              ? `Évolution du nombre de spectateurs (${history.length} points relevés)`
              : "Les points s'accumulent au fil des rafraîchissements de l'API — revenez dans quelques minutes pour voir la courbe se dessiner."}
        </p>
      </header>
      <div className="mt-6">
        {hasEnoughData ? (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart data={history} margin={{ left: 8, right: 12, top: 8 }}>
              <defs>
                <linearGradient id="fillStreamerViewers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.02} />
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
                    formatter={(value) => [formatNumber(Number(value)), ' Spectateurs']}
                  />
                }
              />
              <Area
                dataKey="viewers"
                type="monotone"
                fill="url(#fillStreamerViewers)"
                stroke="var(--chart-3)"
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
