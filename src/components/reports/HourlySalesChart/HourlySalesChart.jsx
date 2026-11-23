import Card from '@/components/ui/Card/Card'
import Badge from '@/components/ui/Badge/Badge'
import Icon from '@/components/ui/Icon/Icon'
import { formatCOP } from '@/utils/format'
import './HourlySalesChart.css'

const MANTISSAS = [1, 1.2, 1.5, 1.8, 2, 2.4, 3, 4, 5, 6, 8]

// Techo "redondo" para el eje (1,6 M → 1,8 M).
function niceMax(value) {
  if (value <= 0) return 1000
  const p = 10 ** Math.floor(Math.log10(value))
  return (MANTISSAS.map((m) => m * p).find((v) => v >= value)) ?? 10 * p
}
function axisLabel(n) {
  if (n === 0) return '$0'
  if (n >= 1e6) return `$${String(+(n / 1e6).toFixed(2)).replace('.', ',')} M`
  return `$${Math.round(n / 1000)} mil`
}

export default function HourlySalesChart({ data, tag, subtitle }) {
  const max = niceMax(Math.max(0, ...data.map((d) => d.amount)))
  const axis = [1, 0.75, 0.5, 0.25, 0].map((f) => axisLabel(max * f))
  const total = data.reduce((sum, d) => sum + d.amount, 0)
  const peak = data.reduce((best, d) => (d.amount > best.amount ? d : best), data[0])
  const share = total && peak ? Math.round((peak.amount / total) * 100) : 0
  const scope = tag === 'Hoy' ? 'de hoy' : tag === 'Ayer' ? 'de ayer' : 'del periodo'

  return (
    <Card title="Ventas por hora" subtitle={subtitle} action={<Badge tone="pink">{tag}</Badge>}>
      <div className="hourly">
        <div className="hourly__axis" aria-hidden="true">
          {axis.map((label, i) => <span key={`${label}-${i}`}>{label}</span>)}
        </div>
        <div className="hourly__plot">
          {data.map((d) => (
            <div key={d.hour} className="hourly__col">
              <div className="hourly__bar-area">
                <span className="hourly__value">{formatCOP(d.amount)}</span>
                <div className={`hourly__bar ${d === peak ? 'is-peak' : ''}`} style={{ height: `${(d.amount / max) * 100}%` }} />
              </div>
              <span className="hourly__hour">{d.hour}</span>
            </div>
          ))}
        </div>
      </div>
      {peak && total > 0 && (
        <p className="hourly__insight">
          <Icon name="trendUp" size={16} />
          La franja de {peak.hour} concentra el {share} % de las ventas {scope}.
        </p>
      )}
    </Card>
  )
}
