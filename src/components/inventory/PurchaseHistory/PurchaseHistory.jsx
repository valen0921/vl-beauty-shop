import Badge from '@/components/ui/Badge/Badge'
import DataTable from '@/components/ui/DataTable/DataTable'
import { formatCOP } from '@/utils/format'
import './PurchaseHistory.css'

const columns = [
  { key: 'date', header: 'Fecha', render: (h) => <span className="muted">{h.date}</span> },
  { key: 'purchase', header: 'Compra', render: (h) => <strong>{h.purchase}</strong> },
  { key: 'invoice', header: 'Factura', render: (h) => <span className="muted">{h.invoice}</span> },
  { key: 'amount', header: 'Monto', render: (h) => <strong>{formatCOP(h.amount)}</strong> },
  { key: 'status', header: 'Estado', render: () => <Badge tone="success">Recibida</Badge> },
]

export default function PurchaseHistory({ supplier }) {
  return (
    <section className="purchase-history">
      <header>
        <h4>Historial de compras · {supplier.name}</h4>
        <span>{supplier.history.length ? `Últimos ${supplier.history.length} movimientos` : 'Sin movimientos'}</span>
      </header>
      <DataTable columns={columns} rows={supplier.history} emptyText="Aún no hay compras con este proveedor." />
    </section>
  )
}
