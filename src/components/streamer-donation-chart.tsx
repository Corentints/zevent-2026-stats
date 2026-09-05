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
    <section className="border-t border-border pt-5 min-[1440px]:pt-4">
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold">Dons reçus</h2>
        {hasEnoughData && <p className="text-xs tabular-nums text-muted-foreground">{history.length} relevés</p>}
      </header>
      <div className="mt-6 min-[1440px]:mt-4">
        {hasEnoughData ? (
          <ChartContainer
            config={chartConfig}
            className="h-[280px] w-full min-[1440px]:h-[clamp(140px,calc((100vh-24rem)/2),200px)]"
          >
            <AreaChart data={history} margin={{ left: 8, right: 12, top: 8 }}>
              <defs>
                <linearGradient id="fillStreamerAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="2 6" />
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
                strokeWidth={1.75}
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
