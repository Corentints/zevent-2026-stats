const eurFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('fr-FR')

const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
})

const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatEuros(value: number): string {
  return eurFormatter.format(value)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatTime(timestamp: number): string {
  return Number.isFinite(timestamp) ? timeFormatter.format(new Date(timestamp)) : '—'
}

export function formatDateTime(timestamp: number): string {
  return Number.isFinite(timestamp) ? dateTimeFormatter.format(new Date(timestamp)) : '—'
}
