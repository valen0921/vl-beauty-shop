// Lógica de negocio pura: cada función recibe el estado y devuelve { ok, state, ... } o { ok:false, error }.
// No depende de React, así que se puede probar con Node y reemplazar por llamadas a tu API.
import { TODAY, TODAY_SHORT, SELLER, CATEGORIES } from '@/config'
import { products as seedProducts } from '@/data/products'
import { invoices as seedInvoicesRaw } from '@/data/sales'
import { movements as seedMovements, purchaseLines, suppliers as seedSuppliers } from '@/data/inventory'
import { operations as seedOperations } from '@/data/stock'
import { reportHistory, periodToday } from '@/data/reports'

export const STORAGE_KEY = 'vl-beauty-shop:v1'

const uid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
export const nowHM = () => new Date().toTimeString().slice(0, 5)
const stamp = (time) => `${TODAY_SHORT}, ${time}`
const ok = (state, extra = {}) => ({ ok: true, state, ...extra })
const fail = (error) => ({ ok: false, error })
const toInt = (v) => (typeof v === 'number' ? v : Number(String(v ?? '').replace(/[^\d-]/g, '')))
const isInt = (n) => Number.isInteger(n)

/* ───────────── Estado inicial ───────────── */

export function buildInvoices(rawInvoices, products) {
  return rawInvoices.map((inv) => ({
    ...inv,
    day: TODAY,
    note: '',
    stockSynced: inv.status === 'Pagada',
    returned: {},
    returns: [],
    items: inv.items.map((it) => {
      const p = products.find((x) => x.id === it.id)
      return { id: it.id, qty: it.qty, name: p.name, variant: p.variant, category: p.category, unit: p.price }
    }),
  }))
}

export const SEED_INVOICES = buildInvoices(seedInvoicesRaw, seedProducts)
export const SEED_PRODUCTS = seedProducts.map((p) => ({ ...p }))

const pad = (n, len) => String(n).padStart(len, '0')

export function newPurchaseDraft(n, supplierId, lines = [], invoice = '') {
  return { id: `C-2026-${pad(n, 3)}`, date: TODAY, supplierId, invoice, lines }
}

export function createInitialState() {
  const products = seedProducts.map((p) => ({ ...p }))
  return {
    v: 1,
    products,
    invoices: buildInvoices(seedInvoicesRaw, products),
    movements: seedMovements.map((m) => ({ ...m })),
    operations: seedOperations.map((o) => ({ ...o, day: 'hoy' })),
    suppliers: seedSuppliers.map((s) => ({ ...s, history: s.history.map((h) => ({ ...h })) })),
    reports: reportHistory.map((r) => ({ ...r, period: periodToday })),
    purchaseDraft: newPurchaseDraft(18, seedSuppliers[0].id, purchaseLines.map((l) => ({ ...l })), 'FP-2026-1042'),
    settings: { autoSync: true, rules: { venta: true, devolucion: true, entrada: true } },
    pending: [],
    counters: { purchase: 18, returns: 82 },
    lastSync: {
      invoice: 'F-2026-1048', when: 'Hoy, 14:32', total: 201600, units: 2,
      lines: [{ name: 'Labial Velvet Matte', before: 25, after: 24 }, { name: 'Rubor Soft Pinch', before: 9, after: 8 }],
    },
    lastCheck: '14:32',
    alertsSeen: '',
    cashClose: null,
  }
}

export function loadState() {
  const initial = createInitialState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initial
    const saved = JSON.parse(raw)
    if (!saved || saved.v !== 1) return initial
    return { ...initial, ...saved, settings: { ...initial.settings, ...saved.settings, rules: { ...initial.settings.rules, ...saved.settings?.rules } } }
  } catch {
    return initial
  }
}

/* ───────────── Motor de stock ───────────── */

const ruleEnabled = (state, rule) => rule == null || (state.settings.autoSync && state.settings.rules[rule])

// Unidades ya comprometidas por ventas en cola (aún no descontadas).
const reservedUnits = (state, productId) =>
  state.pending.reduce((sum, op) => sum + (op.rule === 'venta' ? op.lines.filter((l) => l.productId === productId).reduce((s, l) => s - l.delta, 0) : 0), 0)

export const availableStock = (state, productId) => {
  const p = state.products.find((x) => x.id === productId)
  return p ? p.stock - reservedUnits(state, productId) : 0
}

function commitStockOp(state, op, time) {
  const committed = []
  const products = state.products.map((p) => {
    const line = op.lines.find((l) => l.productId === p.id)
    if (!line) return p
    const before = p.stock
    const after = Math.max(0, before + line.delta)
    committed.push({ product: p, before, after, delta: after - before })
    const next = { ...p, stock: after, updated: stamp(time) }
    if (op.costs && op.costs[p.id] != null) next.cost = op.costs[p.id]
    return next
  })
  const ordered = op.lines.map((l) => committed.find((c) => c.product.id === l.productId)).filter(Boolean)

  const by = op.rule === 'venta' ? 'Automático' : SELLER
  const reason = op.doc ? `${op.label} · ${op.doc}` : op.label
  const newMovements = ordered.map((c) => ({
    id: uid('m'), kind: op.kind, time, product: c.product.name, reason, units: c.delta, before: c.before, after: c.after, by,
  }))

  let operations = state.operations
  if (!op.silent) {
    const detail = {
      fields: op.fields,
      listTitle: op.listTitle,
      lines: ordered.map((c) => ({
        name: c.product.name, meta: `${c.product.id} · ${c.product.category} · ${c.product.location}`,
        units: c.delta, before: c.before, after: c.after,
      })),
    }
    operations = [
      ...ordered.map((c) => ({
        id: uid('op'), time, doc: op.doc, origin: op.origin, product: c.product.name,
        units: c.delta, before: c.before, after: c.after, result: 'Aplicado', day: 'hoy', detail,
      })),
      ...state.operations,
    ]
  }

  const invoices = op.invoiceId ? state.invoices.map((i) => (i.id === op.invoiceId ? { ...i, stockSynced: true } : i)) : state.invoices
  const lastSync = op.rule === 'venta'
    ? {
        invoice: op.doc, when: `Hoy, ${time}`, total: op.total ?? 0,
        units: ordered.reduce((s, c) => s + Math.abs(c.delta), 0),
        lines: ordered.map((c) => ({ name: c.product.name, before: c.before, after: c.after })),
      }
    : state.lastSync

  return { ...state, products, movements: [...newMovements, ...state.movements], operations, invoices, lastSync }
}

// Aplica la operación ya, o la deja en cola si la regla/actualización automática está apagada.
function runStockOp(state, op) {
  if (!ruleEnabled(state, op.rule)) {
    return { state: { ...state, pending: [...state.pending, { ...op, qid: uid('q'), time: nowHM() }] }, queued: true }
  }
  return { state: commitStockOp(state, op, nowHM()), queued: false }
}

export function flushPending(state) {
  let next = { ...state, pending: [] }
  const remaining = []
  for (const op of state.pending) {
    if (ruleEnabled(next, op.rule)) next = commitStockOp(next, op, op.time)
    else remaining.push(op)
  }
  return { ...next, pending: remaining }
}

export function processPending(state) {
  const count = state.pending.length
  const next = flushPending(state)
  return ok(next, { processed: count - next.pending.length, remaining: next.pending.length })
}

/* ───────────── Ventas ───────────── */

const saleOp = (inv) => ({
  rule: 'venta', kind: 'venta', label: 'Venta', origin: 'Venta confirmada', doc: inv.id, invoiceId: inv.id, total: inv.total,
  lines: inv.items.map((i) => ({ productId: i.id, delta: -i.qty })),
  fields: [['Factura', inv.id, true], ['Cliente', inv.client], ['Método de pago', inv.method], ['Fecha', `${inv.day} · ${inv.hour}`]],
  listTitle: 'Productos y cantidades descontadas',
})

const payNoteFor = (method) =>
  method === 'Tarjeta' ? 'Pagado con tarjeta' : method === 'Efectivo' ? 'Pagado en efectivo' : 'Pagado por transferencia'

function checkStock(state, items) {
  for (const it of items) {
    const p = state.products.find((x) => x.id === it.id)
    if (!p) return `El producto ${it.id} ya no existe en el catálogo.`
    const available = availableStock(state, it.id)
    if (available <= 0) return `${p.name} está agotado.`
    if (it.qty > available) return `Solo quedan ${available} ud. de ${p.name}.`
  }
  return null
}

export function registerSale(state, { customer = '', day, method, note = '', lines }) {
  if (!lines.length) return fail('Agrega al menos un producto al carrito.')
  if (!method) return fail('Selecciona el método de pago.')
  const items = lines.map((l) => {
    const p = state.products.find((x) => x.id === l.id)
    return { id: l.id, qty: l.qty, name: p?.name, variant: p?.variant, category: p?.category, unit: p?.price }
  })
  const stockError = checkStock(state, items)
  if (stockError) return fail(stockError)

  const total = items.reduce((s, i) => s + i.unit * i.qty, 0)
  const paid = method !== 'Transferencia'
  const num = state.invoices.reduce((m, i) => Math.max(m, parseInt(i.id.split('-')[2], 10) || 0), 0) + 1
  const invoice = {
    id: `F-2026-${num}`, day: day || TODAY, hour: nowHM(), client: customer.trim() || 'Cliente de mostrador',
    method, status: paid ? 'Pagada' : 'Pendiente', total,
    payNote: paid ? payNoteFor(method) : 'Pendiente de transferencia',
    items, note: note.trim(), stockSynced: false, returned: {}, returns: [],
  }
  let next = { ...state, invoices: [invoice, ...state.invoices] }
  let queued = false
  if (paid) {
    const r = runStockOp(next, saleOp(invoice))
    next = r.state
    queued = r.queued
  }
  return ok(next, { invoice: next.invoices.find((i) => i.id === invoice.id), queued })
}

export function markInvoicePaid(state, id) {
  const inv = state.invoices.find((i) => i.id === id)
  if (!inv || inv.status !== 'Pendiente') return fail('Solo se pueden confirmar ventas pendientes.')
  const stockError = checkStock(state, inv.items)
  if (stockError) return fail(`No se puede confirmar: ${stockError}`)
  const paidInv = { ...inv, status: 'Pagada', payNote: payNoteFor(inv.method) }
  const base = { ...state, invoices: state.invoices.map((i) => (i.id === id ? paidInv : i)) }
  const r = runStockOp(base, saleOp(paidInv))
  return ok(r.state, { queued: r.queued })
}

export function annulInvoice(state, id) {
  const inv = state.invoices.find((i) => i.id === id)
  if (!inv) return fail('No encontré la factura.')
  if (inv.status === 'Anulada') return fail('Esta factura ya está anulada.')
  const restock = inv.status === 'Pagada' && inv.stockSynced
    ? inv.items.map((i) => ({ productId: i.id, delta: i.qty - (inv.returned[i.id] || 0) })).filter((l) => l.delta > 0)
    : []
  let next = {
    ...state,
    pending: state.pending.filter((p) => p.invoiceId !== id),
    invoices: state.invoices.map((i) => (i.id === id ? { ...i, status: 'Anulada', payNote: 'Factura anulada', restocked: restock.length > 0 } : i)),
  }
  if (restock.length) {
    next = commitStockOp(next, { rule: null, kind: 'devolucion', label: 'Anulación', doc: id, silent: true, lines: restock }, nowHM())
  }
  return ok(next, { restocked: restock.length > 0 })
}

export function registerReturn(state, { invoiceId, items, fit }) {
  const inv = state.invoices.find((i) => i.id === invoiceId)
  if (!inv || inv.status !== 'Pagada') return fail('Solo se pueden devolver productos de facturas pagadas.')
  if (!inv.stockSynced) return fail('Esta venta aún no descontó stock, así que no se puede registrar una devolución.')
  const chosen = items.filter((i) => i.qty > 0)
  if (!chosen.length) return fail('Indica al menos una unidad a devolver.')
  for (const c of chosen) {
    const line = inv.items.find((i) => i.id === c.id)
    const left = line ? line.qty - (inv.returned[c.id] || 0) : 0
    if (!isInt(c.qty) || c.qty > left) return fail(`Solo se pueden devolver ${left} ud. de ${line?.name ?? c.id}.`)
  }
  const n = state.counters.returns + 1
  const docId = `DEV-${pad(n, 4)}`
  const returned = { ...inv.returned }
  chosen.forEach((c) => { returned[c.id] = (returned[c.id] || 0) + c.qty })
  const record = { id: docId, fit, time: nowHM(), items: chosen }
  let next = {
    ...state,
    counters: { ...state.counters, returns: n },
    invoices: state.invoices.map((i) => (i.id === invoiceId ? { ...i, returned, returns: [record, ...i.returns] } : i)),
  }
  let queued = false
  if (fit) {
    const r = runStockOp(next, {
      rule: 'devolucion', kind: 'devolucion', label: 'Devolución', origin: 'Devolución validada', doc: docId,
      lines: chosen.map((c) => ({ productId: c.id, delta: c.qty })),
      fields: [['Devolución', docId, true], ['Estado del artículo', 'Apto para la venta'], ['Validada por', SELLER], ['Fecha', `${TODAY} · ${nowHM()}`]],
      listTitle: 'Productos y cantidades aceptadas',
    })
    next = r.state
    queued = r.queued
  }
  return ok(next, { docId, queued, fit })
}

export function closeCash(state, { counted, totals }) {
  return ok({ ...state, cashClose: { time: nowHM(), counted, totals } })
}
export const reopenCash = (state) => ok({ ...state, cashClose: null })

/* ───────────── Inventario: compras y ajustes ───────────── */

export function confirmPurchase(state, draft) {
  const supplier = state.suppliers.find((s) => s.id === draft.supplierId)
  if (!supplier) return fail('Selecciona un proveedor.')
  const invoice = (draft.invoice || '').trim()
  if (!invoice) return fail('Escribe el número de factura del proveedor.')
  if (supplier.history.some((h) => h.invoice.toLowerCase() === invoice.toLowerCase())) return fail(`La factura ${invoice} ya está registrada para ${supplier.name}.`)
  if (state.suppliers.some((s) => s.history.some((h) => h.purchase === draft.id))) return fail(`El identificador ${draft.id} ya existe.`)
  const lines = draft.lines.filter((l) => state.products.some((p) => p.id === l.id))
  if (!lines.length) return fail('Agrega al menos un producto a la compra.')
  for (const l of lines) {
    const name = state.products.find((p) => p.id === l.id).name
    if (!isInt(l.qty) || l.qty < 1) return fail(`Revisa la cantidad de ${name}: debe ser un entero mayor que 0.`)
    if (!Number.isFinite(l.cost) || l.cost < 0) return fail(`Revisa el costo de ${name}.`)
  }
  const amount = lines.reduce((s, l) => s + l.qty * l.cost, 0)
  const date = (draft.date || '').trim() || TODAY
  const entry = { id: uid('h'), date, purchase: draft.id, invoice, amount }
  const n = state.counters.purchase + 1
  const base = {
    ...state,
    counters: { ...state.counters, purchase: n },
    suppliers: state.suppliers.map((s) => (s.id === supplier.id ? { ...s, lastPurchase: date, history: [entry, ...s.history] } : s)),
    purchaseDraft: newPurchaseDraft(n, supplier.id, []),
  }
  const costs = Object.fromEntries(lines.map((l) => [l.id, l.cost]))
  const r = runStockOp(base, {
    rule: 'entrada', kind: 'entrada', label: 'Entrada', origin: 'Entrada recibida', doc: draft.id, costs,
    lines: lines.map((l) => ({ productId: l.id, delta: l.qty })),
    fields: [['Identificador de compra', draft.id, true], ['Factura del proveedor', invoice, true], ['Proveedor', supplier.name], ['Fecha', `${date} · ${nowHM()}`]],
    listTitle: 'Productos y cantidades recibidas',
  })
  return ok(r.state, { amount, queued: r.queued })
}

export const saveDraft = (state, draft) => ok({ ...state, purchaseDraft: draft })

export function adjustStock(state, { productId, delta, reason }) {
  const p = state.products.find((x) => x.id === productId)
  if (!p) return fail('Selecciona un producto.')
  if (!delta) return fail('El ajuste no cambia el stock.')
  if (p.stock + delta < 0) return fail(`No puedes dejar el stock en negativo (hay ${p.stock} ud.).`)
  const next = commitStockOp(state, { rule: null, kind: 'ajuste', label: `Ajuste · ${reason}`, doc: '', silent: true, lines: [{ productId, delta }] }, nowHM())
  return ok(next, { before: p.stock, after: p.stock + delta })
}

/* ───────────── Productos ───────────── */

export function nextProductId(products, prefix = 'PRO') {
  const max = products.reduce((m, p) => Math.max(m, parseInt(String(p.id).split('-')[1], 10) || 0), 0)
  return `${prefix}-${pad(max + 1, 3)}`
}

export function categoryOptions(products) {
  return [...new Set([...CATEGORIES, ...products.map((p) => p.category)])]
}

export function saveProduct(state, { mode, data }) {
  const id = String(data.id || '').trim().toUpperCase()
  const name = String(data.name || '').trim()
  const price = toInt(data.price)
  const min = data.min === '' || data.min == null ? 10 : toInt(data.min)
  const stock = data.stock === '' || data.stock == null ? 0 : toInt(data.stock)
  if (!id) return fail('El código del producto es obligatorio.')
  if (!/^[A-Z0-9-]{3,20}$/.test(id)) return fail('El código solo puede tener letras, números y guiones (3 a 20 caracteres).')
  if (!name) return fail('El nombre del producto es obligatorio.')
  if (!price || price < 0) return fail('Escribe un precio mayor que 0.')
  if (!isInt(min) || min < 0) return fail('El stock mínimo debe ser un número entero (0 o más).')
  if (mode === 'create' && (!isInt(stock) || stock < 0)) return fail('El stock inicial debe ser un número entero (0 o más).')

  const common = {
    name, brand: String(data.brand || '').trim() || '—', variant: String(data.variant || '').trim() || '—',
    category: data.category, price, min, location: String(data.location || '').trim() || 'Sin asignar',
    status: data.status, description: String(data.description || '').trim(),
  }

  if (mode === 'create') {
    if (state.products.some((p) => p.id === id)) return fail(`Ya existe un producto con el código ${id}.`)
    const time = nowHM()
    const product = { id, ...common, stock, cost: 0, updated: stamp(time) }
    let next = { ...state, products: [product, ...state.products] }
    if (stock > 0) {
      next = {
        ...next,
        movements: [{ id: uid('m'), kind: 'ajuste', time, product: name, reason: 'Ajuste · Stock inicial', units: stock, before: 0, after: stock, by: SELLER }, ...next.movements],
      }
    }
    return ok(next, { product })
  }

  const current = state.products.find((p) => p.id === id)
  if (!current) return fail('No encontré el producto que intentas editar.')
  const product = { ...current, ...common, updated: stamp(nowHM()) }
  return ok({ ...state, products: state.products.map((p) => (p.id === id ? product : p)) }, { product })
}

export function duplicateProduct(state, id) {
  const src = state.products.find((p) => p.id === id)
  if (!src) return fail('No encontré el producto.')
  const newId = nextProductId(state.products, id.split('-')[0])
  const copy = { ...src, id: newId, name: `${src.name} (copia)`, status: 'Borrador', stock: 0, updated: stamp(nowHM()) }
  return ok({ ...state, products: [copy, ...state.products] }, { product: copy })
}

export function setProductsStatus(state, ids, status) {
  const set = new Set(ids)
  const time = stamp(nowHM())
  return ok({ ...state, products: state.products.map((p) => (set.has(p.id) ? { ...p, status, updated: time } : p)) }, { count: ids.length })
}

export function deleteProducts(state, ids) {
  const set = new Set(ids)
  return ok({
    ...state,
    products: state.products.filter((p) => !set.has(p.id)),
    purchaseDraft: { ...state.purchaseDraft, lines: state.purchaseDraft.lines.filter((l) => !set.has(l.id)) },
  }, { count: ids.length })
}

const CATEGORY_LOOKUP = (value, products) => {
  const v = String(value || '').trim().toLowerCase()
  return categoryOptions(products).find((c) => c.toLowerCase() === v) || (v ? String(value).trim() : '')
}
const STATUS_LOOKUP = (value) => ['Activo', 'Borrador', 'Archivado'].find((s) => s.toLowerCase() === String(value || '').trim().toLowerCase()) || ''

export function importProducts(state, rows) {
  let next = state
  let created = 0
  let updated = 0
  const errors = []
  rows.forEach((row, idx) => {
    const line = idx + 2
    const id = String(row.id || '').trim().toUpperCase()
    const name = String(row.name || '').trim()
    if (!id || !name) { errors.push(`Fila ${line}: falta el código o el nombre.`); return }
    const exists = next.products.find((p) => p.id === id)
    const category = CATEGORY_LOOKUP(row.category, next.products) || exists?.category || CATEGORIES[0]
    const status = STATUS_LOOKUP(row.status) || exists?.status || 'Activo'
    const price = row.price ? toInt(row.price) : exists?.price
    if (!price || price <= 0) { errors.push(`Fila ${line} (${id}): precio no válido.`); return }
    const data = {
      id, name, brand: row.brand || exists?.brand, variant: row.variant || exists?.variant, category, price,
      min: row.min !== undefined && row.min !== '' ? row.min : exists?.min, location: row.location || exists?.location,
      status, description: row.description || exists?.description || '',
      stock: row.stock !== undefined && row.stock !== '' ? row.stock : exists ? exists.stock : 0,
    }
    const r = saveProduct(next, { mode: exists ? 'edit' : 'create', data })
    if (!r.ok) { errors.push(`Fila ${line} (${id}): ${r.error}`); return }
    next = r.state
    if (exists) {
      updated++
      const newStock = toInt(data.stock)
      if (Number.isInteger(newStock) && newStock >= 0 && newStock !== exists.stock) {
        const time = nowHM()
        next = {
          ...next,
          products: next.products.map((p) => (p.id === id ? { ...p, stock: newStock } : p)),
          movements: [{ id: uid('m'), kind: 'ajuste', time, product: name, reason: 'Ajuste · Importación', units: newStock - exists.stock, before: exists.stock, after: newStock, by: SELLER }, ...next.movements],
        }
      }
    } else created++
  })
  return ok(next, { created, updated, errors })
}

/* ───────────── Proveedores ───────────── */

export function nextSupplierId(suppliers) {
  const max = suppliers.reduce((m, s) => Math.max(m, parseInt(String(s.id).split('-')[1], 10) || 0), 0)
  return `PROV-${pad(max + 1, 3)}`
}

export function saveSupplier(state, { mode, data }) {
  const id = String(data.id || '').trim().toUpperCase()
  const name = String(data.name || '').trim()
  const email = String(data.email || '').trim()
  const phone = String(data.phone || '').trim()
  if (!id) return fail('El identificador del proveedor es obligatorio.')
  if (!name) return fail('El nombre o razón social es obligatorio.')
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('El correo electrónico no parece válido.')
  if (mode === 'create') {
    if (state.suppliers.some((s) => s.id === id)) return fail(`Ya existe un proveedor con el identificador ${id}.`)
    const supplier = { id, name, phone, email, place: 'Sin definir', lastPurchase: '—', history: [] }
    return ok({ ...state, suppliers: [...state.suppliers, supplier] }, { supplier })
  }
  const current = state.suppliers.find((s) => s.id === id)
  if (!current) return fail('No encontré el proveedor.')
  const supplier = { ...current, name, phone, email }
  return ok({ ...state, suppliers: state.suppliers.map((s) => (s.id === id ? supplier : s)) }, { supplier })
}

/* ───────────── Reglas, reportes y comprobaciones ───────────── */

export function setAutoSync(state, enabled) {
  const next = { ...state, settings: { ...state.settings, autoSync: enabled } }
  const result = enabled ? flushPending(next) : next
  return ok(result, { flushed: enabled ? state.pending.length - result.pending.length : 0 })
}

export function setRule(state, rule, enabled) {
  const next = { ...state, settings: { ...state.settings, rules: { ...state.settings.rules, [rule]: enabled } } }
  return ok(enabled ? flushPending(next) : next)
}

export function addReport(state, { type, format, period }) {
  const num = state.reports.reduce((m, r) => Math.max(m, parseInt(r.id.split('-')[2], 10) || 0), 0) + 1
  const report = { id: `REP-2026-${num}`, type, format, period, date: `${TODAY} · ${nowHM()}` }
  return ok({ ...state, reports: [report, ...state.reports].slice(0, 10) }, { report })
}

export function checkSync(state) {
  const issues = []
  state.products.forEach((p) => {
    const last = state.movements.find((m) => m.product === p.name)
    if (last && last.after !== p.stock) issues.push({ name: p.name, expected: last.after, actual: p.stock })
  })
  return ok({ ...state, lastCheck: nowHM() }, { issues, pending: state.pending.length })
}

export function reconcile(state) {
  const { issues } = checkSync(state)
  const time = nowHM()
  const movements = issues.map((i) => ({
    id: uid('m'), kind: 'ajuste', time, product: i.name, reason: 'Ajuste · Conciliación', units: i.actual - i.expected, before: i.expected, after: i.actual, by: SELLER,
  }))
  return ok({ ...state, movements: [...movements, ...state.movements], lastCheck: time }, { count: issues.length })
}

export const markAlertsSeen = (state, key) => ok({ ...state, alertsSeen: key })
export const resetDemo = () => ok(createInitialState())
