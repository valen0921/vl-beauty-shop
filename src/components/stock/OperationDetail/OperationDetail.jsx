import Card from '@/components/ui/Card/Card'
import Badge from '@/components/ui/Badge/Badge'
import { formatDelta } from '@/utils/format'
import './OperationDetail.css'

export default function OperationDetail({ operation }) {
  if (!operation) {
    return (
      <Card title="Detalle de operación seleccionada" subtitle="Selecciona una operación de la tabla para ver su detalle.">
        <p className="muted small">No hay ninguna operación seleccionada.</p>
      </Card>
    )
  }
  const { detail } = operation
  return (
    <Card
      title="Detalle de operación seleccionada"
      subtitle={`${operation.doc} · ${operation.origin} · ${operation.time}`}
      action={<Badge tone="success">{operation.result}</Badge>}
    >
      <dl className="op-detail__grid">
        {detail.fields.map(([label, value, accent]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className={accent ? 'link-pink' : ''}>{value}</dd>
          </div>
        ))}
      </dl>
      <h4 className="op-detail__title">{detail.listTitle}</h4>
      <ul className="op-detail__lines">
        {detail.lines.map((l) => (
          <li key={l.name}>
            <div>
              <strong>{l.name}</strong>
              <span>{l.meta}</span>
            </div>
            <div className="op-detail__qty">
              <strong className={l.units < 0 ? 'num-neg' : 'num-pos'}>{formatDelta(l.units)} ud.</strong>
              <span>Antes: {l.before} · Después: {l.after}</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
