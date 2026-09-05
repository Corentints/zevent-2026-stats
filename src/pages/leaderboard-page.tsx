import { StreamerTable } from '@/components/streamer-table'
import { PageContainer, PageHeader } from '@/components/page-layout'
import { ZeventDataGate } from '@/components/zevent-data-gate'
import { useDocumentTitle } from '@/hooks/use-document-title'

export function LeaderboardPage() {
  useDocumentTitle('Classement — ZEvent')

  return (
    <PageContainer>
      <PageHeader title="Classement" />
      <ZeventDataGate>{(data) => <StreamerTable streamers={data.live} />}</ZeventDataGate>
    </PageContainer>
  )
}
