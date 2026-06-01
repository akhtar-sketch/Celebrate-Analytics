export function fmtCurrency(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function fmtNumber(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

export function fmtPercent(value: number | null | undefined, decimals = 2): string {
  if (value == null) return '—'
  return `${value.toFixed(decimals)}%`
}

export function fmtDelta(
  current: number | null,
  prev: number | null
): { value: number | null; direction: 'up' | 'down' | 'neutral'; label: string } {
  if (current == null || prev == null || prev === 0) {
    return { value: null, direction: 'neutral', label: '—' }
  }
  const delta = ((current - prev) / Math.abs(prev)) * 100
  return {
    value: delta,
    direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral',
    label: `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`,
  }
}
