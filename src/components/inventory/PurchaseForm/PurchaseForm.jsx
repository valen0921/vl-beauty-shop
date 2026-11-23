import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card/Card'
import Badge from '@/components/ui/Badge/Badge'
import Button from '@/components/ui/Button/Button'
import Callout from '@/components/ui/Callout/Callout'
import FormField from '@/components/ui/FormField/FormField'
import FilterSelect from '@/components/ui/FilterSelect/FilterSelect'
import DataTable from '@/components/ui/DataTable/DataTable'
import ActionMenu from '@/components/ui/ActionMenu/ActionMenu'
import { useStore } from '@/store/StoreProvider'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import { formatCOP } from '@/utils/format'
import './PurchaseForm.css'

const num = (v) => (v === '' || v == null ? 0 : Number(v))
const normalize = (draft) => ({ ...draft, lines: draft.lines.map((l) => ({ ...l, qty: num(l.qty), cost: num(l.cost) })) })

export default function PurchaseForm({ products, suppliers, presetId, presetNonce }) {
  const { state, confirmPurchase, saveDraft } = useStore()
  const { toast, confirm } = useUI()
  const [draft, setDraft] = useState(state.purchaseDraft)

  const addLine = (id) => {
    const p = products.find((x) => x.id === id)
    if (!p) return
    setDraft((d) => (d.lines.some((l) => l.id === id)
      ? { ...d, lines: d.lines.map((l) => (l.id === id ? { ...l, qty: num(l.qty) + 1 } : l)) }
      : { ...d, lines: [...d.lines, { id, qty: 1, cost: p.cost || 0 }] }))
  }

  useEffect(() => { if (presetNonce) addLine(presetId) }, [presetNonce]) // eslint-disable-line react-hooks/exhaustive-deps

  const setField = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }))
  const setLine = (id, key, value) => setDraft((d) => ({ ...d, lines: d.lines.map((l) => (l.id === id ? { ...l, [key]: value } : l)) }))
  const removeLine = (id) => setDraft((d) => ({ ...d, lines: d.lines.filter((l) => l.id !== id) }))

  const rows = draft.lines
    .map((l) => ({ ...products.find((p) => p.id === l.id), ...l }))
    .filter((r) => r.name)
    .map((r) => ({ ...r, subtotal: num(r.qty) * num(r.cost) }))
  const total = rows.reduce((sum, r) => sum + r.subtotal, 0)
  const units = rows.reduce((sum, r) => sum + num(r.qty), 0)
  const available = products.filter((p) => p.status !== 'Archivado' && !draft.lines.some((l) => l.id === p.id))

  const columns = [
    { key: 'name', header: 'Producto', render: (l) => (<><div className="cell-title">{l.name}</div><div className="cell-sub">{l.id} · {l.category} · {l.location}</div></>) },
    { key: 'qty', header: 'Cantidad', width: 110, render: (l) => <input className="cell-input" type="number" min="1" step="1" inputMode="numeric" aria-label={`Cantidad de ${l.name}`} value={l.qty} onChange={(e) => setLine(l.id, 'qty', e.target.value)} /> },
    { key: 'cost', header: 'Costo unitario', width: 140, render: (l) => <input className="cell-input" type="number" min="0" step="100" inputMode="numeric" aria-label={`Costo unitario de ${l.name}`} value={l.cost} onChange={(e) => setLine(l.id, 'cost', e.target.value)} /> },
    { key: 'subtotal', header: 'Subtotal', width: 140, render: (l) => <strong>{formatCOP(l.subtotal)}</strong> },
    { key: 'actions', header: '', width: 50, align: 'right', render: (l) => <ActionMenu items={[{ label: 'Quitar de la compra', icon: 'trash', danger: true, onClick: () => removeLine(l.id) }]} /> },
  ]

  const onSaveDraft = () => {
    saveDraft(draft)
    toast(`Borrador ${draft.id} guardado.`)
  }

  const onConfirm = async () => {
    const clean = normalize(draft)
    const yes = await confirm({
      title: 'Confirmar recepción',
      message: `Se sumarán ${units} unidades al inventario y se registrará la compra ${draft.id} por ${formatCOP(total)}.`,
      confirmLabel: 'Confirmar recepción',
    })
    if (!yes) return
    const r = confirmPurchase(clean)
    if (!r.ok) { toast(r.error, 'error'); return }
    setDraft(r.state.purchaseDraft)
    toast(r.queued ? `Compra ${clean.id} registrada. El stock se sumará al reactivar la regla de entradas.` : `Compra ${clean.id} recibida: inventario actualizado.`, r.queued ? 'warning' : 'success')
  }

  return (
    <Card
      title="Registro de compra / entrada"
      subtitle="Borrador de nueva compra · datos de compra y detalle de productos"
      action={<Badge tone="pink">Borrador</Badge>}
    >
      <div className="form-grid">
        <FormField label="Identificador" value={draft.id} onChange={setField('id')} />
        <FormField label="Fecha" value={draft.date} onChange={setField('date')} />
        <FormField label="Proveedor" as="select" options={suppliers.map((s) => ({ value: s.id, label: s.name }))} value={draft.supplierId} onChange={(v) => setDraft((d) => ({ ...d, supplierId: v }))} />
        <FormField label="Número de factura del proveedor" value={draft.invoice} onChange={setField('invoice')} placeholder="Ej. FP-2026-1042" />
      </div>

      <div className="purchase__label-row">
        <p className="purchase__label">Detalle de compra</p>
        <FilterSelect
          options={[{ value: '', label: '+ Agregar producto…' }, ...available.map((p) => ({ value: p.id, label: `${p.name} · ${p.id}` }))]}
          value=""
          onChange={(id) => id && addLine(id)}
          aria-label="Agregar producto a la compra"
        />
      </div>
      <div className="purchase__table">
        <DataTable columns={columns} rows={rows} emptyText="Agrega productos para registrar la compra." />
      </div>
      <div className="purchase__total">
        <span>Total de compra</span>
        <strong>{formatCOP(total)}</strong>
      </div>

      <div className="form-actions purchase__actions">
        <Button onClick={onSaveDraft}>Guardar borrador</Button>
        <Button variant="primary" onClick={onConfirm}>Confirmar recepción</Button>
      </div>
      <Callout icon="checkCircle">Confirmar recepción incrementará el inventario de cada producto según la cantidad comprada.</Callout>
    </Card>
  )
}
