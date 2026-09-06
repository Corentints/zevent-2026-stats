import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { getTooltipNumber, smoothSeries } from '@/lib/chart-data'
import { formatDateTime, formatEuros, formatNumber } from '@/lib/format'
import type { StreamerHistoryPoint } from '@/types/zevent'

const chartConfig = {
  smoothed: {
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
  const firstPoint = history[0]
  const lastPoint = history.at(-1)
  const delta = firstPoint && lastPoint ? Math.max(0, lastPoint.amount - firstPoint.amount) : 0
  const chartData = smoothSeries(history, (point) => point.amount)

  return (
    <section>
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold">Dons reçus</h2>
        {hasEnoughData && (
          <p className="text-xs font-medium tabular-nums text-primary">+{formatEuros(delta)}</p>
        )}
      </header>
      <div className="mt-6 min-[1440px]:mt-4">
        {hasEnoughData ? (
          <ChartContainer
            config={chartConfig}
            className="h-[280px] w-full min-[1440px]:h-[clamp(140px,calc((100vh-24rem)/2),200px)]"
          >
            <AreaChart data={chartData} margin={{ left: 8, right: 12, top: 8 }}>
              <defs>
                <linearGradient id="fillStreamerAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="2 6" />
              <XAxis
                dataKey="time"
                type="number"
                scale="linear"
                domain={['dataMin', 'dataMax']}
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
                    formatter={(value, _name, _item, _index, payload) => [
                      formatEuros(getTooltipNumber(payload, 'amount', value)),
                      ' Dons',
                    ]}
                  />
                }
              />
              <Area
                dataKey="smoothed"
                type="natural"
                fill="url(#fillStreamerAmount)"
                stroke="var(--chart-1)"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground min-[1440px]:h-[clamp(140px,calc((100vh-24rem)/2),200px)]">
            {isConfigured ? 'En attente de données historiques…' : 'Historique indisponible.'}
          </div>
        )}
      </div>
    </section>
  )
}
