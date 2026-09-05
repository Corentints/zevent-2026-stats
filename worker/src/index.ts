import {
  encodeStreamerSnapshot,
  getStreamerSnapshotPaths,
  SNAPSHOT_TWITCH_ID,
  type SnapshotStreamer,
} from './snapshot'

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

interface ZeventStreamer extends SnapshotStreamer {
  display: string
}

interface ZeventApiResponse {
  donationAmount: { number: number }
  viewersCount: { number: number }
  live: ZeventStreamer[]
}

const ZEVENT_API_URL = 'https://zevent.fr/api/'
const FETCH_TIMEOUT_MS = 10_000
const MAX_FETCH_ATTEMPTS = 3
const RETRY_DELAY_MS = [1_000, 3_000]

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
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

  // Un relevé complet tient dans une seule ligne. La table possède deux index,
  // donc D1 facture trois écritures par minute au lieu d'environ 1 000 avec une
  // ligne par streamer. `amount` et `viewers` portent les valeurs globales ; le
  // champ `display` contient les points streamers sous forme compacte.
  await env.DB
    .prepare(
      'INSERT INTO streamer_history (time, twitch_id, display, amount, viewers) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(
      time,
      SNAPSHOT_TWITCH_ID,
      encodeStreamerSnapshot(json.live),
      json.donationAmount.number,
      json.viewersCount.number,
    )
    .run()
}

async function readGlobalHistory(env: Env): Promise<DonationSnapshot[]> {
  const { results } = await env.DB
    .prepare(
      `SELECT time, total, viewers
       FROM (
         SELECT time, total, viewers FROM global_history
         UNION ALL
         SELECT time, amount AS total, viewers
         FROM streamer_history
         WHERE twitch_id = ?
       )
       ORDER BY time ASC`,
    )
    .bind(SNAPSHOT_TWITCH_ID)
    .all<DonationSnapshot>()
  return results
}

async function readStreamerHistory(env: Env, twitchId: string): Promise<StreamerHistoryPoint[]> {
  const paths = getStreamerSnapshotPaths(twitchId)
  const { results } = await env.DB
    .prepare(
      `SELECT time, amount, viewers
       FROM (
         SELECT time, amount, viewers
         FROM streamer_history
         WHERE twitch_id = ?
         UNION ALL
         SELECT
           time,
           CAST(json_extract(display, ?) AS REAL) AS amount,
           CAST(json_extract(display, ?) AS INTEGER) AS viewers
         FROM streamer_history
         WHERE twitch_id = ? AND json_type(display, ?) IS NOT NULL
       )
       ORDER BY time ASC`,
    )
    .bind(twitchId, paths.amount, paths.viewers, SNAPSHOT_TWITCH_ID, paths.amount)
    .all<StreamerHistoryPoint>()
  return results
}

async function cacheResponse(
  request: Request,
  ctx: ExecutionContext,
  response: Response,
): Promise<Response> {
  ctx.waitUntil(caches.default.put(request, response.clone()))
  return response
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(collectSnapshot(env))
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS })
    }

    const cached = await caches.default.match(request)
    if (cached) return cached

    const responseHeaders = { ...CORS_HEADERS, 'Cache-Control': 'public, max-age=55' }

    if (url.pathname === '/history') {
      return cacheResponse(
        request,
        ctx,
        Response.json(await readGlobalHistory(env), { headers: responseHeaders }),
      )
    }

    const streamerMatch = url.pathname.match(/^\/history\/streamer\/([^/]+)$/)
    if (streamerMatch) {
      return cacheResponse(
        request,
        ctx,
        Response.json(await readStreamerHistory(env, streamerMatch[1]), {
          headers: responseHeaders,
        }),
      )
    }

    return new Response('Not found', { status: 404, headers: CORS_HEADERS })
  },
} satisfies ExportedHandler<Env>
