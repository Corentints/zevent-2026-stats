import type { ZeventResponse } from '@/types/zevent'

const API_URL = '/api/zevent'

export async function fetchZeventData(): Promise<ZeventResponse> {
  const res = await fetch(API_URL)
  if (!res.ok) {
    throw new Error(`Erreur API ZEvent: ${res.status} ${res.statusText}`)
  }
  return res.json()
}
