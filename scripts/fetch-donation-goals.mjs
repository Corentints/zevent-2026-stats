#!/usr/bin/env node
// Import ponctuel : snapshot statique des objectifs de dons (donationGoal.goals)
// de chaque streamer via api.zevent.fr/streamer/:id. Ces objectifs bougent peu
// pendant l'event, donc on évite de les refetch en live à chaque visite d'une
// page streamer — on régénère public/donation-goals.json à la main si besoin
// (`npm run fetch:goals`). Reprend automatiquement là où un run précédent
// s'est arrêté (l'API rate-limite fort : on reste séquentiel avec backoff).

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const OUTPUT_PATH = fileURLToPath(new URL('../public/donation-goals.json', import.meta.url))
const REQUEST_DELAY_MS = 400
const MAX_RETRIES = 6

async function loadExisting() {
  try {
    return JSON.parse(await readFile(OUTPUT_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

async function fetchLiveStreamers() {
  const res = await fetch('https://zevent.fr/api/')
  if (!res.ok) throw new Error(`zevent API responded ${res.status}`)
  const json = await res.json()
  return json.live
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchGoals(twitchId) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(`https://api.zevent.fr/streamer/${twitchId}`)
    if (res.ok) {
      const json = await res.json()
      return (json.donationGoal?.goals ?? []).map((g) => ({
        amountRequired: g.amountRequired.number,
        title: g.title,
      }))
    }
    if (res.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = Number(res.headers.get('retry-after'))
      const backoff = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 1000 * 2 ** attempt
      await sleep(backoff)
      continue
    }
    throw new Error(`streamer API responded ${res.status}`)
  }
  throw new Error('max retries exceeded')
}

async function main() {
  const [streamers, result] = await Promise.all([fetchLiveStreamers(), loadExisting()])
  const pending = streamers.filter((s) => !(s.twitch_id in result))
  console.log(
    `${Object.keys(result).length}/${streamers.length} déjà présents, ${pending.length} à récupérer…`,
  )

  let done = 0
  let failed = 0

  for (const s of pending) {
    try {
      result[s.twitch_id] = await fetchGoals(s.twitch_id)
    } catch (err) {
      failed++
      console.warn(`\n  ⚠ ${s.display} (${s.twitch_id}): ${err.message}`)
    }
    done++
    process.stdout.write(`\r  ${done}/${pending.length}`)
    await sleep(REQUEST_DELAY_MS)
  }

  console.log(`\nTerminé. ${failed} échec(s) restant(s).`)
  await writeFile(OUTPUT_PATH, JSON.stringify(result, null, 2) + '\n')
  console.log(`Écrit dans ${OUTPUT_PATH} (${Object.keys(result).length}/${streamers.length} streamers)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
