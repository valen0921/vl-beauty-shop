import { useState } from 'react'
import Card from '@/components/ui/Card/Card'
import Badge from '@/components/ui/Badge/Badge'
import Button from '@/components/ui/Button/Button'
import Icon from '@/components/ui/Icon/Icon'
import FilterSelect from '@/components/ui/FilterSelect/FilterSelect'
import DataTable from '@/components/ui/DataTable/DataTable'
import TableFooter from '@/components/ui/TableFooter/TableFooter'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import { downloadCSV } from '@/utils/files'
import { formatDelta } from '@/utils/format'
import { TODAY } from '@/config'

const FILTERS = {
  'Todos los movimientos': null,
  Ventas: 'venta',
  Entradas: 'entrada',
  Ajustes: 'ajuste',
  Devoluciones: 'devolucion',
}
const LIMIT = 15

const columns = [
  { key: 'time', header: 'Hora', width: 80, render: (r) => <span className="muted">{r.time}</span> },
  { key: 'product', header: 'Producto', render: (r) => <span className="cell-title">{r.product}</span> },
  { key: 'reason', header: 'Motivo / documento', render: (r) => <span className="muted">{r.reason}</span> },
  { key: 'units', header: 'Cantidad', width: 100, render: (r) => <span className={r.units < 0 ? 'num-neg' : 'num-pos'}>{formatDelta(r.units)}</span> },
  { key: 'change', header: 'Antes → ahora', width: 130, render: (r) => `${r.before} → ${r.after}` },
  {
    key: 'by', header: 'Responsable', width: 160,
    render: (r) => r.by === 'Automático'
      ? <span className="link-pink" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="zap" size={13} />Automático</span>
      : <span className="muted">{r.by}</span>,
  },
]

export default function MovementsLog({ movements }) {
  const { toast } = useUI()
  const [filter, setFilter] = useState('Todos los movimientos')
  const kind = FILTERS[filter]
  const rows = movements.filter((m) => !kind || m.kind === kind)
  const shown = rows.slice(0, LIMIT)

  const exportRows = () => {
    if (!rows.length) { toast('No hay movimientos para exportar con este filtro.', 'warning'); return }
    downloadCSV('movimientos-inventario.csv', [
      ['Fecha', 'Hora', 'Producto', 'Motivo / documento', 'Cantidad', 'Antes', 'Después', 'Responsable'],
      ...rows.map((m) => [TODAY, m.time, m.product, m.reason, m.units, m.before, m.after, m.by]),
    ])
    toast(`${rows.length} movimientos exportados a movimientos-inventario.csv`)
  }

  return (
    <Card
      flush
      title={<>Registro de movimientos <Badge tone="pink">Hoy</Badge></>}
      action={
        <>
          <FilterSelect options={Object.keys(FILTERS)} value={filter} onChange={setFilter} />
          <Button size="sm" icon="download" onClick={exportRows}>Exportar</Button>
        </>
      }
    >
      <DataTable columns={columns} rows={shown} emptyText="No hay movimientos de este tipo." />
      {rows.length > LIMIT && (
        <TableFooter><span>Mostrando los {LIMIT} más recientes de {rows.length} movimientos. Exporta para ver todos.</span></TableFooter>
      )}
    </Card>
  )
}
