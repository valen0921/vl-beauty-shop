// Documentos imprimibles / exportables: factura, cierre de caja y reportes.
import { TODAY, YESTERDAY, STORE_NAME, SELLER } from '@/config'
import logoUrl from '@/assets/logo.svg'
import { formatCOP, formatNumber } from '@/utils/format'
import { stockStatus } from '@/utils/inventory'
import { inventoryNumbers } from '@/store/selectors'
import { downloadCSV, escapeHtml as e, printHTML } from '@/utils/files'

const absoluteLogo = () => new URL(logoUrl, window.location.href).href

/* ───────────── Factura ───────────── */

export function printInvoice(invoice) {
  const base = invoice.base ?? Math.round(invoice.total / 1.21)
  const iva = invoice.total - base
  const rows = invoice.items
    .map((l) => `<tr><td><strong>${e(l.name)}</strong><br><small>${e(l.variant)} · ${l.qty} ud. × ${formatCOP(l.unit)}</small></td><td class="r">${formatCOP(l.unit * l.qty)}</td></tr>`)
    .join('')
  printHTML(`Factura ${invoice.id}`, `
    <div class="head"><div><h1>${e(invoice.id)}</h1><p>${e(invoice.day)} · ${e(invoice.hour)}</p>
      <p>V&amp;L Beauty Shop · NIF B88542139 · Calle de Serrano, 24 · 28001 Madrid</p></div>
      <div style="text-align:right"><img src="${absoluteLogo()}" alt="V&amp;L Beauty Shop"><p><span class="badge">${e(invoice.status)}</span></p></div></div>
    <h2>Facturar a</h2><p><strong style="color:#2b2527">${e(invoice.client)}</strong></p>
    ${invoice.nif ? `<p>NIF ${e(invoice.nif)}</p>` : ''}${invoice.email ? `<p>${e(invoice.email)}</p>` : ''}
    <h2>Detalle</h2><table><thead><tr><th>Producto</th><th class="r">Importe</th></tr></thead><tbody>${rows}
      <tr class="tot"><td class="r">Base imponible</td><td class="r">${formatCOP(base)}</td></tr>
      <tr class="tot"><td class="r">IVA (21 %)</td><td class="r">${formatCOP(iva)}</td></tr>
      <tr class="tot"><td class="r" style="font-size:15px">Total</td><td class="r" style="font-size:15px">${formatCOP(invoice.total)}</td></tr></tbody></table>
    <p style="margin-top:14px">${e(invoice.payNote)}</p>${invoice.note ? `<p>Nota: ${e(invoice.note)}</p>` : ''}
    <p style="margin-top:18px;font-size:11px">Gracias por tu compra · ${e(STORE_NAME)}</p>`)
}

/* ───────────── Cierre de caja ───────────── */

export function printCashClose({ summary, close }) {
  const row = (label, v) => `<tr><td>${label}</td><td class="r">${formatCOP(v)}</td></tr>`
  printHTML(`Cierre de caja ${TODAY}`, `
    <div class="head"><div><h1>Cierre de caja</h1><p>${e(TODAY)} · ${e(STORE_NAME)}</p><p>Responsable: ${e(SELLER)}</p></div><img src="${absoluteLogo()}" alt=""></div>
    <table><tbody>${row('Tarjeta', summary.card)}${row('Efectivo', summary.cash)}${summary.transfer ? row('Transferencia', summary.transfer) : ''}
      <tr class="tot"><td>Total cobrado</td><td class="r">${formatCOP(summary.paid)}</td></tr>
      ${row('Por cobrar (' + summary.pendingCount + ' facturas)', summary.pending)}
      <tr class="tot"><td>Ventas del día</td><td class="r">${formatCOP(summary.total)}</td></tr></tbody></table>
    ${close ? `<h2>Arqueo de efectivo</h2><table><tbody>${row('Efectivo esperado', summary.cash)}${row('Efectivo contado', close.counted)}
      <tr class="tot"><td>Diferencia</td><td class="r">${formatCOP(close.counted - summary.cash)}</td></tr></tbody></table><p>Cierre registrado a las ${e(close.time)}.</p>` : ''}`)
}

/* ───────────── Reportes ───────────── */

const money = (v) => formatCOP(v)
const periodDays = (period) => (period.startsWith('Ayer') ? [YESTERDAY] : period.startsWith('Últimos') ? [TODAY, YESTERDAY] : [TODAY])

// Estructura neutra: se convierte a CSV (valores crudos) o a HTML (valores con formato).
export function buildReportDoc({ type, period, state, view }) {
  if (type === 'Inventario') {
    const n = inventoryNumbers(state)
    return {
      title: 'Reporte de inventario',
      subtitle: `${STORE_NAME} · al ${TODAY}`,
      kpis: [
        { label: 'Unidades disponibles', value: n.units, fmt: formatNumber },
        { label: 'Valor a coste', value: n.value, fmt: money },
        { label: 'Con stock bajo', value: n.low },
        { label: 'Agotados', value: n.out },
      ],
      sections: [{
        heading: 'Existencias por producto',
        columns: [
          { label: 'Código' }, { label: 'Producto' }, { label: 'Marca' }, { label: 'Categoría' }, { label: 'Ubicación' },
          { label: 'Stock', right: true }, { label: 'Mínimo', right: true }, { label: 'Estado' },
          { label: 'Costo unitario', right: true, fmt: money }, { label: 'Valor', right: true, fmt: money },
        ],
        rows: state.products.map((p) => [p.id, p.name, p.brand, p.category, p.location, p.stock, p.min, stockStatus(p).label, p.cost || 0, p.stock * (p.cost || 0)]),
      }],
    }
  }

  const s = view.summary
  const days = periodDays(period)
  return {
    title: 'Reporte de ventas',
    subtitle: `${STORE_NAME} · ${period}${view.category ? ` · ${view.category}` : ''}`,
    kpis: [
      { label: 'Ventas del periodo', value: s.total, fmt: money },
      { label: 'Ventas registradas', value: s.count },
      { label: 'Venta media', value: s.avg, fmt: money },
      { label: 'Cobrado', value: s.paid, fmt: money },
      { label: 'Por cobrar', value: s.pending, fmt: money },
    ],
    sections: [
      { heading: 'Ventas por hora', columns: [{ label: 'Hora' }, { label: 'Importe', right: true, fmt: money }], rows: view.hourly.map((h) => [h.hour, h.amount]) },
      { heading: 'Ventas por categoría', columns: [{ label: 'Categoría' }, { label: 'Importe', right: true, fmt: money }, { label: '% del total', right: true, fmt: (v) => `${String(v).replace('.', ',')} %` }], rows: view.categories.map((c) => [c.name, c.amount, c.percent]) },
      { heading: 'Productos más vendidos', columns: [{ label: '#' }, { label: 'Código' }, { label: 'Producto' }, { label: 'Unidades', right: true }, { label: 'Ventas', right: true, fmt: money }], rows: view.top.map((t) => [t.rank, t.id, t.name, t.units, t.sales]) },
      { heading: 'Cobros del periodo', columns: [{ label: 'Concepto' }, { label: 'Importe', right: true, fmt: money }], rows: [['Tarjeta', view.collections.card], ['Efectivo', view.collections.cash], ...(view.collections.transfer ? [['Transferencia', view.collections.transfer]] : []), ['Por cobrar', view.collections.pending]] },
      {
        heading: 'Facturas registradas',
        columns: [{ label: 'Factura' }, { label: 'Día' }, { label: 'Hora' }, { label: 'Cliente' }, { label: 'Pago' }, { label: 'Estado' }, { label: 'Total', right: true, fmt: money }],
        rows: state.invoices.filter((i) => days.includes(i.day)).map((i) => [i.id, i.day, i.hour, i.client, i.method, i.status, i.total]),
      },
    ],
  }
}

function docToRows(doc) {
  const rows = [[doc.title], [doc.subtitle], []]
  doc.kpis.forEach((k) => rows.push([k.label, k.value]))
  doc.sections.forEach((sec) => {
    rows.push([], [sec.heading], sec.columns.map((c) => c.label), ...sec.rows)
  })
  return rows
}

function docToHTML(doc) {
  const kpis = doc.kpis.map((k) => `<div class="kpi"><span>${e(k.label)}</span><strong>${e(k.fmt ? k.fmt(k.value) : k.value)}</strong></div>`).join('')
  const sections = doc.sections.map((sec) => {
    const head = sec.columns.map((c) => `<th class="${c.right ? 'r' : ''}">${e(c.label)}</th>`).join('')
    const body = sec.rows.length
      ? sec.rows.map((r) => `<tr>${r.map((v, i) => `<td class="${sec.columns[i].right ? 'r' : ''}">${e(sec.columns[i].fmt ? sec.columns[i].fmt(v) : v)}</td>`).join('')}</tr>`).join('')
      : `<tr><td colspan="${sec.columns.length}" style="text-align:center;color:#8c8184">Sin datos en este periodo</td></tr>`
    return `<h2>${e(sec.heading)}</h2><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
  }).join('')
  return `<div class="head"><div><h1>${e(doc.title)}</h1><p>${e(doc.subtitle)}</p><p>Responsable: ${e(SELLER)}</p></div><img src="${absoluteLogo()}" alt=""></div><div class="kpis">${kpis}</div>${sections}`
}

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// format: 'Excel' (archivo .csv que Excel abre directamente) | 'PDF' (diálogo de impresión → Guardar como PDF)
export function exportReport({ doc, format, id, type, period }) {
  const name = `${slug(`reporte ${type} ${period}`)}${id ? `-${id}` : ''}`
  if (format === 'Excel') downloadCSV(`${name}.csv`, docToRows(doc))
  else printHTML(`${doc.title} ${id || ''}`.trim(), docToHTML(doc))
}

// Exportación suelta de una tabla (productos más vendidos, etc.).
export function exportTable(filename, header, rows) {
  downloadCSV(filename, [header, ...rows])
}
