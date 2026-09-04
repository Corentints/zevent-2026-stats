#!/usr/bin/env node
// Complément à fetch-donation-goals.mjs : l'API officielle (api.zevent.fr) est
// un snapshot pris à un instant T et prend du retard sur les nouveaux
// objectifs ajoutés en cours d'event (ex: Domingo n'en avait qu'1 sur 14 côté
// officiel). zevent.gdoc.fr (propulsé par l'API non officielle
// api.evenmorestats.fr) republie les mêmes objectifs mais reste à jour, donc
// on l'utilise comme source de référence : on écrase l'entrée d'un streamer
// dès que gdoc en a au moins autant que ce qu'on a déjà, pour ne jamais
// régresser sur les rares cas où l'officiel a plus de goals que gdoc.
// Montants renvoyés en centimes par cette API, convertis en euros pour
// matcher le format { amountRequired, title } du reste du projet.

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const OUTPUT_PATH = fileURLToPath(new URL('../public/donation-goals.json', import.meta.url))
const API_BASE = 'https://api.evenmorestats.fr'
const REQUEST_DELAY_MS = 300
const MAX_RETRIES = 6

async function loadExisting() {
  try {
    return JSON.parse(await readFile(OUTPUT_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchJson(path) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(`${API_BASE}${path}`)
    if (res.ok) return res.json()
    if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
      const retryAfter = Number(res.headers.get('retry-after'))
      const backoff = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 1000 * 2 ** attempt
      await sleep(backoff)
      continue
    }
    throw new Error(`${path} → ${res.status}`)
  }
  throw new Error(`max retries exceeded: ${path}`)
}

async function findCurrentEventId() {
  const events = await fetchJson('/events')
  const event = events.find((e) => e.name === 'ZEvent 2026')
  if (!event) throw new Error('ZEvent 2026 introuvable dans /events')
  return event.id
}

async function fetchOverview(eventId) {
  return fetchJson(`/events/${eventId}/donation_goals/overview`)
}

async function fetchGoalsForParticipation(participationId) {
  const goals = await fetchJson(`/participations/${participationId}/donation_goals`)
  return goals.map((g) => ({
    amountRequired: g.amount / 100,
    title: g.name,
  }))
}

async function main() {
  const [result, eventId] = await Promise.all([loadExisting(), findCurrentEventId()])
  const overview = await fetchOverview(eventId)

  const pending = overview.filter((entry) => {
    const twitchId = entry.socials?.twitch?.id
    return twitchId && entry.donation_goals_count > (result[twitchId]?.length ?? 0)
  })
  console.log(`${pending.length} streamer(s) à rafraîchir depuis gdoc (plus à jour)…`)

  let done = 0
  let failed = 0

  for (const entry of pending) {
    const twitchId = entry.socials.twitch.id
    try {
      const goals = await fetchGoalsForParticipation(entry.id)
      if (goals.length >= (result[twitchId]?.length ?? 0)) {
        result[twitchId] = goals
      }
    } catch (err) {
      failed++
      console.warn(`\n  ⚠ ${entry.name} (${twitchId}): ${err.message}`)
    }
    done++
    process.stdout.write(`\r  ${done}/${pending.length}`)
    await sleep(REQUEST_DELAY_MS)
  }

  console.log(`\nTerminé. ${failed} échec(s) restant(s).`)
  await writeFile(OUTPUT_PATH, JSON.stringify(result, null, 2) + '\n')
  console.log(`Écrit dans ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
