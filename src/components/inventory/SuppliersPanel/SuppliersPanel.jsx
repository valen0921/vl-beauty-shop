import { useState } from 'react'
import Card from '@/components/ui/Card/Card'
import Button from '@/components/ui/Button/Button'
import Icon from '@/components/ui/Icon/Icon'
import DataTable from '@/components/ui/DataTable/DataTable'
import SupplierForm from '@/components/inventory/SupplierForm/SupplierForm'
import PurchaseHistory from '@/components/inventory/PurchaseHistory/PurchaseHistory'

const columns = [
  { key: 'name', header: 'Proveedor', render: (s) => (<><div className="cell-title">{s.name}</div><div className="cell-sub">{s.place}</div></>) },
  { key: 'phone', header: 'Teléfono', render: (s) => <span className="muted">{s.phone}</span> },
  { key: 'email', header: 'Correo', render: (s) => <span className="muted">{s.email}</span> },
  { key: 'lastPurchase', header: 'Última compra', render: (s) => <span className="muted">{s.lastPurchase}</span> },
  { key: 'go', header: '', width: 40, align: 'right', render: () => <Icon name="chevronRight" size={16} className="link-pink" /> },
]

export default function SuppliersPanel({ suppliers }) {
  const [selectedId, setSelectedId] = useState(suppliers[0].id)
  const [creating, setCreating] = useState(false)
  const [nonce, setNonce] = useState(0)
  const selected = suppliers.find((s) => s.id === selectedId) ?? suppliers[0]

  const select = (id) => { setSelectedId(id); setCreating(false); setNonce((n) => n + 1) }

  return (
    <Card
      flush
      title="Proveedores y compras"
      subtitle="Consulta proveedores, edita datos y revisa el historial de compras del seleccionado."
      action={<Button variant="primary" size="sm" onClick={() => { setCreating(true); setNonce((n) => n + 1) }}>Nuevo proveedor</Button>}
    >
      <DataTable columns={columns} rows={suppliers} selectedId={creating ? null : selected.id} onRowSelect={(s) => select(s.id)} />
      <div className="stack" style={{ padding: 20 }}>
        <SupplierForm
          key={creating ? `new-${nonce}` : `${selected.id}-${nonce}`}
          supplier={selected}
          creating={creating}
          onSaved={(s) => select(s.id)}
          onCancel={() => { setCreating(false); setNonce((n) => n + 1) }}
        />
        {!creating && <PurchaseHistory supplier={selected} />}
      </div>
    </Card>
  )
}
