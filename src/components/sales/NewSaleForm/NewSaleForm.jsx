import Card from '@/components/ui/Card/Card'
import FormField from '@/components/ui/FormField/FormField'
import { SELLER, TODAY, YESTERDAY } from '@/config'
import './NewSaleForm.css'

export default function NewSaleForm({ products, itemCount, form, onChange, onAddProduct }) {
  return (
    <Card variant="band" title="Datos de la venta" action={<span className="muted small">{itemCount} {itemCount === 1 ? 'producto' : 'productos'} · Borrador</span>}>
      <div className="form-grid form-grid--2">
        <FormField upper label="Cliente" placeholder="Nombre del cliente (opcional)" value={form.customer} onChange={(e) => onChange('customer', e.target.value)} />
        <FormField upper label="Fecha" as="select" options={[TODAY, YESTERDAY]} value={form.day} onChange={(v) => onChange('day', v)} />
        <FormField
          upper
          label="Método de pago"
          as="select"
          options={[{ value: '', label: 'Seleccionar método…' }, 'Tarjeta', 'Efectivo', 'Transferencia']}
          value={form.method}
          onChange={(v) => onChange('method', v)}
        />
        <FormField upper label="Vendedor" defaultValue={SELLER} readOnly />
      </div>
      <FormField
        upper
        className="new-sale__add"
        label="Producto para agregar"
        as="select"
        value=""
        onChange={(id) => id && onAddProduct(id)}
        options={[{ value: '', label: 'Buscar por nombre o código…' }, ...products.map((p) => ({ value: p.id, label: `${p.name} · ${p.id}${p.stock === 0 ? ' (agotado)' : ''}` }))]}
      />
      <div className="new-sale__note">
        <label htmlFor="sale-note"><strong>Nota interna</strong></label>
        <textarea id="sale-note" rows={2} placeholder="Agrega observaciones para el cobro, la entrega o el seguimiento de la venta." value={form.note} onChange={(e) => onChange('note', e.target.value)} />
      </div>
      {form.method === 'Transferencia' && <p className="new-sale__hint">Las ventas por transferencia quedan pendientes y no descuentan stock hasta confirmar el cobro.</p>}
    </Card>
  )
}
