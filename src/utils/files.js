// Utilidades de archivos: CSV (leer / escribir), descargas e impresión (PDF).

const SEP = ';' // Excel en español abre bien el punto y coma

const csvCell = (v) => {
  const s = v == null ? '' : String(v)
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export const toCSV = (rows) => rows.map((r) => r.map(csvCell).join(SEP)).join('\r\n')

export function downloadFile(filename, content, mime = 'text/csv;charset=utf-8') {
  // El BOM hace que Excel respete tildes y eñes.
  const parts = mime.startsWith('text/csv') ? ['\uFEFF', content] : [content]
  const url = URL.createObjectURL(new Blob(parts, { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const downloadCSV = (filename, rows) => downloadFile(filename, toCSV(rows))

export function parseCSV(text) {
  const src = text.replace(/^\uFEFF/, '')
  const firstLine = src.split(/\r?\n/, 1)[0] || ''
  const count = (ch) => firstLine.split(ch).length - 1
  const delimiter = [';', '\t', ','].reduce((best, ch) => (count(ch) > count(best) ? ch : best), ',')

  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++ }
      else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === delimiter) { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(cell); cell = ''
      rows.push(row); row = []
    } else cell += c
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  return rows.map((r) => r.map((c) => c.trim())).filter((r) => r.some((c) => c !== ''))
}

const normalizeHeader = (h) => h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '')
const HEADER_ALIASES = {
  id: ['codigo', 'id', 'sku', 'code', 'identificador'],
  name: ['nombre', 'name', 'producto'],
  brand: ['marca', 'brand'],
  variant: ['variante', 'tono', 'variant'],
  category: ['categoria', 'category'],
  price: ['precio', 'price'],
  stock: ['stock', 'existencias', 'unidades'],
  min: ['minimo', 'min', 'stockminimo'],
  location: ['ubicacion', 'location'],
  status: ['estado', 'status'],
  description: ['descripcion', 'description'],
}

export const PRODUCT_CSV_HEADER = ['codigo', 'nombre', 'marca', 'variante', 'categoria', 'precio', 'stock', 'minimo', 'ubicacion', 'estado', 'descripcion']

export function parseProductsCSV(text) {
  const table = parseCSV(text)
  if (table.length < 2) return { error: 'El archivo está vacío o solo tiene la fila de encabezados.' }
  const keys = table[0].map((h) => {
    const n = normalizeHeader(h)
    return Object.keys(HEADER_ALIASES).find((k) => HEADER_ALIASES[k].includes(n)) || null
  })
  if (!keys.includes('id') || !keys.includes('name')) {
    return { error: 'Faltan las columnas obligatorias "codigo" y "nombre". Descarga la plantilla para ver el formato.' }
  }
  const rows = table.slice(1).map((cells) => {
    const o = {}
    keys.forEach((k, i) => { if (k) o[k] = cells[i] ?? '' })
    return o
  })
  return { rows }
}

export const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export const PRINT_CSS = `
  *{box-sizing:border-box} body{font-family:Inter,Arial,sans-serif;color:#2b2527;margin:32px;font-size:13px;line-height:1.45}
  h1{font-size:22px;margin:0 0 4px} h2{font-size:14px;margin:26px 0 8px;color:#f0457c;text-transform:uppercase;letter-spacing:.05em}
  p{margin:2px 0;color:#6f6466} table{width:100%;border-collapse:collapse;margin-top:6px}
  th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#8c8184;border-bottom:1px solid #e8cdd2;padding:8px 6px}
  td{padding:8px 6px;border-bottom:1px solid #f3e1e4} td.r,th.r{text-align:right}
  .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #ff6b9a;padding-bottom:14px;margin-bottom:10px}
  .head img{height:40px} .kpis{display:flex;gap:12px;flex-wrap:wrap;margin:14px 0} .kpi{border:1px solid #f0d3d8;border-radius:10px;padding:10px 14px;min-width:150px}
  .kpi span{display:block;font-size:11px;color:#8c8184;text-transform:uppercase} .kpi strong{font-size:17px}
  .tot td{font-weight:600;border-bottom:0} .badge{display:inline-block;padding:2px 8px;border-radius:99px;background:#f3eded;font-size:11px}
  @media print{body{margin:14mm}}
`

// Abre el diálogo de impresión del navegador (desde ahí se puede "Guardar como PDF").
export function printHTML(title, body) {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${PRINT_CSS}</style></head><body>${body}</body></html>`)
  doc.close()
  const cleanup = () => setTimeout(() => iframe.remove(), 500)
  iframe.contentWindow.onafterprint = cleanup
  setTimeout(() => {
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
    setTimeout(() => iframe.isConnected && iframe.remove(), 120000)
  }, 250)
}
