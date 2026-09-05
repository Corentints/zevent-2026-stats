export const SNAPSHOT_TWITCH_ID = '__zevent_snapshot__'

export interface SnapshotStreamer {
  twitch_id: string
  donationAmount: { number: number }
  viewersAmount: { number: number }
}

type CompactStreamerPoint = [amount: number, viewers: number]

export function encodeStreamerSnapshot(streamers: SnapshotStreamer[]): string {
  const points = Object.fromEntries(
    streamers.map(
      (streamer) =>
        [
          streamer.twitch_id,
          [streamer.donationAmount.number, streamer.viewersAmount.number],
        ] satisfies [string, CompactStreamerPoint],
    ),
  )

  return JSON.stringify(points)
}

export function getStreamerSnapshotPaths(twitchId: string) {
  const escapedId = twitchId.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
  const basePath = `$."${escapedId}"`

  return {
    amount: `${basePath}[0]`,
    viewers: `${basePath}[1]`,
  }
}
