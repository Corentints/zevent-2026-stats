import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchRemoteHistory, HISTORY_API_URL } from '@/lib/history-api'
import { REFRESH_INTERVAL_MS } from '@/hooks/use-zevent-data'
import type { DonationSnapshot, ZeventResponse } from '@/types/zevent'

const STORAGE_KEY = 'zevent-donation-history-v1'
const MAX_POINTS = 1000
const MAX_AGE_MS = 48 * 60 * 60 * 1000
const REFRESH_DEDUPE_MS = 5 * 60 * 1000

function loadHistory(): DonationSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as DonationSnapshot[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function saveHistory(history: DonationSnapshot[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch {
    // localStorage indisponible ou plein : on ignore, la session courante reste en mémoire
  }
}

function useLocalDonationHistory(data: ZeventResponse | undefined) {
  const [history, setHistory] = useState<DonationSnapshot[]>(() => loadHistory())

  useEffect(() => {
    if (!data) return

    const now = Date.now()
    const snapshot: DonationSnapshot = {
      time: now,
      total: data.donationAmount.number,
      viewers: data.viewersCount.number,
    }

    setHistory((prev) => {
      const last = prev[prev.length - 1]
      if (last && last.total === snapshot.total && now - last.time < REFRESH_DEDUPE_MS) {
        return prev
      }
      const cutoff = now - MAX_AGE_MS
      const next = [...prev, snapshot]
        .filter((point) => point.time >= cutoff)
        .slice(-MAX_POINTS)
      saveHistory(next)
      return next
    })
  }, [data])

  return history
}

/**
 * Historique des dons. Si `VITE_HISTORY_API_URL` pointe vers le worker Cloudflare
 * (voir worker/), on utilise l'historique partagé qu'il accumule en continu
 * (cron toutes les 2 min + stockage R2), commun à tous les visiteurs. Sinon,
 * ou si le fetch échoue, on retombe sur l'accumulation locale (par navigateur).
 */
export function useDonationHistory(data: ZeventResponse | undefined) {
  const local = useLocalDonationHistory(data)

  const remote = useQuery({
    queryKey: ['zevent-history'],
    queryFn: fetchRemoteHistory,
    enabled: Boolean(HISTORY_API_URL),
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: REFRESH_INTERVAL_MS,
  })

  if (HISTORY_API_URL && remote.data) {
    return remote.data
  }

  return local
}
