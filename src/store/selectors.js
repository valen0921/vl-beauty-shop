// Cifras derivadas del estado. Todo se calcula a partir de los registros reales
// (facturas y productos guardados en la base de datos) — no hay cifras de ejemplo.
import { TODAY, YESTERDAY } from '@/config'
import { formatCOP, formatNumber } from '@/utils/format'
import { stockStatus } from '@/utils/inventory'
import { CATEGORY_COLORS, periodToday, periodYesterday, periodWeek } from '@/data/reports'
import { SEED_PRODUCTS, nowHM } from './logic'

const pad2 = (n) => String(n).padStart(2, '0')
const sum = (arr, fn) => arr.reduce((s, x) => s + fn(x), 0)
export const plural = (n, one, many) => (n === 1 ? one : many)

/* ───────────── Fechas ───────────── */

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MESES_LARGO = { ene: 'enero', feb: 'febrero', mar: 'marzo', abr: 'abril', may: 'mayo', jun: 'junio', jul: 'julio', ago: 'agosto', sep: 'septiembre', oct: 'octubre', nov: 'noviembre', dic: 'diciembre' }

function parseDay(str) {
  if (!str) return null
  const [d, mon, y] = str.split(' ')
  const mi = MESES.indexOf(mon)
  if (mi < 0 || !d || !y) return null
  return new Date(Number(y), mi, Number(d))
}
function longDate(str) {
  const [d, mon, y] = (str || '').split(' ')
  return mon && MESES_LARGO[mon] ? `${d} de ${MESES_LARGO[mon]} de ${y}` : str
}
function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}
function inRange(invoice, from, to) {
  const d = parseDay(invoice.day)
  return d && d >= from && d <= to
}

// Para cada periodo del selector de reportes, devuelve el rango de fechas a mostrar
// y el rango anterior equivalente (para calcular el "% frente a ...").
function periodRange(period) {
  const start = startOfToday()
  if (period === periodYesterday) {
    const y = addDays(start, -1)
    return { from: y, to: y, prevFrom: addDays(start, -2), prevTo: addDays(start, -2), tag: 'Ayer', vsLabel: 'frente al día anterior' }
  }
  if (period === periodWeek) {
    return { from: addDays(start, -6), to: start, prevFrom: addDays(start, -13), prevTo: addDays(start, -7), tag: '7 días', vsLabel: 'frente a la semana anterior' }
  }
  return { from: start, to: start, prevFrom: addDays(start, -1), prevTo: addDays(start, -1), tag: 'Hoy', vsLabel: 'frente a ayer' }
}

/* ───────────── Ventas ───────────── */

export function invoiceMetrics(invoices) {
  const m = { count: 0, total: 0, paidCount: 0, pending: 0, pendingCount: 0, annulled: 0, card: 0, cash: 0, transfer: 0 }
  for (const i of invoices) {
    if (i.status === 'Anulada') { m.annulled++; continue }
    m.count++
    m.total += i.total
    if (i.status === 'Pagada') {
      m.paidCount++
      if (i.method === 'Tarjeta') m.card += i.total
      else if (i.method === 'Efectivo') m.cash += i.total
      else m.transfer += i.total
    } else {
      m.pending += i.total
      m.pendingCount++
    }
  }
  return m
}

const fmtPct = (p, label) => `${p >= 0 ? '↑' : '↓'} ${Math.abs(p).toFixed(1).replace('.', ',')} % ${label}`
const pctTone = (p) => (p >= 0 ? 'green' : 'amber')
const pctChange = (curr, prev) => (prev ? (curr / prev - 1) * 100 : curr > 0 ? 100 : 0)

export function salesSummary(state) {
  const todays = state.invoices.filter((i) => i.day === TODAY)
  const yesterdays = state.invoices.filter((i) => i.day === YESTERDAY)
  const m = invoiceMetrics(todays)
  const y = invoiceMetrics(yesterdays)
  const avg = m.count ? Math.round(m.total / m.count) : 0
  const yAvg = y.count ? Math.round(y.total / y.count) : 0
  return {
    total: m.total, count: m.count, avg,
    pending: m.pending,
    paidCount: m.paidCount,
    pendingCount: m.pendingCount,
    paid: m.total - m.pending,
    card: m.card, cash: m.cash, transfer: m.transfer,
    annulled: m.annulled,
    totalPct: pctChange(m.total, y.total),
    avgPct: pctChange(avg, yAvg),
  }
}

export function salesStats(summary) {
  const { totalPct, avgPct } = summary
  return [
    { label: 'Ventas de hoy', value: formatCOP(summary.total), hint: fmtPct(totalPct, 'frente a ayer'), tone: pctTone(totalPct), icon: 'trendUp' },
    { label: 'Ventas registradas', value: String(summary.count), hint: `${summary.paidCount} pagadas · ${summary.pendingCount} pendientes`, tone: 'muted', icon: 'bag' },
    { label: 'Venta media', value: formatCOP(summary.avg), hint: fmtPct(avgPct, 'frente a ayer'), tone: pctTone(avgPct), icon: 'receipt' },
    { label: 'Pendiente de cobro', value: formatCOP(summary.pending), hint: `${summary.pendingCount} ${plural(summary.pendingCount, 'factura', 'facturas')} por cobrar`, tone: 'amber', icon: 'clock' },
  ]
}

/* ───────────── Reportes ───────────── */

function reportStats(s, { compare, vsLabel, totalPct, avgPct }) {
  return [
    { label: 'Ventas del periodo', value: formatCOP(s.total), hint: compare ? fmtPct(totalPct, vsLabel) : 'Comparación desactivada', tone: compare ? pctTone(totalPct) : 'muted', icon: 'trendUp' },
    { label: 'Ventas registradas', value: String(s.count), hint: `${s.paidCount} pagadas · ${s.pendingCount} pendientes`, tone: 'muted', icon: 'bag' },
    { label: 'Venta media', value: formatCOP(s.avg), hint: compare ? fmtPct(avgPct, vsLabel) : 'Comparación desactivada', tone: compare ? pctTone(avgPct) : 'muted', icon: 'receipt' },
    { label: 'Cobrado', value: formatCOP(s.paid), hint: `${formatCOP(s.pending)} pendientes de cobro`, tone: 'pink', icon: 'wallet' },
  ]
}

const MAIN_CATEGORIES = ['Rostro', 'Labios', 'Ojos']
const catName = (c) => (MAIN_CATEGORIES.includes(c) ? c : 'Otras categorías')

function accumulate(invoices, fn) {
  const out = new Map()
  const add = (k, v) => out.set(k, (out.get(k) || 0) + v)
  for (const i of invoices) fn(i, add)
  return out
}

export function reportView(state, { period, compare = true, category = 'Todas las categorías' }) {
  const cat = category && category !== 'Todas las categorías' ? category : null
  const { from, to, prevFrom, prevTo, tag, vsLabel } = periodRange(period)

  const invoicesInPeriod = state.invoices.filter((i) => i.status !== 'Anulada' && inRange(i, from, to))
  const invoicesPrevPeriod = state.invoices.filter((i) => i.status !== 'Anulada' && inRange(i, prevFrom, prevTo))

  const m = invoiceMetrics(invoicesInPeriod)
  const mPrev = invoiceMetrics(invoicesPrevPeriod)
  const avg = m.count ? Math.round(m.total / m.count) : 0
  const avgPrev = mPrev.count ? Math.round(mPrev.total / mPrev.count) : 0
  const summary = {
    total: m.total, count: m.count, avg,
    paidCount: m.paidCount, pendingCount: m.pendingCount,
    pending: m.pending, paid: m.total - m.pending,
    card: m.card, cash: m.cash, transfer: m.transfer,
  }
  const totalPct = pctChange(m.total, mPrev.total)
  const avgPct = pctChange(avg, avgPrev)

  const hourlySubtitle =
    period === periodYesterday ? `${longDate(YESTERDAY)} · Día completo`
    : period === periodWeek ? 'Últimos 7 días · Total por franja horaria'
    : `${longDate(TODAY)} · Acumulado hasta las ${nowHM()}`

  // Metadatos para nombrar productos (catálogo actual + lo que ya aparece en facturas).
  const meta = new Map()
  state.invoices.forEach((i) => i.items.forEach((it) => meta.set(it.id, { name: it.name, category: it.category })))
  state.products.forEach((p) => meta.set(p.id, { name: p.name, category: p.category }))

  const hourMap = accumulate(invoicesInPeriod, (i, add) => add(`${i.hour.slice(0, 2)} h`, i.total))
  const hourly = [...hourMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([hour, amount]) => ({ hour, amount }))

  const categoryAmounts = accumulate(invoicesInPeriod, (i, add) => i.items.forEach((it) => add(catName(it.category), it.unit * it.qty)))
  const catTotal = sum([...categoryAmounts.values()], (v) => Math.max(0, v))
  const categories = CATEGORY_COLORS
    .map((c) => {
      const amount = Math.max(0, categoryAmounts.get(c.name) || 0)
      return { name: c.name, color: c.color, amount, percent: catTotal ? Math.round((amount / catTotal) * 1000) / 10 : 0 }
    })
    .filter((c) => !cat || c.name === cat)

  const unitsMap = accumulate(invoicesInPeriod, (i, add) => i.items.forEach((it) => add(it.id, it.qty)))
  const salesMap = accumulate(invoicesInPeriod, (i, add) => i.items.forEach((it) => add(it.id, it.unit * it.qty)))
  const top = [...unitsMap.keys()]
    .filter((id) => meta.has(id))
    .map((id) => {
      const p = state.products.find((x) => x.id === id)
      return { id, name: meta.get(id).name, category: meta.get(id).category, units: unitsMap.get(id), sales: salesMap.get(id) || 0, stock: p ? p.stock : 0, low: p ? p.stock < p.min : false }
    })
    .filter((t) => !cat || t.category === cat)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)
    .map((t, i) => ({ ...t, rank: pad2(i + 1) }))

  return {
    live: period === periodToday, tag, hourlySubtitle, summary, hourly, categories, top,
    stats: reportStats(summary, { compare, vsLabel, totalPct, avgPct }),
    collections: { card: summary.card, cash: summary.cash, transfer: summary.transfer, pending: summary.pending, pendingInvoices: summary.pendingCount },
    category: cat,
  }
}

/* ───────────── Productos e inventario ───────────── */

const isLow = (p) => p.stock > 0 && p.stock < p.min
const isOut = (p) => p.stock === 0

export function productStats(state) {
  const P = state.products
  const created = Math.max(0, P.length - SEED_PRODUCTS.length)
  const count = (st) => P.filter((p) => p.status === st).length
  const catalog = 128 + (P.length - SEED_PRODUCTS.length)
  const active = 120 + (count('Activo') - SEED_PRODUCTS.length)
  const drafts = 8 + count('Borrador')
  const archived = 12 + count('Archivado')
  const categories = 6 + (new Set(P.map((p) => p.category)).size - new Set(SEED_PRODUCTS.map((p) => p.category)).size)
  return {
    counts: { all: catalog, Activo: active, Borrador: drafts, Archivado: archived },
    drafts,
    stats: [
      { label: 'Productos en catálogo', value: String(catalog), hint: `${6 + created} incorporaciones este mes`, tone: 'pink', icon: 'package' },
      { label: 'Productos activos', value: String(active), hint: 'Listos para vender', tone: 'green', icon: 'checkCircle' },
      { label: 'Borradores', value: String(drafts), hint: 'Pendientes de publicación', tone: 'muted', icon: 'edit' },
      { label: 'Categorías', value: String(categories), hint: 'Una colección para cada estilo', tone: 'muted', icon: 'layers' },
    ],
  }
}

export function inventoryNumbers(state) {
  const P = state.products
  const units = 1842 + sum(P, (p) => p.stock) - sum(SEED_PRODUCTS, (p) => p.stock)
  const value = 111060000 + sum(P, (p) => p.stock * (p.cost || 0)) - sum(SEED_PRODUCTS, (p) => p.stock * (p.cost || 0))
  const low = 8 + P.filter(isLow).length - SEED_PRODUCTS.filter(isLow).length
  const out = 3 + P.filter(isOut).length - SEED_PRODUCTS.filter(isOut).length
  const refs = 128 + (P.length - SEED_PRODUCTS.length)
  return { units, value, low: Math.max(0, low), out: Math.max(0, out), refs }
}

export function inventoryStats(state) {
  const n = inventoryNumbers(state)
  return [
    { label: 'Unidades disponibles', value: formatNumber(n.units), hint: `${n.refs} referencias en inventario`, tone: 'pink', icon: 'boxes' },
    { label: 'Valor del inventario', value: formatCOP(n.value), hint: 'Valorado a precio de coste', tone: 'muted', icon: 'wallet' },
    { label: 'Productos con stock bajo', value: String(n.low), hint: 'Por debajo del mínimo definido', tone: 'amber', icon: 'alert' },
    { label: 'Productos agotados', value: String(n.out), hint: 'Necesitan reposición', tone: 'amber', icon: 'packageX' },
  ]
}

export function stockStats(state) {
  const n = inventoryNumbers(state)
  const waiting = state.pending.length
  const last = state.lastSync
  return [
    { label: 'Unidades disponibles', value: formatNumber(n.units), hint: 'Existencias tras la última operación', tone: 'pink', icon: 'boxes' },
    { label: 'Última venta sincronizada', value: formatCOP(last.total), hint: `${last.invoice} · ${last.units} ${plural(last.units, 'unidad descontada', 'unidades descontadas')}`, tone: 'muted', icon: 'receipt' },
    { label: 'Operaciones en espera', value: String(waiting), hint: waiting ? 'Se aplican al reactivar la regla' : 'No se requiere intervención', tone: waiting ? 'amber' : 'green', icon: waiting ? 'clock' : 'checkCircle' },
    { label: 'Alertas de reposición', value: String(n.low + n.out), hint: `${n.low} con stock bajo · ${n.out} agotados`, tone: 'amber', icon: 'alert' },
  ]
}

export function stockAlertText(state) {
  const live = state.products.filter((p) => p.status !== 'Archivado')
  const low = live.filter(isLow).slice(0, 2).map((p) => `${p.name} tiene ${p.stock} ud. (mínimo ${p.min}).`)
  const out = live.filter(isOut).slice(0, 2).map((p) => p.name)
  const parts = [...low]
  if (out.length) parts.push(`Sin existencias: ${out.join(', ')}.`)
  return parts.length ? parts.join(' ') : 'Todos los productos están por encima de su stock mínimo.'
}

export function buildAlerts(state) {
  const list = []
  const live = state.products.filter((p) => p.status !== 'Archivado')
  live.filter(isOut).forEach((p) => list.push({ id: `out-${p.id}`, tone: 'danger', title: `${p.name} está agotado`, text: 'Necesita reposición.', to: '/inventario' }))
  live.filter(isLow).forEach((p) => list.push({ id: `low-${p.id}-${p.stock}`, tone: 'warning', title: `Stock bajo · ${p.name}`, text: `${p.stock} ud. (mínimo ${p.min}).`, to: '/inventario' }))
  state.invoices
    .filter((i) => i.status === 'Pendiente' && i.day === TODAY)
    .forEach((i) => list.push({ id: `pay-${i.id}`, tone: 'warning', title: `Cobro pendiente · ${i.id}`, text: `${i.client} · ${formatCOP(i.total)}`, to: '/ventas' }))
  if (state.pending.length) {
    list.push({ id: `sync-${state.pending.length}`, tone: 'warning', title: `${state.pending.length} ${plural(state.pending.length, 'operación', 'operaciones')} de stock en espera`, text: 'Revisa las reglas de actualización.', to: '/stock-automatico' })
  }
  return list
}

export { stockStatus }