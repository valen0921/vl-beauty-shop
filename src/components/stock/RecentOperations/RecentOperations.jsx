import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card/Card'
import FilterSelect from '@/components/ui/FilterSelect/FilterSelect'
import DataTable from '@/components/ui/DataTable/DataTable'
import TableFooter from '@/components/ui/TableFooter/TableFooter'
import Badge from '@/components/ui/Badge/Badge'
import { formatDelta } from '@/utils/format'

const columns = [
  { key: 'time', header: 'Hora', width: 80, render: (r) => <span className="muted">{r.time}</span> },
  { key: 'doc', header: 'Documento / origen', render: (r) => (<><div className="link-pink">{r.doc}</div><div className="cell-sub">{r.origin}</div></>) },
  { key: 'product', header: 'Producto', render: (r) => <span className="cell-title">{r.product}</span> },
  { key: 'units', header: 'Ud.', width: 70, render: (r) => <span className={r.units < 0 ? 'num-neg' : 'num-pos'}>{formatDelta(r.units)}</span> },
  { key: 'stock', header: 'Stock', width: 100, render: (r) => `${r.before} → ${r.after}` },
  { key: 'result', header: 'Resultado', width: 120, render: (r) => <Badge tone="success">{r.result}</Badge> },
]

export const DAY_OPTIONS = ['Hoy, 22 oct', 'Ayer, 21 oct']

export default function RecentOperations({ operations, selectedId, onSelect, day, onDayChange }) {
  return (
    <Card
      flush
      title="Operaciones automáticas recientes"
      subtitle="Trazabilidad de cada cambio de existencias"
      action={<FilterSelect options={DAY_OPTIONS} value={day} onChange={onDayChange} />}
    >
      <DataTable columns={columns} rows={operations} selectedId={selectedId} onRowSelect={(row) => onSelect(row.id)} emptyText="No hay operaciones registradas en este día." />
      <TableFooter>
        <span>Cada documento se procesa una sola vez.</span>
        <Link to="/inventario" state={{ scrollTo: 'movimientos' }} className="link-pink">Ver registro completo →</Link>
      </TableFooter>
    </Card>
  )
}
