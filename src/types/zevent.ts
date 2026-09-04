export interface FormattedNumber {
  number: number
  formatted: string
}

export interface Streamer {
  twitch_id: string
  display: string
  twitch: string
  profileUrl: string
  online: boolean
  game: string
  viewersAmount: FormattedNumber
  streamlabsId: string
  donationUrl: string
  ref: string
  donationAmount: FormattedNumber
}

export interface ZeventResponse {
  live: Streamer[]
  globalDonationUrl: string
  streamlabsCampaignId: string
  donationAmount: FormattedNumber
  viewersCount: FormattedNumber
  calendar: unknown[]
  marquee?: unknown
  widgetVersionId?: string
  eventSourceDisabled?: boolean
  websiteMode?: string
  eventSourceWhitelist?: unknown
}

export interface DonationSnapshot {
  time: number
  total: number
  viewers: number
}

export interface StreamerHistoryPoint {
  time: number
  amount: number
  viewers: number
}

export interface DonationGoal {
  amountRequired: number
  title: string
}
