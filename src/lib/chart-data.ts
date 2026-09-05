export function smoothSeries<T>(
  points: T[],
  getValue: (point: T) => number,
  radius = 3,
): Array<T & { smoothed: number }> {
  if (points.length < 3) {
    return points.map((point) => ({ ...point, smoothed: getValue(point) }))
  }

  return points.map((point, index) => {
    const start = Math.max(0, index - radius)
    const end = Math.min(points.length - 1, index + radius)
    let weightedTotal = 0
    let totalWeight = 0

    for (let current = start; current <= end; current += 1) {
      const weight = radius + 1 - Math.abs(current - index)
      weightedTotal += getValue(points[current]) * weight
      totalWeight += weight
    }

    return {
      ...point,
      smoothed: weightedTotal / totalWeight,
    }
  })
}

export function getTooltipNumber(payload: unknown, key: string, fallback: unknown): number {
  if (typeof payload === 'object' && payload !== null && key in payload) {
    const value = (payload as Record<string, unknown>)[key]
    if (typeof value === 'number') return value
  }

  return Number(fallback)
}
