import Icon from '@/components/ui/Icon/Icon'
import LinkButton from '@/components/ui/LinkButton/LinkButton'
import { formatCOP, formatNumber } from '@/utils/format'
import './InventorySnapshot.css'

export default function InventorySnapshot({ numbers, onExport }) {
  return (
    <aside className="snapshot">
      <h3><Icon name="boxes" size={18} /> Inventario al cierre del reporte</h3>
      <p>{formatNumber(numbers.units)} unidades · {formatCOP(numbers.value)} a coste</p>
      <p>{numbers.low} productos con stock bajo · {numbers.out} agotados</p>
      <LinkButton onClick={onExport}>Exportar inventario →</LinkButton>
    </aside>
  )
}
