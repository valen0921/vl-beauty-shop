import { useState } from 'react'
import Card from '@/components/ui/Card/Card'
import SearchField from '@/components/ui/SearchField/SearchField'
import FilterSelect from '@/components/ui/FilterSelect/FilterSelect'
import DataTable from '@/components/ui/DataTable/DataTable'
import TableFooter from '@/components/ui/TableFooter/TableFooter'
import Badge from '@/components/ui/Badge/Badge'
import ActionMenu from '@/components/ui/ActionMenu/ActionMenu'
import LinkButton from '@/components/ui/LinkButton/LinkButton'
import { stockStatus } from '@/utils/inventory'
import { STORE_NAME } from '@/config'
import './StockTable.css'

const PREVIEW = 5
const availability = ['Disponibilidad', 'Disponible', 'Stock bajo', 'Agotado']

export default function StockTable({ products, categories, totalRefs, onAdjust, onEntry, onView }) {
  const allCategories = 'Todas las categorías'
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(allCategories)
  const [state, setState] = useState(availability[0])
  const [showAll, setShowAll] = useState(false)

  const matches = products.filter((p) => {
    const text = `${p.name} ${p.id}`.toLowerCase()
    return (
      text.includes(query.trim().toLowerCase()) &&
      (category === allCategories || p.category === category) &&
      (state === availability[0] || stockStatus(p).label === state)
    )
  })
  const rows = showAll ? matches : matches.slice(0, PREVIEW)
  const hidden = matches.length - rows.length

  const columns = [
    { key: 'name', header: 'Producto / ubicación', render: (p) => (<><div className="cell-title">{p.name}</div><div className="cell-sub">{p.id} · {p.category} · {p.location}</div></>) },
    { key: 'stock', header: 'Stock', width: 90, render: (p) => { const s = stockStatus(p); return <strong className={s.tone === 'warning' ? 'tone-warning' : s.tone === 'danger' ? 'tone-danger' : ''}>{p.stock}</strong> } },
    { key: 'min', header: 'Mínimo', width: 90, render: (p) => <span className="muted">{p.min}</span> },
    { key: 'status', header: 'Estado', width: 130, render: (p) => { const s = stockStatus(p); return <Badge tone={s.tone}>{s.label}</Badge> } },
    {
      key: 'actions', header: '', width: 50, align: 'right',
      render: (p) => (
        <ActionMenu
          items={[
            { label: 'Ajustar stock', icon: 'sliders', onClick: () => onAdjust(p.id) },
            { label: 'Registrar entrada', icon: 'plus', onClick: () => onEntry(p.id) },
            { label: 'Ver en productos', icon: 'eye', onClick: () => onView(p.id) },
          ]}
        />
      ),
    },
  ]

  return (
    <Card flush title="Existencias actuales" action={<span className="muted small">{STORE_NAME}</span>}>
      <div className="stock-table__toolbar">
        <SearchField placeholder="Buscar producto o código…" value={query} onChange={setQuery} />
        <FilterSelect options={[allCategories, ...categories]} value={category} onChange={setCategory} />
        <FilterSelect options={availability} value={state} onChange={setState} />
      </div>
      <DataTable columns={columns} rows={rows} rowKey="id" emptyText="No hay productos con esos filtros." />
      <TableFooter>
        <span>Mostrando {rows.length} de {matches.length === products.length ? totalRefs : matches.length} referencias</span>
        {(hidden > 0 || showAll) && matches.length > PREVIEW && (
          <LinkButton onClick={() => setShowAll((v) => !v)}>{showAll ? '← Ver menos' : 'Ver todas las existencias →'}</LinkButton>
        )}
      </TableFooter>
    </Card>
  )
}
