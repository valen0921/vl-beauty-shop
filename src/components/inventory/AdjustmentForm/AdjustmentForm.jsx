import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card/Card'
import Badge from '@/components/ui/Badge/Badge'
import Button from '@/components/ui/Button/Button'
import Callout from '@/components/ui/Callout/Callout'
import FormField from '@/components/ui/FormField/FormField'
import { useStore } from '@/store/StoreProvider'
import { useUI } from '@/components/ui/Feedback/UIProvider'
import './AdjustmentForm.css'

export default function AdjustmentForm({ products, reasons, presetId, presetNonce }) {
  const { adjustStock } = useStore()
  const { toast } = useUI()
  const defaultId = products.some((p) => p.id === 'BAS-003') ? 'BAS-003' : products[0]?.id
  const [productId, setProductId] = useState(defaultId)
  const [reasonValue, setReasonValue] = useState(reasons[0].value)

  useEffect(() => { if (presetNonce) setProductId(presetId) }, [presetNonce, presetId])

  const product = products.find((p) => p.id === productId) ?? products[0]
  const reason = reasons.find((r) => r.value === reasonValue)
  if (!product) return <Card title="Ajuste de inventario"><p className="muted">Crea un producto para poder ajustar su stock.</p></Card>

  const result = product.stock + reason.delta
  const invalid = result < 0

  const reset = () => { setProductId(defaultId); setReasonValue(reasons[0].value) }
  const confirm = () => {
    const text = reason.label.split(' · ').slice(1).join(' · ')
    const r = adjustStock({ productId: product.id, delta: reason.delta, reason: text })
    if (!r.ok) { toast(r.error, 'error'); return }
    toast(`Stock de «${product.name}» ajustado: ${r.before} → ${r.after} unidades.`)
  }

  return (
    <Card
      title="Ajuste de inventario"
      subtitle="Registra diferencias físicas, pérdidas o ajustes manuales por producto."
      action={<Badge tone="pink">Manual</Badge>}
    >
      <div className="form-grid form-grid--3">
        <FormField label="Producto" as="select" options={products.map((p) => ({ value: p.id, label: p.name }))} value={product.id} onChange={setProductId} />
        <FormField label="Cantidad / motivo" as="select" options={reasons} value={reasonValue} onChange={setReasonValue} />
        <FormField label="Stock actual" readOnly value={`${product.stock} unidades`} />
      </div>
      <div className="adjustment__result">
        <span>Resultado esperado</span>
        <strong className={invalid ? 'tone-danger' : ''}>{product.stock} → {invalid ? 'no válido' : result} {invalid ? '' : 'unidades'}</strong>
      </div>
      <div className="form-actions adjustment__actions">
        <Button onClick={reset}>Cancelar</Button>
        <Button variant="primary" onClick={confirm} disabled={invalid}>Confirmar ajuste</Button>
      </div>
      <Callout icon="alertCircle">El ajuste manual no modifica el costo de compra, solo actualiza la cantidad física del producto.</Callout>
    </Card>
  )
}
