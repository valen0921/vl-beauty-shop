import Card from '@/components/ui/Card/Card'
import ProgressBar from '@/components/ui/ProgressBar/ProgressBar'
import { formatCOP } from '@/utils/format'
import './CategoryBreakdown.css'

export default function CategoryBreakdown({ categories }) {
  const total = categories.reduce((sum, c) => sum + c.amount, 0)
  return (
    <Card title="¿Qué enamora a tus clientes?" subtitle="Distribución de ventas por categoría">
      {categories.length === 0 && <p className="muted small">No hay ventas en esta categoría.</p>}
      <ul className="categories">
        {categories.map((c) => (
          <li key={c.name}>
            <div className="categories__row">
              <span className="categories__name"><i style={{ background: c.color }} />{c.name}</span>
              <strong>{formatCOP(c.amount)}</strong>
            </div>
            <ProgressBar value={c.percent} color={c.color} />
            <span className="categories__pct">{String(c.percent).replace('.', ',')} %</span>
          </li>
        ))}
      </ul>
      <p className="categories__total">Total: {formatCOP(total)} · IVA del 21 % incluido</p>
    </Card>
  )
}
