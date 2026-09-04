import { useQuery } from '@tanstack/react-query'
import { REFRESH_INTERVAL_MS } from '@/hooks/use-zevent-data'
import { fetchStreamerHistory, HISTORY_API_URL } from '@/lib/history-api'

export function useStreamerHistory(twitchId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['zevent-history', 'streamer', twitchId],
    queryFn: () => fetchStreamerHistory(twitchId!),
    enabled: enabled && Boolean(HISTORY_API_URL) && Boolean(twitchId),
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: REFRESH_INTERVAL_MS,
  })
}
