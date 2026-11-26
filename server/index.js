// Servidor mínimo que conecta el frontend React con PostgreSQL.
// Expone 2 endpoints: GET /api/estado (lee todo desde la BD) y
// POST /api/estado (reemplaza todo el contenido con el estado recibido).
//
// Cada entidad guarda sus campos "conocidos" en columnas propias, y CUALQUIER
// campo adicional que la app agregue (day, note, stockSynced, returns, etc.)
// se guarda tal cual en una columna `extra` (JSONB), para que nunca se pierda
// información aunque el frontend cambie con el tiempo.
import express from 'express'
import cors from 'cors'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    user: process.env.PGUSER || 'vlbeauty',
    password: process.env.PGPASSWORD || 'vlbeauty123',
    database: process.env.PGDATABASE || 'vlbeauty',
})

const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))

app.get('/api/estado', async (req, res) => {
    const client = await pool.connect()
    try {
        const [productosR, inventarioR, ventasR, detalleVentaR, proveedoresR, comprasR, detalleCompraR, reportesR, estadoR] = await Promise.all([
            client.query('SELECT * FROM producto'),
            client.query('SELECT * FROM inventario'),
            client.query('SELECT * FROM venta'),
            client.query('SELECT * FROM detalle_venta'),
            client.query('SELECT * FROM proveedor'),
            client.query('SELECT * FROM compra ORDER BY fecha DESC'),
            client.query('SELECT * FROM detalle_compra'),
            client.query('SELECT * FROM reporte'),
            client.query('SELECT datos FROM estado_app WHERE id = 1'),
        ])

        const invByProduct = new Map(inventarioR.rows.map((i) => [i.producto_id, i]))
        const productMap = new Map(productosR.rows.map((p) => [p.id, p]))
        const products = productosR.rows.map((p) => {
            const inv = invByProduct.get(p.id) || {}
            return {
                id: p.id, name: p.nombre, brand: p.marca, variant: p.variante, category: p.categoria,
                price: Number(p.precio), cost: Number(p.costo), description: p.descripcion,
                status: p.estado, updated: p.actualizado,
                stock: inv.stock ?? 0, min: inv.minimo ?? 0, location: inv.ubicacion ?? '',
                ...(p.extra || {}),
            }
        })

        const linesByInvoice = new Map()
        detalleVentaR.rows.forEach((l) => {
            if (!linesByInvoice.has(l.venta_id)) linesByInvoice.set(l.venta_id, [])
            linesByInvoice.get(l.venta_id).push({ id: l.producto_id, qty: l.cantidad })
        })
        const invoices = ventasR.rows.map((v) => {
            const items = (linesByInvoice.get(v.id) || []).map((it) => {
                const p = productMap.get(it.id)
                return { id: it.id, qty: it.qty, name: p?.nombre, variant: p?.variante, category: p?.categoria, unit: p ? Number(p.precio) : undefined }
            })
            return {
                id: v.id, client: v.cliente, nif: v.nif, email: v.email, hour: v.hora,
                method: v.metodo_pago, status: v.estado, total: Number(v.total),
                base: v.base !== null ? Number(v.base) : undefined, payNote: v.nota_pago, store: v.tienda,
                items,
                // Valores por defecto (por si la factura es vieja y todavía no tiene estos campos en `extra`):
                day: '', note: '', stockSynced: v.estado === 'Pagada', returns: [], returned: {},
                ...(v.extra || {}),
            }
        })

        const linesByPurchase = new Map()
        detalleCompraR.rows.forEach((l) => {
            if (!linesByPurchase.has(l.compra_id)) linesByPurchase.set(l.compra_id, [])
            linesByPurchase.get(l.compra_id).push({ id: l.producto_id, qty: l.cantidad, cost: Number(l.costo_unitario) })
        })
        const purchasesBySupplier = new Map()
        comprasR.rows.forEach((c) => {
            if (!purchasesBySupplier.has(c.proveedor_id)) purchasesBySupplier.set(c.proveedor_id, [])
            purchasesBySupplier.get(c.proveedor_id).push({
                id: `h-${c.id}`, date: c.fecha, purchase: c.id, invoice: c.factura, amount: Number(c.total),
                lines: linesByPurchase.get(c.id) || [],
                ...(c.extra || {}),
            })
        })
        const suppliers = proveedoresR.rows.map((s) => ({
            id: s.id, name: s.nombre, place: s.lugar, phone: s.telefono, email: s.email,
            lastPurchase: s.ultima_compra, history: purchasesBySupplier.get(s.id) || [],
            ...(s.extra || {}),
        }))

        const reports = reportesR.rows.map((r) => ({
            id: r.id, type: r.tipo, format: r.formato, period: r.periodo, date: r.fecha,
            ...(r.extra || {}),
        }))

        const extraGlobal = estadoR.rows[0]?.datos || {}

        res.json({ v: 1, products, invoices, suppliers, reports, ...extraGlobal })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'No se pudo leer el estado de la base de datos.' })
    } finally {
        client.release()
    }
})

app.post('/api/estado', async (req, res) => {
    const state = req.body
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        await client.query('TRUNCATE producto, inventario, venta, detalle_venta, proveedor, compra, detalle_compra, reporte RESTART IDENTITY CASCADE')

        for (const p of state.products || []) {
            const { id, name, brand, variant, category, price, cost, description, status, updated, stock, min, location, ...extra } = p
            await client.query(
                `INSERT INTO producto (id, nombre, marca, variante, categoria, precio, costo, descripcion, estado, actualizado, extra)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
                [id, name, brand, variant, category, price, cost, description, status, updated, JSON.stringify(extra)]
            )
            await client.query(
                `INSERT INTO inventario (producto_id, stock, minimo, ubicacion) VALUES ($1,$2,$3,$4)`,
                [id, stock, min, location]
            )
        }

        for (const v of state.invoices || []) {
            const { id, client: cliente, nif, email, hour, method, status, total, base, payNote, store, items, ...extra } = v
            await client.query(
                `INSERT INTO venta (id, cliente, nif, email, hora, metodo_pago, estado, total, base, nota_pago, tienda, extra)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
                [id, cliente, nif || null, email || null, hour, method, status, total, base ?? null, payNote || null, store || null, JSON.stringify(extra)]
            )
            for (const it of items || []) {
                await client.query(`INSERT INTO detalle_venta (venta_id, producto_id, cantidad) VALUES ($1,$2,$3)`, [id, it.id, it.qty])
            }
        }

        for (const s of state.suppliers || []) {
            const { id: supplierId, name, place, phone, email, lastPurchase, history, ...extraS } = s
            await client.query(
                `INSERT INTO proveedor (id, nombre, lugar, telefono, email, ultima_compra, extra) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                [supplierId, name, place, phone, email, lastPurchase, JSON.stringify(extraS)]
            )
            for (const h of history || []) {
                const { purchase, date, invoice, amount, lines, ...extraH } = h
                await client.query(
                    `INSERT INTO compra (id, proveedor_id, fecha, factura, total, extra) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
                    [purchase, supplierId, date, invoice, amount, JSON.stringify(extraH)]
                )
                for (const l of lines || []) {
                    await client.query(
                        `INSERT INTO detalle_compra (compra_id, producto_id, cantidad, costo_unitario) VALUES ($1,$2,$3,$4)`,
                        [purchase, l.id, l.qty, l.cost]
                    )
                }
            }
        }

        for (const r of state.reports || []) {
            const { id, type, format, period, date, ...extraR } = r
            await client.query(
                `INSERT INTO reporte (id, tipo, formato, periodo, fecha, extra) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
                [id, type, format, period, date, JSON.stringify(extraR)]
            )
        }

        const { products, invoices, suppliers, reports, ...rest } = state
        await client.query(
            `INSERT INTO estado_app (id, datos) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET datos = EXCLUDED.datos`,
            [JSON.stringify(rest)]
        )

        await client.query('COMMIT')
        res.json({ ok: true })
    } catch (err) {
        await client.query('ROLLBACK')
        console.error(err)
        res.status(500).json({ error: 'No se pudo guardar el estado en la base de datos.' })
    } finally {
        client.release()
    }
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API de V & L Beauty escuchando en http://localhost:${PORT}`))