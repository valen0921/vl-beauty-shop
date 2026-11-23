import { useMemo, useState } from 'react'
import Card from '@/components/ui/Card/Card'
import Tabs from '@/components/ui/Tabs/Tabs'
import SearchField from '@/components/ui/SearchField/SearchField'
import FilterSelect from '@/components/ui/FilterSelect/FilterSelect'
import Button from '@/components/ui/Button/Button'
import DataTable from '@/components/ui/DataTable/DataTable'
import TableFooter from '@/components/ui/TableFooter/TableFooter'
import Pagination from '@/components/ui/Pagination/Pagination'
import Badge from '@/components/ui/Badge/Badge'
import Icon from '@/components/ui/Icon/Icon'
import ActionMenu from '@/components/ui/ActionMenu/ActionMenu'
import ProductThumb from '@/components/products/ProductThumb/ProductThumb'
import { formatCOP } from '@/utils/format'
import { downloadCSV, PRODUCT_CSV_HEADER } from '@/utils/files'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import './ProductsTable.css'

const PAGE_SIZE = 5
const STATUS_TONE = { Activo: 'success', Borrador: 'warning', Archivado: 'neutral' }
const ALL_CATEGORIES = 'Todas las categorías'
const ALL_BRANDS = 'Todas las marcas'
const ANY_STATUS = 'Estado'

export default function ProductsTable({
  products, categories, counts, selectedId, tab, onTab, onSelect, onEdit, onDuplicate, onSetStatus, onDelete, onBulkStatus, onBulkDelete,
}) {
  const { toast } = useUI()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL_CATEGORIES)
  const [brand, setBrand] = useState(ALL_BRANDS)
  const [status, setStatus] = useState(ANY_STATUS)
  const [page, setPage] = useState(1)
  const [checked, setChecked] = useState(() => new Set())

  const tabs = [
    { id: 'all', label: 'Todos los productos', count: counts.all },
    { id: 'Activo', label: 'Activos', count: counts.Activo },
    { id: 'Borrador', label: 'Borradores', count: counts.Borrador },
    { id: 'Archivado', label: 'Archivados', count: counts.Archivado },
  ]
  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))].filter((b) => b && b !== '—'), [products])

  const rows = products.filter((p) => {
    const text = `${p.name} ${p.brand} ${p.id} ${p.variant}`.toLowerCase()
    return (
      text.includes(query.trim().toLowerCase()) &&
      (tab === 'all' || p.status === tab) &&
      (category === ALL_CATEGORIES || p.category === category) &&
      (brand === ALL_BRANDS || p.brand === brand) &&
      (status === ANY_STATUS || p.status === status)
    )
  })

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const from = (current - 1) * PAGE_SIZE
  const pageRows = rows.slice(from, from + PAGE_SIZE)

  const live = [...checked].filter((id) => products.some((p) => p.id === id))
  const allOnPage = pageRows.length > 0 && pageRows.every((p) => checked.has(p.id))

  const filter = (setter) => (value) => { setter(value); setPage(1) }
  const toggle = (id) => setChecked((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const togglePage = () => setChecked((prev) => {
    const n = new Set(prev)
    pageRows.forEach((p) => (allOnPage ? n.delete(p.id) : n.add(p.id)))
    return n
  })

  const exportRows = () => {
    if (!rows.length) { toast('No hay productos para exportar con estos filtros.', 'warning'); return }
    downloadCSV('productos.csv', [
      PRODUCT_CSV_HEADER,
      ...rows.map((p) => [p.id, p.name, p.brand, p.variant, p.category, p.price, p.stock, p.min, p.location, p.status, p.description]),
    ])
    toast(`${rows.length} ${rows.length === 1 ? 'producto exportado' : 'productos exportados'} a productos.csv`)
  }

  const columns = [
    {
      key: 'check',
      header: <input type="checkbox" className="checkbox" aria-label="Seleccionar todos los de esta página" checked={allOnPage} onChange={togglePage} />,
      width: 44,
      render: (p) => <input type="checkbox" className="checkbox" aria-label={`Seleccionar ${p.name}`} checked={checked.has(p.id)} onChange={() => toggle(p.id)} onClick={(e) => e.stopPropagation()} />,
    },
    {
      key: 'name', header: 'Producto',
      render: (p) => (
        <div className="product-cell">
          <ProductThumb id={p.id} name={p.name} />
          <div>
            <div className="cell-title">{p.name}</div>
            <div className="cell-sub">{p.brand} · {p.variant} · {p.id}</div>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Categoría', width: 110, render: (p) => <span className="muted">{p.category}</span> },
    { key: 'price', header: 'Precio', width: 110, render: (p) => <strong>{formatCOP(p.price)}</strong> },
    {
      key: 'stock', header: 'Stock', width: 110,
      render: (p) => {
        const low = p.stock < p.min
        return <span className={`stock-cell ${low ? 'tone-warning' : ''}`}>{p.stock} ud.{low && <Icon name="alertCircle" size={14} />}</span>
      },
    },
    { key: 'status', header: 'Estado', width: 110, render: (p) => <Badge tone={STATUS_TONE[p.status] || 'neutral'}>{p.status}</Badge> },
    { key: 'updated', header: 'Actualizado', width: 130, render: (p) => <span className="muted">{p.updated}</span> },
    {
      key: 'actions', header: '', width: 50, align: 'right',
      render: (p) => (
        <ActionMenu
          items={[
            { label: 'Editar', icon: 'edit', onClick: () => onEdit(p.id) },
            { label: 'Duplicar', icon: 'copy', onClick: () => onDuplicate(p.id) },
            p.status === 'Archivado'
              ? { label: 'Restaurar como activo', icon: 'unarchive', onClick: () => onSetStatus(p.id, 'Activo') }
              : { label: 'Archivar', icon: 'archive', onClick: () => onSetStatus(p.id, 'Archivado') },
            'separator',
            { label: 'Eliminar', icon: 'trash', danger: true, onClick: () => onDelete(p.id) },
          ]}
        />
      ),
    },
  ]

  return (
    <Card flush>
      <div className="products-table__head">
        <Tabs tabs={tabs} active={tab} onChange={(t) => { onTab(t); setPage(1) }} />
        <div className="toolbar">
          <SearchField placeholder="Buscar por nombre, marca o código…" value={query} onChange={filter(setQuery)} />
          <FilterSelect options={[ALL_CATEGORIES, ...categories]} value={category} onChange={filter(setCategory)} />
          <FilterSelect options={[ALL_BRANDS, ...brands]} value={brand} onChange={filter(setBrand)} />
          <FilterSelect options={[ANY_STATUS, 'Activo', 'Borrador', 'Archivado']} value={status} onChange={filter(setStatus)} />
          <Button size="sm" icon="download" className="toolbar__spacer" onClick={exportRows}>Exportar</Button>
        </div>
        {live.length > 0 && (
          <div className="bulk" role="region" aria-label="Acciones sobre la selección">
            <strong>{live.length} {live.length === 1 ? 'seleccionado' : 'seleccionados'}</strong>
            <Button size="sm" icon="archive" onClick={async () => { if (await onBulkStatus(live, 'Archivado')) setChecked(new Set()) }}>Archivar</Button>
            <Button size="sm" icon="check" onClick={async () => { if (await onBulkStatus(live, 'Activo')) setChecked(new Set()) }}>Activar</Button>
            <Button size="sm" icon="trash" onClick={async () => { if (await onBulkDelete(live)) setChecked(new Set()) }}>Eliminar</Button>
            <button type="button" className="link-btn link-pink" onClick={() => setChecked(new Set())}>Limpiar selección</button>
          </div>
        )}
      </div>
      <DataTable columns={columns} rows={pageRows} selectedId={selectedId} onRowSelect={(p) => onSelect(p.id)} emptyText="No hay productos en esta vista." />
      <TableFooter>
        <span>{rows.length ? `Mostrando ${from + 1}–${from + pageRows.length} de ${rows.length} ${rows.length === 1 ? 'producto' : 'productos'}` : 'Sin resultados'}</span>
        <Pagination page={current} pageCount={pageCount} onChange={setPage} />
      </TableFooter>
    </Card>
  )
}
