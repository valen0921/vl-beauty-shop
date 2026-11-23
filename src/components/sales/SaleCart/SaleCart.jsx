import Card from '@/components/ui/Card/Card'
import Button from '@/components/ui/Button/Button'
import Icon from '@/components/ui/Icon/Icon'
import { formatCOP } from '@/utils/format'
import './SaleCart.css'

export default function SaleCart({ lines, onChangeQty, onRemove, onRegister, onFocusAdd }) {
  const total = lines.reduce((sum, l) => sum + l.unit * l.qty, 0)

  return (
    <Card variant="band" title="Carrito de venta" action={<span className="muted small">{lines.length} productos</span>}>
      <div className="cart">
        <ul className="cart__lines">
          {lines.length === 0 && <li className="cart__empty">Agrega productos para empezar la venta.</li>}
          {lines.map((l) => (
            <li key={l.id}>
              <div className="cart__name">
                <strong>{l.name}</strong>
                <small>{l.variant}</small>
              </div>
              <div className="cart__qty">
                <button type="button" aria-label="Quitar una unidad" onClick={() => onChangeQty(l.id, -1)}><Icon name="minus" size={12} /></button>
                <span>{l.qty}</span>
                <button type="button" aria-label="Añadir una unidad" onClick={() => onChangeQty(l.id, 1)}><Icon name="plus" size={12} /></button>
              </div>
              <span className="cart__unit">Unit. {formatCOP(l.unit)}</span>
              <strong className="cart__amount">{formatCOP(l.unit * l.qty)}</strong>
              <button type="button" className="cart__remove" aria-label={`Quitar ${l.name}`} onClick={() => onRemove(l.id)}><Icon name="close" size={13} /></button>
            </li>
          ))}
        </ul>

        <div className="cart__summary">
          <div><span>Subtotal</span><span>{formatCOP(total)}</span></div>
          <div className="cart__total"><strong>Total</strong><span>{formatCOP(total)}</span></div>
        </div>
        <div className="form-actions">
          <Button icon="plus" onClick={onFocusAdd}>Agregar producto</Button>
          <Button variant="primary" onClick={onRegister} disabled={lines.length === 0}>Registrar venta</Button>
        </div>
      </div>
    </Card>
  )
}
