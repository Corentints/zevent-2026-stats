import { useMemo } from 'react'
import { DonationChart } from '@/components/donation-chart'
import { PageContainer, PageHeader } from '@/components/page-layout'
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
    <PageContainer>
      <PageHeader
        title="Vue d'ensemble"
        description="Dons, audience et progression de l'événement en direct."
      />
      <ZeventDataGate>
        {(data) => (
          <>
            <StatsHeader data={data} lastUpdated={dataUpdatedAt} onlineCount={onlineCount} />
            <DonationChart history={history} />
          </>
        )}
      </ZeventDataGate>
    </PageContainer>
  )
}
