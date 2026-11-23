import Card from '@/components/ui/Card/Card'
import { plural } from '@/store/selectors'
import './LastSaleCard.css'

export default function LastSaleCard({ invoice, when, lines, units }) {
  return (
    <Card title="Última venta sincronizada" subtitle={`${invoice} · ${when}`}>
      <ul className="last-sale">
        {lines.map((l) => (
          <li key={l.name}><span>{l.name}</span><strong>{l.before} → {l.after}</strong></li>
        ))}
      </ul>
      <p className="last-sale__note">{units} {plural(units, 'unidad descontada', 'unidades descontadas')}</p>
    </Card>
  )
}
