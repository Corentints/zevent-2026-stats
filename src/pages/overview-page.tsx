import { useMemo } from 'react'
import { DonationChart } from '@/components/donation-chart'
import { StatsHeader } from '@/components/stats-header'
import { ZeventDataGate } from '@/components/zevent-data-gate'
import { useDonationHistory } from '@/hooks/use-donation-history'
import { useZeventData } from '@/hooks/use-zevent-data'

export function OverviewPage() {
  const { data, dataUpdatedAt } = useZeventData()
  const history = useDonationHistory(data)

  const onlineCount = useMemo(
    () => data?.live.filter((s) => s.online).length ?? 0,
    [data],
  )

  return (
    <ZeventDataGate>
      {(data) => (
        <div className="space-y-6">
          <StatsHeader data={data} lastUpdated={dataUpdatedAt} onlineCount={onlineCount} />
          <DonationChart history={history} />
        </div>
      )}
    </ZeventDataGate>
  )
}
