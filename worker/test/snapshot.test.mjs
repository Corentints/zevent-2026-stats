import assert from 'node:assert/strict'
import test from 'node:test'
import { encodeStreamerSnapshot, getStreamerSnapshotPaths } from '../src/snapshot.ts'

test('encodes every streamer in one compact snapshot', () => {
  const encoded = encodeStreamerSnapshot([
    {
      twitch_id: '123',
      donationAmount: { number: 1250.5 },
      viewersAmount: { number: 420 },
    },
    {
      twitch_id: '456',
      donationAmount: { number: 875 },
      viewersAmount: { number: 210 },
    },
  ])

  assert.deepEqual(JSON.parse(encoded), {
    123: [1250.5, 420],
    456: [875, 210],
  })
})

test('builds bound SQLite JSON paths for a streamer', () => {
  assert.deepEqual(getStreamerSnapshotPaths('123'), {
    amount: '$."123"[0]',
    viewers: '$."123"[1]',
  })
})
