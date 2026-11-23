import Card from '@/components/ui/Card/Card'
import DataTable from '@/components/ui/DataTable/DataTable'
import TableFooter from '@/components/ui/TableFooter/TableFooter'
import LinkButton from '@/components/ui/LinkButton/LinkButton'
import { formatCOP } from '@/utils/format'

const columns = [
  { key: 'rank', header: '', width: 50, render: (p) => <strong>{p.rank}</strong> },
  { key: 'name', header: 'Producto', render: (p) => (<><div className="cell-title">{p.name}</div><div className="cell-sub">{p.id} · {p.category}</div></>) },
  { key: 'units', header: 'Unidades', width: 100 },
  { key: 'sales', header: 'Ventas', width: 120, render: (p) => <strong>{formatCOP(p.sales)}</strong> },
  { key: 'stock', header: 'Stock', width: 90, render: (p) => <span className={p.low ? 'tone-warning' : 'muted'}>{p.stock} ud.</span> },
]

export default function TopProducts({ products, onExport }) {
  const total = products.reduce((sum, p) => sum + p.sales, 0)
  return (
    <Card flush title="Productos más vendidos" action={<span className="muted small">Ordenados por importe</span>}>
      <DataTable columns={columns} rows={products} emptyText="No hay ventas de productos en esta vista." />
      <TableFooter>
        <span>{products.length} productos · {formatCOP(total)} en ventas</span>
        <LinkButton onClick={onExport}>Descargar reporte de productos →</LinkButton>
      </TableFooter>
    </Card>
  )
}
