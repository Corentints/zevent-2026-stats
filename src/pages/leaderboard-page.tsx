import { StreamerTable } from '@/components/streamer-table'
import { PageContainer, PageHeader } from '@/components/page-layout'
import { ZeventDataGate } from '@/components/zevent-data-gate'

export function LeaderboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Classement"
        description="Les collectes individuelles, du montant le plus élevé au plus faible."
      />
      <ZeventDataGate>{(data) => <StreamerTable streamers={data.live} />}</ZeventDataGate>
    </PageContainer>
  )
}
