import Icon from '@/components/ui/Icon/Icon'
import { formatCOP } from '@/utils/format'
import './CashCloseCard.css'

export default function CashCloseCard({ summary, closedAt, onClick }) {
  return (
    <button type="button" className="cash-close" onClick={onClick}>
      <span className="cash-close__icon"><Icon name="creditCard" size={20} /></span>
      <span className="cash-close__text">
        <strong>{closedAt ? `Caja cerrada a las ${closedAt}` : 'Todo listo para el cierre'}</strong>
        <small>Tarjeta {formatCOP(summary.card)} · Efectivo {formatCOP(summary.cash)} · Por cobrar {formatCOP(summary.pending)}</small>
      </span>
      <Icon name="arrowUpRight" size={16} className="cash-close__go" />
    </button>
  )
}
