import type { DonationGoal } from '@/types/zevent'

export type DonationGoalsMap = Record<string, DonationGoal[]>

export async function fetchDonationGoals(): Promise<DonationGoalsMap> {
  const res = await fetch('/donation-goals.json')
  if (!res.ok) {
    throw new Error(`Erreur objectifs de dons: ${res.status} ${res.statusText}`)
  }
  return res.json()
}
