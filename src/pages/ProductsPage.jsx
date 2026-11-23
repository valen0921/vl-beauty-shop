import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader/PageHeader'
import Button from '@/components/ui/Button/Button'
import StatCard from '@/components/ui/StatCard/StatCard'
import ProductsTable from '@/components/products/ProductsTable/ProductsTable'
import PromoBanner from '@/components/products/PromoBanner/PromoBanner'
import ProductForm from '@/components/products/ProductForm/ProductForm'
import ImportModal from '@/components/products/ImportModal/ImportModal'
import { useStore } from '@/store/StoreProvider'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import { categoryOptions } from '@/store/logic'
import { productStats } from '@/store/selectors'

export default function ProductsPage() {
  const { state, duplicateProduct, setProductsStatus, deleteProducts } = useStore()
  const { toast, confirm } = useUI()
  const location = useLocation()
  const products = state.products

  const [selectedId, setSelectedId] = useState(() => location.state?.select ?? products[0]?.id ?? null)
  const [creating, setCreating] = useState(false)
  const [formNonce, setFormNonce] = useState(0)
  const [tab, setTab] = useState('all')
  const [importOpen, setImportOpen] = useState(false)
  const formRef = useRef(null)
  const tableRef = useRef(null)

  const selected = products.find((p) => p.id === selectedId) ?? null
  const isCreating = creating || !selected
  const { stats, counts, drafts } = productStats(state)

  const scrollTo = (ref) => setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)

  useEffect(() => {
    if (location.state?.select) { setSelectedId(location.state.select); setCreating(false) }
  }, [location.state])

  const startCreate = () => { setCreating(true); setFormNonce((n) => n + 1); scrollTo(formRef) }
  const selectProduct = (id) => { setSelectedId(id); setCreating(false); setFormNonce((n) => n + 1) }
  const editProduct = (id) => { selectProduct(id); scrollTo(formRef) }
  const cancelForm = () => { setCreating(false); setFormNonce((n) => n + 1) }
  const afterSave = (product) => { setSelectedId(product.id); setCreating(false); setFormNonce((n) => n + 1) }

  const duplicate = (id) => {
    const r = duplicateProduct(id)
    if (!r.ok) { toast(r.error, 'error'); return }
    toast(`Copia creada como borrador: ${r.product.id}. Ajusta sus datos y guárdala.`)
    editProduct(r.product.id)
  }
  const setStatus = (id, status) => {
    const p = products.find((x) => x.id === id)
    setProductsStatus([id], status)
    toast(status === 'Archivado' ? `«${p.name}» archivado.` : `«${p.name}» vuelve a estar activo.`)
  }
  const afterDelete = (ids) => {
    if (ids.includes(selectedId)) { setSelectedId(products.find((p) => !ids.includes(p.id))?.id ?? null); setFormNonce((n) => n + 1) }
  }
  const remove = async (id) => {
    const p = products.find((x) => x.id === id)
    const stockNote = p.stock > 0 ? ` Tiene ${p.stock} ud. en stock, que dejarán de contarse.` : ''
    const yes = await confirm({ title: 'Eliminar producto', message: `¿Eliminar «${p.name}» del catálogo?${stockNote} Las facturas ya emitidas conservan su detalle. Si solo quieres ocultarlo, usa «Archivar».`, confirmLabel: 'Eliminar', danger: true })
    if (!yes) return
    deleteProducts([id])
    afterDelete([id])
    toast(`«${p.name}» eliminado.`)
  }
  const bulkStatus = async (ids, status) => {
    setProductsStatus(ids, status)
    toast(`${ids.length} ${ids.length === 1 ? 'producto actualizado' : 'productos actualizados'} (${status.toLowerCase()}).`)
    return true
  }
  const bulkDelete = async (ids) => {
    const yes = await confirm({ title: 'Eliminar productos', message: `¿Eliminar ${ids.length} ${ids.length === 1 ? 'producto' : 'productos'} del catálogo? Esta acción no se puede deshacer.`, confirmLabel: 'Eliminar', danger: true })
    if (!yes) return false
    deleteProducts(ids)
    afterDelete(ids)
    toast(`${ids.length} ${ids.length === 1 ? 'producto eliminado' : 'productos eliminados'}.`)
    return true
  }
  const reviewDrafts = () => { setTab('Borrador'); scrollTo(tableRef) }

  return (
    <div className="page-stack">
      <PageHeader
        title="Tu colección, al día"
        subtitle="Gestiona los productos que hacen brillar tu boutique."
        actions={
          <>
            <Button icon="upload" onClick={() => setImportOpen(true)}>Importar</Button>
            <Button variant="primary" icon="plus" onClick={startCreate}>Nuevo producto</Button>
          </>
        }
      />
      <div className="stat-grid">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
      <div ref={tableRef}>
        <ProductsTable
          products={products}
          categories={categoryOptions(products)}
          counts={counts}
          selectedId={isCreating ? null : selectedId}
          tab={tab}
          onTab={setTab}
          onSelect={selectProduct}
          onEdit={editProduct}
          onDuplicate={duplicate}
          onSetStatus={setStatus}
          onDelete={remove}
          onBulkStatus={bulkStatus}
          onBulkDelete={bulkDelete}
        />
      </div>
      <PromoBanner drafts={drafts} onReview={reviewDrafts} />
      <div ref={formRef}>
        <ProductForm
          key={isCreating ? `new-${formNonce}` : `${selected.id}-${formNonce}`}
          product={selected}
          creating={isCreating}
          onSaved={afterSave}
          onCancel={cancelForm}
        />
      </div>
      {importOpen && <ImportModal onClose={() => setImportOpen(false)} />}
    </div>
  )
}
