// Cifras derivadas del estado. Las pantallas muestran "toda la tienda" (base de ejemplo) más lo que
// cambia en esta sesión: cada venta, compra o ajuste se suma o resta sobre esa base.
import { TODAY } from '@/config'
import { formatCOP, formatNumber } from '@/utils/format'
import { stockStatus } from '@/utils/inventory'
import { hourlySales, categorySales, topProducts, todayBase, yesterdayRef, pastPeriods, periodToday } from '@/data/reports'
import { SEED_INVOICES, SEED_PRODUCTS } from './logic'

const pad2 = (n) => String(n).padStart(2, '0')
const sum = (arr, fn) => arr.reduce((s, x) => s + fn(x), 0)
export const plural = (n, one, many) => (n === 1 ? one : many)

/* ───────────── Ventas ───────────── */

export function invoiceMetrics(invoices) {
  const m = { count: 0, total: 0, paidCount: 0, pending: 0, pendingCount: 0, annulled: 0, card: 0, cash: 0, transfer: 0 }
  for (const i of invoices) {
    if (i.day !== TODAY) continue
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
const SEED_METRICS = invoiceMetrics(SEED_INVOICES)

export function salesSummary(state) {
  const cur = invoiceMetrics(state.invoices)
  const d = (k) => cur[k] - SEED_METRICS[k]
  const b = todayBase
  const total = b.total + d('total')
  const count = b.count + d('count')
  const pending = b.pending + d('pending')
  return {
    total, count, pending,
    paidCount: b.paidCount + d('paidCount'),
    pendingCount: b.pendingCount + d('pendingCount'),
    paid: total - pending,
    card: b.card + d('card'),
    cash: b.cash + d('cash'),
    transfer: b.transfer + d('transfer'),
    avg: count ? Math.round(total / count) : 0,
    annulled: cur.annulled,
  }
}

const fmtPct = (p, label) => `${p >= 0 ? '↑' : '↓'} ${Math.abs(p).toFixed(1).replace('.', ',')} % ${label}`
const pctTone = (p) => (p >= 0 ? 'green' : 'amber')

function todayDeltas(summary) {
  return {
    totalPct: (summary.total / yesterdayRef.total - 1) * 100,
    avgPct: yesterdayRef.avg ? (summary.avg / yesterdayRef.avg - 1) * 100 : 0,
  }
}

export function salesStats(summary) {
  const { totalPct, avgPct } = todayDeltas(summary)
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
  for (const i of invoices) if (i.day === TODAY && i.status !== 'Anulada') fn(i, add)
  return out
}
function withDelta(base, cur, seed) {
  const out = new Map(base)
  cur.forEach((v, k) => out.set(k, (out.get(k) || 0) + v))
  seed.forEach((v, k) => out.set(k, (out.get(k) || 0) - v))
  return out
}

export function reportView(state, { period, compare = true, category = 'Todas las categorías' }) {
  const cat = category && category !== 'Todas las categorías' ? category : null
  const live = period === periodToday
  const past = pastPeriods[period]

  // Metadatos para nombrar productos (catálogo actual > base > facturas).
  const meta = new Map()
  state.invoices.forEach((i) => i.items.forEach((it) => meta.set(it.id, { name: it.name, category: it.category })))
  topProducts.forEach((t) => meta.set(t.id, { name: t.name, category: t.category }))
  state.products.forEach((p) => meta.set(p.id, { name: p.name, category: p.category }))

  let summary, hourly, categoryAmounts, topRows, tag, hourlySubtitle, vsLabel, totalPct, avgPct

  if (live) {
    summary = salesSummary(state)
    ;({ totalPct, avgPct } = todayDeltas(summary))
    tag = 'Hoy'
    hourlySubtitle = '22 de octubre · Acumulado hasta las 14:32'
    vsLabel = 'frente a ayer'

    const baseHours = new Map(hourlySales.map((h) => [h.hour, h.amount]))
    const hours = withDelta(
      baseHours,
      accumulate(state.invoices, (i, add) => add(`${i.hour.slice(0, 2)} h`, i.total)),
      accumulate(SEED_INVOICES, (i, add) => add(`${i.hour.slice(0, 2)} h`, i.total)),
    )
    hourly = [...hours.entries()]
      .filter(([h, v]) => v > 0 || baseHours.has(h))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, amount]) => ({ hour, amount: Math.max(0, amount) }))

    const byCat = (invoices) => accumulate(invoices, (i, add) => i.items.forEach((it) => add(catName(it.category), it.unit * it.qty)))
    categoryAmounts = withDelta(new Map(categorySales.map((c) => [c.name, c.amount])), byCat(state.invoices), byCat(SEED_INVOICES))

    const units = (invoices) => accumulate(invoices, (i, add) => i.items.forEach((it) => add(it.id, it.qty)))
    const sales = (invoices) => accumulate(invoices, (i, add) => i.items.forEach((it) => add(it.id, it.unit * it.qty)))
    const u = withDelta(new Map(topProducts.map((t) => [t.id, t.units])), units(state.invoices), units(SEED_INVOICES))
    const s = withDelta(new Map(topProducts.map((t) => [t.id, t.sales])), sales(state.invoices), sales(SEED_INVOICES))
    topRows = [...u.keys()].map((id) => ({ id, units: u.get(id), sales: s.get(id) || 0 }))
  } else {
    summary = { ...past.summary, paid: past.summary.total - past.summary.pending, avg: Math.round(past.summary.total / past.summary.count) }
    ;({ totalPct, avgPct, tag, hourlySubtitle, vsLabel } = past)
    hourly = past.hourly
    categoryAmounts = new Map(Object.entries(past.categories))
    topRows = past.top
  }

  const catTotal = sum([...categoryAmounts.values()], (v) => Math.max(0, v))
  const categories = categorySales
    .map((c) => {
      const amount = Math.max(0, categoryAmounts.get(c.name) || 0)
      return { name: c.name, color: c.color, amount, percent: catTotal ? Math.round((amount / catTotal) * 1000) / 10 : 0 }
    })
    .filter((c) => !cat || c.name === cat)

  const top = topRows
    .filter((t) => t.units > 0 && meta.has(t.id))
    .map((t) => {
      const p = state.products.find((x) => x.id === t.id)
      return { id: t.id, name: meta.get(t.id).name, category: meta.get(t.id).category, units: t.units, sales: t.sales, stock: p ? p.stock : 0, low: p ? p.stock < p.min : false }
    })
    .filter((t) => !cat || t.category === cat)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)
    .map((t, i) => ({ ...t, rank: pad2(i + 1) }))

  return {
    live, tag, hourlySubtitle, summary, hourly, categories, top,
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
