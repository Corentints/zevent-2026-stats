import { StreamerTable } from '@/components/streamer-table'
import { ZeventDataGate } from '@/components/zevent-data-gate'

export function LeaderboardPage() {
  return (
    <ZeventDataGate>{(data) => <StreamerTable streamers={data.live} />}</ZeventDataGate>
  )
}
