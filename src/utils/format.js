export const formatNumber = (n) =>
  String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

export const formatCOP = (n) => `${n < 0 ? '-' : ''}$${formatNumber(n)}`

export const formatDelta = (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}`
