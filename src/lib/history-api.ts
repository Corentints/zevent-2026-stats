import type { DonationSnapshot, StreamerHistoryPoint } from '@/types/zevent'

export const HISTORY_API_URL = (import.meta.env.VITE_HISTORY_API_URL as string | undefined)?.replace(
  /\/$/,
  '',
)

export async function fetchRemoteHistory(): Promise<DonationSnapshot[]> {
  const res = await fetch(`${HISTORY_API_URL}/history`)
  if (!res.ok) {
    throw new Error(`Erreur API historique: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function fetchStreamerHistory(twitchId: string): Promise<StreamerHistoryPoint[]> {
  const res = await fetch(`${HISTORY_API_URL}/history/streamer/${twitchId}`)
  if (!res.ok) {
    throw new Error(`Erreur API historique streamer: ${res.status} ${res.statusText}`)
  }
  return res.json()
}
