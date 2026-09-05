import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatDateTime, formatEuros, formatNumber } from '@/lib/format'
import type { DonationSnapshot } from '@/types/zevent'

const chartConfig = {
  total: {
    label: 'Total des dons',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

interface DonationChartProps {
  history: DonationSnapshot[]
}

export function DonationChart({ history }: DonationChartProps) {
  const hasEnoughData = history.length >= 2

  return (
    <section className="border-t border-border pt-5">
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold">Évolution des dons</h2>
        {hasEnoughData && <p className="text-xs tabular-nums text-muted-foreground">{history.length} relevés</p>}
      </header>
      <div className="mt-6">
        {hasEnoughData ? (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <LineChart data={history} margin={{ left: 8, right: 12, top: 8 }}>
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
                    formatter={(value) => [
                      formatEuros(Number(value)),
                      ' Total',
                    ]}
                  />
                }
              />
              <Line
                dataKey="total"
                type="monotone"
                stroke="var(--chart-1)"
                strokeWidth={1.75}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
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
