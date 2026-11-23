import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card/Card'
import Tabs from '@/components/ui/Tabs/Tabs'
import SearchField from '@/components/ui/SearchField/SearchField'
import FilterSelect from '@/components/ui/FilterSelect/FilterSelect'
import DataTable from '@/components/ui/DataTable/DataTable'
import TableFooter from '@/components/ui/TableFooter/TableFooter'
import Pagination from '@/components/ui/Pagination/Pagination'
import Badge from '@/components/ui/Badge/Badge'
import { formatCOP } from '@/utils/format'
import { TODAY, YESTERDAY } from '@/config'

const STATUS_TONE = { Pagada: 'success', Pendiente: 'warning', Anulada: 'neutral' }
const DAYS = [{ value: TODAY, label: 'Hoy, 22 oct' }, { value: YESTERDAY, label: 'Ayer, 21 oct' }]
const ANY_METHOD = 'Método de pago'
const PAGE_SIZE = 6

const columns = [
  { key: 'id', header: 'Factura / hora', width: 160, render: (r) => (<><div className="link-pink">{r.id}</div><div className="cell-sub">{r.day.slice(0, 6)} · {r.hour}</div></>) },
  { key: 'client', header: 'Cliente', render: (r) => <span className="cell-title">{r.client}</span> },
  { key: 'method', header: 'Pago', width: 120, render: (r) => <span className="muted small">{r.method}</span> },
  { key: 'total', header: 'Total', width: 120, render: (r) => <strong>{formatCOP(r.total)}</strong> },
  { key: 'status', header: 'Estado', width: 120, render: (r) => <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge> },
]

export default function SalesList({ invoices, tabs, summary, selectedId, onSelect }) {
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [day, setDay] = useState(TODAY)
  const [method, setMethod] = useState(ANY_METHOD)
  const [page, setPage] = useState(1)

  const visible = (i) =>
    i.day === day &&
    `${i.id} ${i.client}`.toLowerCase().includes(query.trim().toLowerCase()) &&
    (tab === 'all' || i.status === tab) &&
    (method === ANY_METHOD || i.method === method)
  const rows = invoices.filter(visible)

  // Si se selecciona una factura que los filtros ocultan (p. ej. una venta recién registrada), se limpian.
  useEffect(() => {
    const inv = invoices.find((i) => i.id === selectedId)
    if (inv && !visible(inv)) {
      setTab('all'); setQuery(''); setMethod(ANY_METHOD); setDay(inv.day); setPage(1)
    }
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const reset = (setter) => (v) => { setter(v); setPage(1) }
  const isToday = day === TODAY

  return (
    <Card flush>
      <div className="stack" style={{ padding: '0 20px 18px', gap: 18 }}>
        <Tabs
          tabs={tabs.map((t) => ({ ...t, count: t.id === 'Pendiente' ? summary.pendingCount : undefined }))}
          active={tab}
          onChange={reset(setTab)}
        />
        <div className="toolbar">
          <SearchField placeholder="Buscar factura o cliente…" value={query} onChange={reset(setQuery)} />
          <FilterSelect options={DAYS} value={day} onChange={reset(setDay)} />
          <FilterSelect options={[ANY_METHOD, 'Tarjeta', 'Efectivo', 'Transferencia']} value={method} onChange={reset(setMethod)} />
        </div>
      </div>
      <DataTable columns={columns} rows={pageRows} selectedId={selectedId} onRowSelect={(r) => onSelect(r.id)} emptyText="No hay ventas en esta vista." />
      <TableFooter>
        <span>
          {isToday
            ? `${pageRows.length} de ${summary.count} ventas de hoy · ${summary.annulled} ${summary.annulled === 1 ? 'anulación adicional' : 'anulaciones adicionales'}`
            : `${rows.length} ${rows.length === 1 ? 'venta registrada' : 'ventas registradas'} en este día`}
        </span>
        <Pagination page={current} pageCount={pageCount} onChange={setPage} />
      </TableFooter>
    </Card>
  )
}
