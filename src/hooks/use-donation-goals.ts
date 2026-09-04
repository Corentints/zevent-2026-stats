import { useQuery } from '@tanstack/react-query'
import { fetchDonationGoals } from '@/lib/donation-goals-api'

/**
 * Objectifs de dons par streamer : snapshot statique (voir
 * scripts/fetch-donation-goals.mjs), pas de polling — ça ne bouge quasiment
 * pas pendant l'event.
 */
export function useDonationGoals() {
  return useQuery({
    queryKey: ['donation-goals'],
    queryFn: fetchDonationGoals,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
