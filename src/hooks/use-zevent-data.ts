import { useQuery } from '@tanstack/react-query'
import { fetchZeventData } from '@/lib/zevent-api'

export const REFRESH_INTERVAL_MS = 30_000

export function useZeventData() {
  return useQuery({
    queryKey: ['zevent'],
    queryFn: fetchZeventData,
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
    staleTime: REFRESH_INTERVAL_MS,
  })
}
