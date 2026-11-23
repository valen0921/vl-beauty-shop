import { useState } from 'react'
import Card from '@/components/ui/Card/Card'
import Badge from '@/components/ui/Badge/Badge'
import Button from '@/components/ui/Button/Button'
import FormField from '@/components/ui/FormField/FormField'
import { useStore } from '@/store/StoreProvider'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import { categoryOptions, nextProductId } from '@/store/logic'
import { formatCOP } from '@/utils/format'
import './ProductForm.css'

const emptyForm = (products) => ({
  id: nextProductId(products), name: '', brand: '', variant: '', category: 'Labios', price: '', status: 'Activo',
  location: '', min: '10', stock: '0', description: '',
})
const fromProduct = (p) => ({
  id: p.id, name: p.name, brand: p.brand, variant: p.variant, category: p.category, price: formatCOP(p.price), status: p.status,
  location: p.location, min: String(p.min), stock: String(p.stock), description: p.description,
})

// Se vuelve a montar (key) cada vez que cambia el producto o se pulsa "Nuevo producto".
export default function ProductForm({ product, creating, onSaved, onCancel }) {
  const { state, saveProduct } = useStore()
  const { toast } = useUI()
  const [form, setForm] = useState(() => (creating ? emptyForm(state.products) : fromProduct(product)))
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setValue = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  const categories = categoryOptions(state.products)
  if (!categories.includes(form.category)) categories.push(form.category)

  const save = () => {
    const result = saveProduct({ mode: creating ? 'create' : 'edit', data: form })
    if (!result.ok) { toast(result.error, 'error'); return }
    toast(creating ? `Producto «${result.product.name}» creado.` : `Cambios guardados en «${result.product.name}».`)
    onSaved(result.product)
  }

  const formatPrice = () => {
    const n = Number(form.price.replace(/\D/g, ''))
    if (n > 0) setForm((f) => ({ ...f, price: formatCOP(n) }))
  }

  return (
    <Card
      serif
      title="Formulario de producto"
      subtitle="Completa los datos del producto para registrar o actualizar la información visible en el catálogo."
      action={<Badge tone="pink">{creating ? 'Nuevo producto' : 'Editar producto'}</Badge>}
    >
      <div className="form-grid form-grid--2 product-form__grid">
        <FormField label="Código / identificador" value={form.id} onChange={set('id')} readOnly={!creating} />
        <FormField label="Nombre del producto" value={form.name} onChange={set('name')} placeholder="Ej. Labial Velvet Matte" />
        <FormField label="Marca" value={form.brand} onChange={set('brand')} />
        <FormField label="Variante / tono" value={form.variant} onChange={set('variant')} />
        <FormField label="Categoría" as="select" options={categories} value={form.category} onChange={setValue('category')} />
        <FormField label="Precio" value={form.price} onChange={set('price')} onBlur={formatPrice} inputMode="numeric" placeholder="$0" />
        <FormField label="Estado" as="select" options={['Activo', 'Borrador', 'Archivado']} value={form.status} onChange={setValue('status')} />
        <FormField label="Ubicación en bodega" value={form.location} onChange={set('location')} placeholder="Ej. A-01" />
        <FormField label="Stock mínimo" value={form.min} onChange={set('min')} inputMode="numeric" />
        {creating
          ? <FormField label="Stock inicial" value={form.stock} onChange={set('stock')} inputMode="numeric" />
          : <FormField label="Stock actual (se cambia desde Inventario)" value={`${form.stock} unidades`} readOnly />}
        <FormField label="Descripción" as="textarea" value={form.description} onChange={set('description')} className="product-form__wide" />
      </div>
      <div className="product-form__footer">
        <span>El código identifica el producto en el catálogo y en sus movimientos.</span>
        <div className="form-actions">
          <Button onClick={onCancel}>Cancelar</Button>
          <Button variant="primary" onClick={save}>{creating ? 'Crear producto' : 'Guardar producto'}</Button>
        </div>
      </div>
    </Card>
  )
}
