import { useState } from 'react'
import FormField from '@/components/ui/FormField/FormField'
import Button from '@/components/ui/Button/Button'
import { useStore } from '@/store/StoreProvider'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import { nextSupplierId } from '@/store/logic'
import './SupplierForm.css'

export default function SupplierForm({ supplier, creating, onSaved, onCancel }) {
  const { state, saveSupplier } = useStore()
  const { toast } = useUI()
  const [form, setForm] = useState(() => (creating
    ? { id: nextSupplierId(state.suppliers), name: '', phone: '', email: '' }
    : { id: supplier.id, name: supplier.name, phone: supplier.phone, email: supplier.email }))
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const save = () => {
    const r = saveSupplier({ mode: creating ? 'create' : 'edit', data: form })
    if (!r.ok) { toast(r.error, 'error'); return }
    toast(creating ? `Proveedor «${r.supplier.name}» creado.` : `Datos de «${r.supplier.name}» guardados.`)
    onSaved(r.supplier)
  }

  return (
    <section className="supplier-form">
      <h4>Datos del proveedor · {creating ? 'Crear' : 'Editar'}</h4>
      <div className="form-grid">
        <FormField label="Identificador" value={form.id} onChange={set('id')} readOnly={!creating} />
        <FormField label="Nombre / razón social" value={form.name} onChange={set('name')} />
        <FormField label="Teléfono" value={form.phone} onChange={set('phone')} inputMode="tel" />
        <FormField label="Correo electrónico" value={form.email} onChange={set('email')} type="email" />
      </div>
      <div className="form-actions">
        <Button onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" onClick={save}>Guardar proveedor</Button>
      </div>
    </section>
  )
}
