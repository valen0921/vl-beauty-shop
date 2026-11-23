import { useState } from 'react'
import Modal from '@/components/ui/Modal/Modal'
import Button from '@/components/ui/Button/Button'
import { useStore } from '@/store/StoreProvider'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import './CashCloseModal.css'

export default function ReturnModal({ invoice, onClose }) {
  const { registerReturn } = useStore()
  const { toast } = useUI()
  const lines = invoice.items.map((i) => ({ ...i, left: i.qty - (invoice.returned[i.id] || 0) }))
  const [qty, setQty] = useState({})
  const [fit, setFit] = useState(true)

  const submit = () => {
    const items = lines.map((l) => ({ id: l.id, qty: Number(qty[l.id]) || 0 }))
    const r = registerReturn({ invoiceId: invoice.id, items, fit })
    if (!r.ok) { toast(r.error, 'error'); return }
    toast(
      !r.fit ? `${r.docId} registrada. Los artículos no aptos no vuelven al stock.`
        : r.queued ? `${r.docId} registrada. El stock se repondrá al reactivar la regla de devoluciones.`
          : `${r.docId} registrada: las unidades volvieron al inventario.`,
      r.queued ? 'warning' : 'success',
    )
    onClose()
  }

  return (
    <Modal
      title={`Devolución · ${invoice.id}`}
      subtitle="Indica cuántas unidades devuelve el cliente."
      onClose={onClose}
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={submit}>Registrar devolución</Button></>}
    >
      <div className="modal__rows">
        {lines.map((l) => (
          <div key={l.id} className="modal__row">
            <span><strong>{l.name}</strong><small>{l.left} de {l.qty} ud. disponibles para devolver</small></span>
            <input
              type="number" min="0" max={l.left} step="1" disabled={l.left === 0} aria-label={`Unidades a devolver de ${l.name}`}
              className="cell-input" style={{ width: 80 }} value={qty[l.id] ?? 0}
              onChange={(e) => setQty((q) => ({ ...q, [l.id]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <label className="return-fit">
        <input type="checkbox" checked={fit} onChange={(e) => setFit(e.target.checked)} />
        Los artículos están aptos para la venta (vuelven al stock)
      </label>
    </Modal>
  )
}
