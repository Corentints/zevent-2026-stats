export interface Env {
  DB: D1Database
}

interface DonationSnapshot {
  time: number
  total: number
  viewers: number
}

interface StreamerHistoryPoint {
  time: number
  amount: number
  viewers: number
}

interface ZeventStreamer {
  twitch_id: string
  display: string
  donationAmount: { number: number }
  viewersAmount: { number: number }
}

interface ZeventApiResponse {
  donationAmount: { number: number }
  viewersCount: { number: number }
  live: ZeventStreamer[]
}

const ZEVENT_API_URL = 'https://zevent.fr/api/'
// Nombre de streamers par requête d'insertion groupée. D1 limite le nombre
// total de paramètres liés (observé en pratique bien en-dessous des 999
// autorisés par SQLite) : on reste prudent avec des lots de 20 (5 colonnes
// * 20 = 100 paramètres par requête).
const CHUNK_SIZE = 20
// Le cron tourne toutes les 6 minutes : on a largement la marge pour retenter
// un fetch qui échoue ponctuellement (timeout, 5xx) plutôt que de perdre tout
// le point de mesure.
const FETCH_TIMEOUT_MS = 10_000
const MAX_FETCH_ATTEMPTS = 3
const RETRY_DELAY_MS = [1_000, 3_000]

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchZeventData(): Promise<ZeventApiResponse> {
  let lastError: unknown
  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    try {
      const res = await fetch(ZEVENT_API_URL, {
        headers: { 'User-Agent': 'zevent-history-worker (+https://github.com/)' },
        signal: controller.signal,
      })
      if (!res.ok) {
        throw new Error(`zevent API responded ${res.status}`)
      }
      return await res.json<ZeventApiResponse>()
    } catch (err) {
      lastError = err
      console.error(`[collectSnapshot] fetch attempt ${attempt}/${MAX_FETCH_ATTEMPTS} failed:`, err)
      if (attempt < MAX_FETCH_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS[attempt - 1])
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }
  throw new Error(`zevent API unreachable after ${MAX_FETCH_ATTEMPTS} attempts: ${String(lastError)}`)
}

async function collectSnapshot(env: Env): Promise<void> {
  const json = await fetchZeventData()
  const time = Date.now()

  // Chaque groupe est exécuté séparément (pas de env.DB.batch groupant tout) :
  // D1 rejette une requête si le nombre total de paramètres liés dépasse une
  // limite bien plus basse que les 999 autorisés nativement par SQLite.
  // On perd l'atomicité inter-requêtes, ce qui est acceptable ici (un point
  // manquant pour un streamer n'invalide pas le reste du relevé).
  const inserts = [
    env.DB
      .prepare('INSERT INTO global_history (time, total, viewers) VALUES (?, ?, ?)')
      .bind(time, json.donationAmount.number, json.viewersCount.number)
      .run(),
    ...chunk(json.live, CHUNK_SIZE).map((group) => {
      const placeholders = group.map(() => '(?, ?, ?, ?, ?)').join(', ')
      const values = group.flatMap((s) => [
        time,
        s.twitch_id,
        s.display,
        s.donationAmount.number,
        s.viewersAmount.number,
      ])
      return env.DB
        .prepare(
          `INSERT INTO streamer_history (time, twitch_id, display, amount, viewers) VALUES ${placeholders}`,
        )
        .bind(...values)
        .run()
    }),
  ]

  await Promise.all(inserts)
}

async function readGlobalHistory(env: Env): Promise<DonationSnapshot[]> {
  const { results } = await env.DB.prepare(
    'SELECT time, total, viewers FROM global_history ORDER BY time ASC',
  ).all<DonationSnapshot>()
  return results
}

async function readStreamerHistory(env: Env, twitchId: string): Promise<StreamerHistoryPoint[]> {
  const { results } = await env.DB
    .prepare('SELECT time, amount, viewers FROM streamer_history WHERE twitch_id = ? ORDER BY time ASC')
    .bind(twitchId)
    .all<StreamerHistoryPoint>()
  return results
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(collectSnapshot(env))
  },

  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS })
    }

    const responseHeaders = { ...CORS_HEADERS, 'Cache-Control': 'public, max-age=30' }

    if (url.pathname === '/history') {
      return Response.json(await readGlobalHistory(env), { headers: responseHeaders })
    }

    const streamerMatch = url.pathname.match(/^\/history\/streamer\/([^/]+)$/)
    if (streamerMatch) {
      return Response.json(await readStreamerHistory(env, streamerMatch[1]), {
        headers: responseHeaders,
      })
    }

    return new Response('Not found', { status: 404, headers: CORS_HEADERS })
  },
} satisfies ExportedHandler<Env>
